import { get, set } from '@vercel/edge-config';
import { put } from '@vercel/blob';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    console.log('🔍 Testing Edge Config and Blob functionality...');
    
    const results = {
      timestamp: new Date().toISOString(),
      tests: {}
    };
    
    // Test 1: Edge Config Read
    try {
      console.log('📖 Testing Edge Config read...');
      const testData = await get('test-key');
      results.tests.edgeConfigRead = {
        success: true,
        data: testData,
        message: 'Edge Config read successful'
      };
    } catch (error) {
      console.error('❌ Edge Config read failed:', error);
      results.tests.edgeConfigRead = {
        success: false,
        error: error.message,
        message: 'Edge Config read failed'
      };
    }
    
    // Test 2: Edge Config Write
    try {
      console.log('📝 Testing Edge Config write...');
      const testValue = { test: 'data', timestamp: new Date().toISOString() };
      await set('test-key', testValue);
      results.tests.edgeConfigWrite = {
        success: true,
        message: 'Edge Config write successful'
      };
    } catch (error) {
      console.error('❌ Edge Config write failed:', error);
      results.tests.edgeConfigWrite = {
        success: false,
        error: error.message,
        message: 'Edge Config write failed'
      };
    }
    
    // Test 3: Blob Upload (with a simple test image)
    try {
      console.log('📤 Testing Blob upload...');
      const testImageData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
      const blob = await put('test-image.png', testImageData, {
        access: 'public',
        contentType: 'image/png'
      });
      results.tests.blobUpload = {
        success: true,
        url: blob.url,
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
    
    console.log('📊 Storage test results:', results);
    
    return res.status(200).json(results);
  } catch (error) {
    console.error('❌ Error in storage test:', error);
    return res.status(500).json({ 
      error: 'Failed to test storage functionality',
      details: error.message,
      stack: error.stack
    });
  }
}


