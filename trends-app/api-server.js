import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const app = express();
const PORT = 3003;

// Environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  console.error('SUPABASE_URL:', !!process.env.SUPABASE_URL);
  console.error('SUPABASE_SECRET_KEY:', !!process.env.SUPABASE_SECRET_KEY);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors());
app.use(express.json());

// Chat to Wall API
app.post('/api/chat-to-wall', async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    console.log('🤖 Chat to Wall - Processing question:', question);

    // Fetch all relevant data from database
    const [trendsResult, dashboardResult] = await Promise.all([
      supabase
        .from('trends_individual')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(20),
      
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

    const trends = trendsResult.data || [];
    const dashboard = dashboardResult.data?.[0] || null;

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
});

// Dashboard Data API
app.get('/api/dashboard-data', async (req, res) => {
  try {
    console.log('📊 Fetching dashboard data from database...');

    const { data: dashboardRecords, error } = await supabase
      .from('dashboard_insights')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('❌ Database error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    if (dashboardRecords && dashboardRecords.length > 0) {
      const latestData = dashboardRecords[0];
      console.log('✅ Returning dashboard data from database');

      return res.status(200).json({
        STATE_OF_WORLD: latestData.state_of_world,
        AI_INSIGHT: latestData.ai_insight,
        LIVE_SIGNALS: latestData.live_signals,
        BRAND_OPPORTUNITIES: latestData.brand_opportunities,
        COMPETITIVE_THREATS: latestData.competitive_threats,
        SIGNAL_TICKER: latestData.signal_ticker,
        generatedAt: latestData.created_at,
        source: 'dashboard-insights-db'
      });
    } else {
      console.log('⚠️ No dashboard data found in database, returning demo data');
      return res.status(200).json({
        STATE_OF_WORLD: {
          thesis: "Demo: The world is rapidly evolving with AI and digital transformation",
          velocitySpark: [10, 15, 25, 40, 60, 85, 120, 180, 250, 350],
          movers: [
            { name: "AI Integration", deltaPercent: 45 },
            { name: "Digital Privacy", deltaPercent: -12 },
            { name: "Remote Work", deltaPercent: 23 }
          ]
        },
        AI_INSIGHT: {
          headline: "Demo: AI is reshaping consumer behavior",
          insight: "Artificial intelligence is fundamentally changing how consumers interact with brands and make purchasing decisions.",
          implications: ["Personalization at scale", "Predictive analytics", "Automated customer service"]
        },
        LIVE_SIGNALS: [
          {
            title: "Demo: Major tech company launches AI product",
            description: "A leading technology company has announced a new AI-powered product that could revolutionize the industry.",
            date: "2025-08-18",
            impact: "high",
            category: "technology"
          }
        ],
        BRAND_OPPORTUNITIES: [
          {
            title: "Demo: AI-Powered Personalization",
            description: "Leverage AI to create hyper-personalized customer experiences",
            potential: "high",
            timeframe: "6-12 months"
          }
        ],
        COMPETITIVE_THREATS: [
          {
            title: "Demo: New AI Competitor",
            description: "A new AI-powered competitor is entering the market",
            severity: "medium",
            timeframe: "3-6 months"
          }
        ],
        SIGNAL_TICKER: [
          "Demo: AI trends accelerating",
          "Demo: Digital transformation continues",
          "Demo: Consumer behavior shifting"
        ],
        generatedAt: new Date().toISOString(),
        source: 'demo-data'
      });
    }
  } catch (error) {
    console.error('❌ Dashboard data error:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

app.post('/api/dashboard-data', async (req, res) => {
  try {
    let dataToStore = req.body;
    
    if (Array.isArray(req.body) && req.body.length > 0) {
      if (req.body[0].output) {
        dataToStore = req.body[0].output;
      } else if (req.body[0].json && req.body[0].json.output) {
        dataToStore = req.body[0].json.output;
      }
    }

    console.log('📊 Storing dashboard data to database...');

    const { data: recentRecords } = await supabase
      .from('dashboard_insights')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(3);

    if (recentRecords && recentRecords.length >= 3) {
      const oldestToKeep = recentRecords[2].id;
      const { error: deleteError } = await supabase
        .from('dashboard_insights')
        .delete()
        .lt('id', oldestToKeep);

      if (deleteError) {
        console.error('❌ Error deleting old records:', deleteError);
        return res.status(500).json({ error: 'Database error' });
      }
    }

    const { data, error } = await supabase
      .from('dashboard_insights')
      .insert({
        state_of_world: dataToStore.STATE_OF_WORLD,
        ai_insight: dataToStore.AI_INSIGHT,
        live_signals: dataToStore.LIVE_SIGNALS,
        brand_opportunities: dataToStore.BRAND_OPPORTUNITIES,
        competitive_threats: dataToStore.COMPETITIVE_THREATS,
        signal_ticker: dataToStore.SIGNAL_TICKER,
        is_active: true
      })
      .select();

    if (error) {
      console.error('❌ Database error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    console.log('✅ Dashboard data saved to database');
    return res.status(200).json({ success: true, message: 'Dashboard data saved to database' });

  } catch (error) {
    console.error('❌ Dashboard data error:', error);
    return res.status(500).json({ error: 'Failed to store dashboard data' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
  console.log(`🤖 Chat to Wall API: http://localhost:${PORT}/api/chat-to-wall`);
  console.log(`📊 Dashboard API: http://localhost:${PORT}/api/dashboard-data`);
});
