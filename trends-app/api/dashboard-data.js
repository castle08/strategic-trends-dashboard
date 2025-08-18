// trends-app/api/dashboard-data.js
let latestDashboardData = null;

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
      
      latestDashboardData = dataToStore;
      console.log('✅ Dashboard data stored in memory:', JSON.stringify(dataToStore, null, 2));
      return res.status(200).json({ success: true, message: 'Dashboard data stored' });
    } catch (error) {
      console.error('Error storing dashboard data:', error);
      return res.status(500).json({ error: 'Failed to store dashboard data' });
    }
  }
  
  // Handle GET requests (retrieve dashboard data)
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Return stored data or demo data
    console.log('Latest dashboard data:', latestDashboardData);
    console.log('Data type:', typeof latestDashboardData);
    console.log('Data keys:', latestDashboardData ? Object.keys(latestDashboardData) : 'null');
    
    if (latestDashboardData && typeof latestDashboardData === 'object' && Object.keys(latestDashboardData).length > 0) {
      console.log('Returning live data');
      return res.status(200).json(latestDashboardData);
    } else {
      console.log('Returning demo data');
      return res.status(200).json({
        STATE_OF_WORLD: {
          thesis: "Dashboard insights are generated on-demand from current trends",
          velocityPercent: 0,
          velocitySpark: [0, 0, 0, 0, 0, 0, 0, 0],
          movers: []
        },
        AI_INSIGHT: {
          title: "Dashboard analysis runs when trends are updated",
          bullets: ["Insights are generated fresh each time", "No database storage needed"]
        },
        SIGNAL_TICKER: ["Dashboard data generated on-demand"],
        BRAND_OPPORTUNITIES: [],
        COMPETITIVE_THREATS: []
      });
    }

  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
