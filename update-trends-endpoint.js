#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import express from 'express';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json({ limit: '10mb' }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Endpoint for N8N to POST trends data
app.post('/api/update-trends', (req, res) => {
  try {
    const trendsData = req.body;
    
    if (!trendsData || !trendsData.trends) {
      return res.status(400).json({ error: 'Invalid trends data format' });
    }

    console.log(`📊 Updating trends data with ${trendsData.trends.length} trends...`);

    // Update both app files simultaneously
    const filePaths = [
      'apps/screens-app/public/trends/latest.json',
      'apps/three-dashboard/public/trends/latest.json'
    ];

    const jsonString = JSON.stringify(trendsData, null, 2);

    filePaths.forEach(filePath => {
      try {
        const fullPath = path.resolve(filePath);
        const dir = path.dirname(fullPath);
        
        // Ensure directory exists
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(fullPath, jsonString);
        console.log(`✅ Updated: ${filePath}`);
      } catch (error) {
        console.error(`❌ Failed to update ${filePath}:`, error.message);
      }
    });

    res.status(200).json({ 
      success: true, 
      message: `Updated ${filePaths.length} files with ${trendsData.trends.length} trends`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error updating trends:', error);
    res.status(500).json({ error: 'Failed to update trends data' });
  }
});

// Root endpoint with basic info
app.get('/', (req, res) => {
  res.json({ 
    message: 'Trends Update Endpoint', 
    endpoints: {
      health: 'GET /api/health',
      update: 'POST /api/update-trends'
    },
    timestamp: new Date().toISOString() 
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Trends update endpoint running on http://localhost:${PORT}`);
  console.log(`📝 N8N can POST to: http://localhost:${PORT}/api/update-trends`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});