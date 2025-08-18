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
      latestDashboardData = req.body;
      console.log('✅ Dashboard data stored in memory');
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
    if (latestDashboardData) {
      return res.status(200).json(latestDashboardData);
    } else {
      return res.status(200).json({
        stateOfWorld: {
          thesis: "Dashboard insights are generated on-demand from current trends",
          velocity: [0, 0, 0, 0, 0, 0, 0, 0],
          movers: []
        },
        aiInsight: {
          title: "Dashboard analysis runs when trends are updated",
          bullets: ["Insights are generated fresh each time", "No database storage needed"]
        },
        liveSignals: ["Dashboard data generated on-demand"],
        opportunities: [],
        threats: []
      });
    }

  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
