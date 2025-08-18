// trends-app/api/chat-to-wall.js
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    console.log('🤖 Chat to Wall - Processing question:', question);

    // Fetch all relevant data from database
    const [trendsResult, dashboardResult] = await Promise.all([
      // Get latest trends
      supabase
        .from('trends_individual')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(20),
      
      // Get latest dashboard insights
      supabase
        .from('dashboard_insights')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
    ]);

    if (trendsResult.error) {
      console.error('❌ Error fetching trends:', trendsResult.error);
      return res.status(500).json({ error: 'Database error' });
    }

    if (dashboardResult.error) {
      console.error('❌ Error fetching dashboard:', dashboardResult.error);
      return res.status(500).json({ error: 'Database error' });
    }

    // Prepare context data
    const trends = trendsResult.data || [];
    const dashboard = dashboardResult.data?.[0] || null;

    // Create context for AI
    const context = {
      trends: trends.map(t => ({
        title: t.title,
        category: t.category,
        summary: t.summary,
        scores: t.scores,
        tags: t.tags,
        whyItMatters: t.why_it_matters,
        brandAngles: t.brand_angles,
        exampleUseCases: t.example_use_cases
      })),
      dashboard: dashboard ? {
        stateOfWorld: dashboard.state_of_world,
        aiInsight: dashboard.ai_insight,
        brandOpportunities: dashboard.brand_opportunities,
        competitiveThreats: dashboard.competitive_threats,
        liveSignals: dashboard.live_signals,
        signalTicker: dashboard.signal_ticker
      } : null
    };

    // Create AI prompt
    const prompt = `You are the "Wall" - an AI assistant with access to real-time trend data and strategic insights. You can see all the trends, dashboard insights, and strategic analysis.

CONTEXT DATA:
${JSON.stringify(context, null, 2)}

USER QUESTION: ${question}

INSTRUCTIONS:
- Answer based on the actual data provided above
- Be strategic and actionable
- Reference specific trends, insights, or data points
- Keep responses concise but insightful
- If the question can't be answered with the available data, say so clearly
- Use a professional but conversational tone

RESPONSE:`;

    // Get AI response
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Chat to Wall - Response generated');

    return res.status(200).json({
      answer: text,
      context: {
        trendsCount: trends.length,
        hasDashboard: !!dashboard,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Chat to Wall error:', error);
    return res.status(500).json({ 
      error: 'Failed to process question',
      details: error.message 
    });
  }
}
