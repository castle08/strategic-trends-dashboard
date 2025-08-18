// trends-app/api/dashboard-data.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Add CORS headers for local development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle POST requests (store dashboard data)
  if (req.method === 'POST') {
    try {
      // Handle n8n array format: [{ output: {...} }] or [{ json: { output: {...} } }]
      let dataToStore;
      
      if (Array.isArray(req.body) && req.body.length > 0) {
        // n8n array format
        const firstItem = req.body[0];
        if (firstItem.json && firstItem.json.output) {
          dataToStore = firstItem.json.output;
        } else if (firstItem.output) {
          dataToStore = firstItem.output;
        } else {
          dataToStore = firstItem;
        }
      } else if (req.body.output) {
        // Direct object with output wrapper
        dataToStore = req.body.output;
      } else {
        // Direct object format
        dataToStore = req.body;
      }
      
      console.log('📊 Storing dashboard data to database...');
      
      // First, get the IDs of the last 3 records to keep
      const { data: recentRecords } = await supabase
        .from('dashboard_insights')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(3);
      
      // Delete records older than the last 3 (keep safety net)
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
      
      // Insert new dashboard data
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
      console.error('Error saving dashboard data:', error);
      return res.status(500).json({ error: 'Failed to save dashboard data' });
    }
  }
  
  // Handle GET requests (retrieve dashboard data)
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📊 Fetching dashboard data from database...');
    
    // Get the latest dashboard data (there should only be one record now)
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
          thesis: "Dashboard insights are generated on-demand from current trends",
          velocityPercent: 0,
          velocitySpark: [0, 0, 0, 0, 0, 0, 0, 0],
          movers: []
        },
        AI_INSIGHT: {
          title: "Dashboard analysis runs when trends are updated",
          bullets: ["Insights are generated fresh each time", "Database storage ready"]
        },
        SIGNAL_TICKER: ["Dashboard data generated on-demand"],
        BRAND_OPPORTUNITIES: [],
        COMPETITIVE_THREATS: []
      });
    }

  } catch (error) {
    console.error('Error reading dashboard data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
