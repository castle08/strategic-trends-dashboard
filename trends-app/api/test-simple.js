export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    console.log('🔍 Testing basic Edge Config import...');
    
    // Test if we can import Edge Config
    let edgeConfigImport = '❌ Failed';
    try {
      const { get, set } = await import('@vercel/edge-config');
      edgeConfigImport = '✅ Success';
      console.log('✅ Edge Config import successful');
    } catch (error) {
      console.error('❌ Edge Config import failed:', error);
      edgeConfigImport = `❌ Failed: ${error.message}`;
    }
    
    // Test if we can import Blob
    let blobImport = '❌ Failed';
    try {
      const { put } = await import('@vercel/blob');
      blobImport = '✅ Success';
      console.log('✅ Blob import successful');
    } catch (error) {
      console.error('❌ Blob import failed:', error);
      blobImport = `❌ Failed: ${error.message}`;
    }
    
    const result = {
      timestamp: new Date().toISOString(),
      edgeConfigImport,
      blobImport,
      environment: {
        edgeConfig: process.env.EDGE_CONFIG ? '✅ Present' : '❌ Missing',
        blobToken: process.env.BLOB_READ_WRITE_TOKEN ? '✅ Present' : '❌ Missing'
      }
    };
    
    console.log('📊 Import test results:', result);
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('❌ Error in import test:', error);
    return res.status(500).json({ 
      error: 'Failed to test imports',
      details: error.message,
      stack: error.stack
    });
  }
}


