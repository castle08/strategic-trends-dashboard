import fs from 'fs';
import path from 'path';

// File path for persistent storage
const TRENDS_FILE_PATH = path.join(process.cwd(), 'public', 'trends', 'latest.json');

// Validation function to ensure data quality
function validateTrendsData(data) {
  if (!data || typeof data !== 'object') {
    console.log('❌ Invalid data: not an object');
    return false;
  }
  
  if (!Array.isArray(data.trends)) {
    console.log('❌ Invalid data: trends is not an array');
    return false;
  }
  
  if (data.trends.length < 5) {
    console.log('❌ Invalid data: too few trends (minimum 5)');
    return false;
  }
  
  // Check first trend has required fields
  const firstTrend = data.trends[0];
  if (!firstTrend || !firstTrend.title || !firstTrend.category || !firstTrend.scores) {
    console.log('❌ Invalid data: first trend missing required fields');
    return false;
  }
  
  console.log('✅ Data validation passed');
  return true;
}

// Read trends from file
function readTrendsFromFile() {
  try {
    if (fs.existsSync(TRENDS_FILE_PATH)) {
      const fileContent = fs.readFileSync(TRENDS_FILE_PATH, 'utf8');
      const data = JSON.parse(fileContent);
      console.log('📖 Read trends from file:', data.trends?.length || 0);
      return data;
    }
  } catch (error) {
    console.error('❌ Error reading trends file:', error);
  }
  return null;
}

// Write trends to file
function writeTrendsToFile(data) {
  try {
    // Ensure directory exists
    const dir = path.dirname(TRENDS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write to file
    fs.writeFileSync(TRENDS_FILE_PATH, JSON.stringify(data, null, 2));
    console.log('💾 Wrote trends to file:', data.trends?.length || 0);
    return true;
  } catch (error) {
    console.error('❌ Error writing trends file:', error);
    return false;
  }
}

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    // N8N posts trends data here
    try {
      console.log('📥 Received POST data keys:', Object.keys(req.body || {}));
      console.log('📊 Trends count:', req.body?.trends?.length || 0);
      
      // Validate the incoming data
      if (!validateTrendsData(req.body)) {
        console.log('❌ Data validation failed - not saving');
        return res.status(400).json({ 
          error: 'Invalid trends data - validation failed',
          receivedTrends: req.body?.trends?.length || 0
        });
      }
      
      // Save to file for persistence
      const writeSuccess = writeTrendsToFile(req.body);
      if (!writeSuccess) {
        console.log('❌ Failed to write to file');
        return res.status(500).json({ error: 'Failed to save trends data' });
      }
      
      console.log('✅ Trends data updated and saved to file');
      
      return res.status(200).json({ 
        success: true, 
        message: 'Trends updated and saved',
        receivedTrends: req.body.trends.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error updating trends:', error);
      return res.status(500).json({ error: 'Failed to update trends' });
    }
  }

  if (req.method === 'GET') {
    // Dashboard fetches trends data here
    try {
      // Read from file (persistent storage)
      const trendsData = readTrendsFromFile();
      
      console.log('🔍 GET request - trendsData exists:', !!trendsData);
      console.log('🔍 Trends count:', trendsData?.trends?.length || 0);
      
      if (!trendsData) {
        console.log('❌ No trends data available in file');
        return res.status(404).json({ 
          error: 'No trends data available',
          debug: {
            hasData: false,
            dataType: typeof trendsData
          }
        });
      }
      
      console.log('✅ Returning trends data from file');
      return res.status(200).json(trendsData);
    } catch (error) {
      console.error('❌ Error in GET request:', error);
      return res.status(500).json({ error: 'Failed to load trends data' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}