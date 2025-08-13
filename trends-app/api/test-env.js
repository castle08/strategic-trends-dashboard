export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    console.log('🔍 Testing environment variables...');
    
    const edgeConfig = process.env.EDGE_CONFIG;
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    
    const result = {
      edgeConfig: edgeConfig ? '✅ Present' : '❌ Missing',
      blobToken: blobToken ? '✅ Present' : '❌ Missing',
      edgeConfigLength: edgeConfig ? edgeConfig.length : 0,
      blobTokenLength: blobToken ? blobToken.length : 0,
      timestamp: new Date().toISOString()
    };
    
    console.log('📊 Environment check result:', result);
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('❌ Error testing environment:', error);
    return res.status(500).json({ 
      error: 'Failed to test environment variables',
      details: error.message 
    });
  }
}
