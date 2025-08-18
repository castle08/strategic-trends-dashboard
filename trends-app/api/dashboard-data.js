// trends-app/api/dashboard-data.js
import fs from 'fs';
import path from 'path';

const DASHBOARD_DATA_FILE = path.join(process.cwd(), 'public', 'trends', 'dashboard.json');

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
      
      // Save to JSON file
      const dataWithTimestamp = {
        ...dataToStore,
        generatedAt: new Date().toISOString()
      };
      
      // Ensure directory exists
      const dir = path.dirname(DASHBOARD_DATA_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(DASHBOARD_DATA_FILE, JSON.stringify(dataWithTimestamp, null, 2));
      console.log('✅ Dashboard data saved to JSON file:', DASHBOARD_DATA_FILE);
      return res.status(200).json({ success: true, message: 'Dashboard data saved to file' });
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
    // Try to read from JSON file
    if (fs.existsSync(DASHBOARD_DATA_FILE)) {
      const fileData = fs.readFileSync(DASHBOARD_DATA_FILE, 'utf8');
      const dashboardData = JSON.parse(fileData);
      console.log('✅ Returning dashboard data from JSON file');
      return res.status(200).json(dashboardData);
    } else {
      console.log('⚠️ No dashboard JSON file found, returning demo data');
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
    console.error('Error reading dashboard data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
