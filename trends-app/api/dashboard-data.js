// Dashboard Data API - Read-only access to trends database
// This endpoint provides aggregated data for the dashboard without modifying the database

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all trends from the database
    const { data: trendsData, error: trendsError } = await supabase
      .from('trends')
      .select('*')
      .order('lastupdated', { ascending: false })
      .limit(1)
      .single();

    if (trendsError) {
      console.error('Error fetching trends:', trendsError);
      return res.status(500).json({ error: 'Failed to fetch trends' });
    }

    // Extract trends from the stored data
    const trends = trendsData?.trends || [];

    if (trendsError) {
      console.error('Error fetching trends:', trendsError);
      return res.status(500).json({ error: 'Failed to fetch trends' });
    }

    // Calculate key metrics
    const totalTrends = trends.length;
    const avgConfidence = trends.length > 0 
      ? Math.round(trends.reduce((sum, t) => sum + (t.scores?.confidence || 0), 0) / trends.length)
      : 0;

    // Calculate industry impact (aggregate by category for now)
    const categoryImpact = {};
    trends.forEach(trend => {
      const category = trend.category || 'Other';
      if (!categoryImpact[category]) {
        categoryImpact[category] = {
          count: 0,
          totalConfidence: 0,
          totalRelevance: 0
        };
      }
      categoryImpact[category].count++;
      categoryImpact[category].totalConfidence += trend.scores?.confidence || 0;
      categoryImpact[category].totalRelevance += trend.scores?.relevance || 0;
    });

    // Convert to industry impact format
    const industryImpact = Object.entries(categoryImpact).map(([category, data]) => ({
      industry: category,
      score: Math.round((data.totalConfidence * data.totalRelevance) / (data.count * 100)),
      trend: `+${Math.floor(Math.random() * 15) + 3}%`, // Placeholder - would calculate from historical data
      description: getCategoryDescription(category)
    })).sort((a, b) => b.score - a.score).slice(0, 5);

    // Calculate top accelerators (trends with highest momentum)
    const topAccelerators = trends
      .map(trend => ({
        title: trend.title,
        momentum: trend.scores?.velocity || 0,
        lastSignal: trend.publishedAt || trend.created_at,
        category: trend.category
      }))
      .sort((a, b) => b.momentum - a.momentum)
      .slice(0, 3);

    // Generate "So What?" surfaces based on trends
    const soWhatSurfaces = generateSoWhatSurfaces(trends);

    // Calculate risk trends (trends with high confidence but low momentum)
    const riskTrends = trends
      .filter(trend => (trend.scores?.confidence || 0) > 70 && (trend.scores?.velocity || 0) < 60)
      .map(trend => ({
        title: trend.title,
        confidence: trend.scores?.confidence || 0,
        momentum: trend.scores?.velocity || 0,
        risk: trend.scores?.confidence > 80 ? 'High' : 'Medium',
        counterSignal: generateCounterSignal(trend)
      }))
      .slice(0, 3);

    // Generate opportunities from brand angles
    const opportunities = generateOpportunities(trends);

    // Audience insights (placeholder - would need audience data)
    const audienceInsights = [
      {
        audience: "Gen Z",
        insight: "Ethical shopping is non-negotiable",
        opportunity: "Authentic micro-influencer partnerships",
        risk: "Greenwashing backlash",
        color: "from-purple-500 to-pink-500"
      },
      {
        audience: "Millennials",
        insight: "Convenience + sustainability = winning combo",
        opportunity: "Refill-for-loyalty programs",
        risk: "Premium pricing fatigue",
        color: "from-blue-500 to-cyan-500"
      },
      {
        audience: "Parents",
        insight: "Time-saving tech is worth paying for",
        opportunity: "Family-focused automation",
        risk: "Screen time guilt",
        color: "from-green-500 to-emerald-500"
      }
    ];

    const dashboardData = {
      totalTrends,
      avgConfidence,
      signalFreshness: 89, // Placeholder - would calculate from signal dates
      coverageDepth: 3.2, // Placeholder - would calculate from signals per trend
      momentumIndex: 82, // Placeholder - would calculate EMA
      topAccelerators,
      industryImpact,
      audienceInsights,
      riskTrends,
      opportunities,
      soWhatSurfaces,
      generatedAt: new Date().toISOString()
    };

    res.status(200).json(dashboardData);

  } catch (error) {
    console.error('Dashboard API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

function getCategoryDescription(category) {
  const descriptions = {
    "Technology": "AI integration, privacy-first design, voice interfaces",
    "Consumer Behaviour": "Shopping patterns, lifestyle changes, digital adoption",
    "Creativity": "Content creation, design trends, artistic expression",
    "Retail": "AI personalization, voice commerce, AR try-ons",
    "Marketing": "Campaign strategies, channel optimization, audience targeting",
    "Social Media": "Platform changes, content formats, engagement patterns",
    "Sustainability": "Eco-friendly practices, circular economy, green tech"
  };
  return descriptions[category] || "Emerging trends and consumer shifts";
}

function generateSoWhatSurfaces(trends) {
  const surfaces = [];
  
  // Find high-momentum trends for opportunities
  const highMomentumTrends = trends
    .filter(t => (t.scores?.velocity || 0) > 75)
    .slice(0, 2);

  highMomentumTrends.forEach(trend => {
    surfaces.push({
      type: "opportunity",
      headline: `${trend.title} is accelerating → ${generateOpportunityAction(trend)}`,
      impact: "High",
      timeframe: "1-3 months"
    });
  });

  // Find high-confidence, low-momentum trends for risks
  const riskTrends = trends
    .filter(t => (t.scores?.confidence || 0) > 80 && (t.scores?.velocity || 0) < 50)
    .slice(0, 1);

  riskTrends.forEach(trend => {
    surfaces.push({
      type: "risk",
      headline: `${trend.title} is stalling → ${generateRiskAction(trend)}`,
      impact: "High",
      timeframe: "Immediate"
    });
  });

  return surfaces;
}

function generateOpportunityAction(trend) {
  const actions = [
    "launch pilot program now",
    "build authentic partnerships",
    "implement sustainable solutions",
    "create immersive experiences",
    "develop privacy-first approach"
  ];
  return actions[Math.floor(Math.random() * actions.length)];
}

function generateRiskAction(trend) {
  const actions = [
    "shift to contextual alternatives",
    "focus on transparency and trust",
    "adopt local sourcing strategies",
    "implement product passports",
    "build authentic creator networks"
  ];
  return actions[Math.floor(Math.random() * actions.length)];
}

function generateCounterSignal(trend) {
  const counterSignals = [
    "Contextual targeting alternatives emerging",
    "Privacy-first design becoming competitive advantage",
    "Local sourcing and 3D printing gaining traction",
    "Authentic partnerships outperforming traditional ads",
    "Sustainable alternatives gaining market share"
  ];
  return counterSignals[Math.floor(Math.random() * counterSignals.length)];
}

function generateOpportunities(trends) {
  const opportunities = [];
  
  // Extract opportunities from brand angles
  trends.forEach(trend => {
    if (trend.brandAngles && trend.brandAngles.length > 0) {
      opportunities.push({
        title: trend.brandAngles[0],
        roi: Math.random() > 0.5 ? "High" : "Medium",
        feasibility: Math.random() > 0.5 ? "High" : "Medium",
        description: `Based on trend: ${trend.title}`
      });
    }
  });

  return opportunities.slice(0, 3);
}
