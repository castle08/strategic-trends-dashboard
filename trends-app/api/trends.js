import fs from 'fs';
import path from 'path';

// File path for persistent storage - use /tmp for Vercel serverless functions
const TRENDS_FILE_PATH = process.env.VERCEL 
  ? path.join('/tmp', 'trends-latest.json')
  : path.join(process.cwd(), 'public', 'trends', 'latest.json');

// Enhanced validation function to ensure data quality
function validateTrendsData(data) {
  console.log('🔍 Starting data validation...');
  
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
  
  // Check each trend has required fields
  for (let i = 0; i < data.trends.length; i++) {
    const trend = data.trends[i];
    
    // Required fields
    if (!trend.id || !trend.title || !trend.category || !trend.summary) {
      console.log(`❌ Invalid data: trend ${i} missing required fields (id, title, category, summary)`);
      return false;
    }
    
    // Check scores structure
    if (!trend.scores || typeof trend.scores.total !== 'number') {
      console.log(`❌ Invalid data: trend ${i} missing valid scores`);
      return false;
    }
    
    // Check creative structure
    if (!trend.creative || !trend.creative.imagePrompt) {
      console.log(`❌ Invalid data: trend ${i} missing creative.imagePrompt`);
      return false;
    }
    
    // Check viz structure
    if (!trend.viz || typeof trend.viz.size !== 'number') {
      console.log(`❌ Invalid data: trend ${i} missing valid viz data`);
      return false;
    }
  }
  
  console.log('✅ Data validation passed');
  return true;
}

// Enhanced validation to prevent overwriting with empty data
function shouldOverwriteExistingData(newData, existingData) {
  console.log('🔍 Checking if we should overwrite existing data...');
  
  // If no existing data, always accept new data
  if (!existingData) {
    console.log('✅ No existing data - accepting new data');
    return true;
  }
  
  // If new data is clearly better (has imageUrl fields), accept it
  const newDataHasImages = newData.trends.some(trend => trend.creative?.imageUrl);
  const existingDataHasImages = existingData.trends.some(trend => trend.creative?.imageUrl);
  
  if (newDataHasImages && !existingDataHasImages) {
    console.log('✅ New data has images, existing data doesn\'t - accepting new data');
    return true;
  }
  
  // If new data is more recent (within last 24 hours), accept it
  const newGeneratedAt = new Date(newData.generatedAt);
  const existingGeneratedAt = new Date(existingData.generatedAt);
  const hoursDiff = (newGeneratedAt - existingGeneratedAt) / (1000 * 60 * 60);
  
  if (hoursDiff > 0 && hoursDiff < 24) {
    console.log(`✅ New data is ${hoursDiff.toFixed(1)} hours newer - accepting new data`);
    return true;
  }
  
  // If new data has more trends, accept it
  if (newData.trends.length > existingData.trends.length) {
    console.log(`✅ New data has more trends (${newData.trends.length} vs ${existingData.trends.length}) - accepting new data`);
    return true;
  }
  
  console.log('❌ New data doesn\'t meet overwrite criteria - keeping existing data');
  return false;
}

// Read trends from file
function readTrendsFromFile() {
  try {
    console.log('📁 Attempting to read from:', TRENDS_FILE_PATH);
    if (fs.existsSync(TRENDS_FILE_PATH)) {
      const fileContent = fs.readFileSync(TRENDS_FILE_PATH, 'utf8');
      const data = JSON.parse(fileContent);
      console.log('📖 Read trends from file:', data.trends?.length || 0);
      return data;
    } else {
      console.log('📁 File does not exist:', TRENDS_FILE_PATH);
    }
  } catch (error) {
    console.error('❌ Error reading trends file:', error);
  }
  return null;
}

// Write trends to file with enhanced error handling
function writeTrendsToFile(data) {
  try {
    console.log('📁 Attempting to write to:', TRENDS_FILE_PATH);
    
    // Ensure directory exists (only for non-Vercel environments)
    if (!process.env.VERCEL) {
      const dir = path.dirname(TRENDS_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
    
    // Write to file
    const jsonData = JSON.stringify(data, null, 2);
    fs.writeFileSync(TRENDS_FILE_PATH, jsonData);
    console.log('💾 Successfully wrote trends to file:', data.trends?.length || 0);
    return true;
  } catch (error) {
    console.error('❌ Error writing trends file:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      path: TRENDS_FILE_PATH,
      isVercel: !!process.env.VERCEL
    });
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
      
      // Check if we should overwrite existing data
      const existingData = readTrendsFromFile();
      if (!shouldOverwriteExistingData(req.body, existingData)) {
        console.log('❌ Not overwriting existing data - keeping current data');
        return res.status(200).json({ 
          success: true, 
          message: 'Data not updated - existing data is better or more recent',
          existingTrends: existingData?.trends?.length || 0,
          newTrends: req.body.trends.length,
          timestamp: new Date().toISOString()
        });
      }
      
      // Save to file for persistence
      const writeSuccess = writeTrendsToFile(req.body);
      if (!writeSuccess) {
        console.log('❌ Failed to write to file');
        return res.status(500).json({ 
          error: 'Failed to save trends data',
          debug: {
            filePath: TRENDS_FILE_PATH,
            isVercel: !!process.env.VERCEL,
            dataSize: JSON.stringify(req.body).length
          }
        });
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
      return res.status(500).json({ 
        error: 'Failed to update trends',
        details: error.message
      });
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
            dataType: typeof trendsData,
            filePath: TRENDS_FILE_PATH
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