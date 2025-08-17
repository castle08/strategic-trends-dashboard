import { get, set } from '@vercel/edge-config';
import { put } from '@vercel/blob';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    console.log('🔍 Testing trends API logic...');
    
    const results = {
      timestamp: new Date().toISOString(),
      tests: {}
    };
    
    // Test 1: Read from Edge Config (like readTrendsFromEdgeConfig)
    try {
      console.log('📖 Testing Edge Config read (trends-latest)...');
      const trendsData = await get('trends-latest');
      results.tests.readTrends = {
        success: true,
        hasData: !!trendsData,
        dataType: typeof trendsData,
        message: 'Edge Config read successful'
      };
    } catch (error) {
      console.error('❌ Edge Config read failed:', error);
      results.tests.readTrends = {
        success: false,
        error: error.message,
        message: 'Edge Config read failed'
      };
    }
    
    // Test 2: Write to Edge Config (like writeTrendsToEdgeConfig)
    try {
      console.log('📝 Testing Edge Config write...');
      const testData = {
        trends: [
          {
            id: 'TEST001',
            title: 'Test Trend',
            category: 'test',
            summary: 'Test summary',
            scores: { total: 100 },
            creative: { imagePrompt: 'test prompt' },
            viz: { size: 1 }
          }
        ],
        generatedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        storageType: 'vercel-edge-config',
        version: '1.0'
      };
      
      await set('trends-latest', testData);
      results.tests.writeTrends = {
        success: true,
        message: 'Edge Config write successful'
      };
    } catch (error) {
      console.error('❌ Edge Config write failed:', error);
      results.tests.writeTrends = {
        success: false,
        error: error.message,
        message: 'Edge Config write failed'
      };
    }
    
    // Test 3: Blob upload (like downloadAndUploadImage)
    try {
      console.log('📤 Testing Blob upload...');
      const testImageData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `TEST001-${timestamp}.png`;
      
      const blob = await put(filename, testImageData, {
        access: 'public',
        contentType: 'image/png'
      });
      
      results.tests.blobUpload = {
        success: true,
        url: blob.url,
        filename: filename,
        message: 'Blob upload successful'
      };
    } catch (error) {
      console.error('❌ Blob upload failed:', error);
      results.tests.blobUpload = {
        success: false,
        error: error.message,
        message: 'Blob upload failed'
      };
    }
    
    console.log('📊 Trends logic test results:', results);
    
    return res.status(200).json(results);
  } catch (error) {
    console.error('❌ Error in trends logic test:', error);
    return res.status(500).json({ 
      error: 'Failed to test trends logic',
      details: error.message,
      stack: error.stack
    });
  }
}


