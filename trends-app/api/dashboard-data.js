// Dashboard Data API - Read-only access to trends database
// This endpoint provides aggregated data for the dashboard without modifying the database

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  // Add CORS headers for local development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch dashboard data from the dashboard_data table
    const { data: dashboardData, error } = await supabase
      .from('dashboard_data')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching dashboard data:', error);
      return res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }

    // If no dashboard data exists, return empty structure
    if (!dashboardData || dashboardData.length === 0) {
      return res.status(200).json({
        stateOfWorld: {
          thesis: "No dashboard data available yet",
          velocity: [0, 0, 0, 0, 0, 0, 0, 0],
          movers: []
        },
        aiInsight: {
          title: "Dashboard analysis pending",
          bullets: ["Waiting for dashboard analyst to process trends"]
        },
        liveSignals: ["Dashboard data not yet generated"],
        opportunities: [],
        threats: []
      });
    }

    // Return the most recent dashboard data
    const latestDashboard = dashboardData[0];
    
    res.status(200).json({
      stateOfWorld: latestDashboard.state_of_world,
      aiInsight: latestDashboard.ai_insight,
      liveSignals: latestDashboard.live_signals,
      opportunities: latestDashboard.opportunities,
      threats: latestDashboard.threats,
      lastUpdated: latestDashboard.created_at
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
