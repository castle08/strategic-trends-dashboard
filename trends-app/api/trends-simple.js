export default async function handler(req, res) {
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
      
      // Simple validation
      if (!req.body || !Array.isArray(req.body.trends)) {
        console.log('❌ Invalid data: missing trends array');
        return res.status(400).json({ 
          error: 'Invalid trends data - missing trends array',
          receivedTrends: 0
        });
      }
      
      if (req.body.trends.length < 5) {
        console.log('❌ Invalid data: too few trends (minimum 5)');
        return res.status(400).json({ 
          error: 'Invalid trends data - too few trends (minimum 5)',
          receivedTrends: req.body.trends.length
        });
      }
      
      console.log('✅ Data validation passed');
      
      // For now, just return success without storing
      console.log('✅ Trends data received and validated');
      
      return res.status(200).json({ 
        success: true, 
        message: 'Trends received and validated (simple mode)',
        receivedTrends: req.body.trends.length,
        processedTrends: req.body.trends.length,
        timestamp: new Date().toISOString(),
        note: 'Storage not implemented yet - this is a test endpoint'
      });
    } catch (error) {
      console.error('❌ Error processing trends:', error);
      return res.status(500).json({ 
        error: 'Failed to process trends',
        details: error.message
      });
    }
  }

  if (req.method === 'GET') {
    // Dashboard fetches trends data here
    try {
      console.log('🔍 GET request - returning test data');
      
      // Return test data for now
      const testData = {
        trends: [
          {
            id: 'TEST001',
            title: 'Test Trend - Simple Mode',
            category: 'test',
            summary: 'This is test data from the simple API endpoint',
            scores: { total: 100 },
            creative: { 
              imagePrompt: 'test prompt',
              imageUrl: 'https://picsum.photos/400/300'
            },
            viz: { size: 1 }
          }
        ],
        generatedAt: new Date().toISOString(),
        storageType: 'simple-test',
        version: '1.0'
      };
      
      return res.status(200).json(testData);
    } catch (error) {
      console.error('❌ Error in GET request:', error);
      return res.status(500).json({ error: 'Failed to load trends data' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}


