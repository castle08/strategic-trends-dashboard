import { kv } from '@vercel/kv';
import { put } from '@vercel/blob';
import fs from 'fs';
import path from 'path';

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
  
  // Force override if explicitly requested (for testing/debugging)
  if (newData.forceOverride === true) {
    console.log('✅ Force override requested - accepting new data');
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
  
  console.log(`📊 Time comparison: new=${newGeneratedAt.toISOString()}, existing=${existingGeneratedAt.toISOString()}, diff=${hoursDiff.toFixed(1)} hours`);
  
  // For development, always accept newer data (even by minutes)
  if (hoursDiff > 0) {
    console.log(`✅ New data is ${hoursDiff.toFixed(1)} hours newer - accepting new data (development mode)`);
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

// Download and upload image to Vercel Blob
async function downloadAndUploadImage(imageUrl, trendId, trendTitle) {
  try {
    console.log(`🖼️ Downloading image for trend: ${trendTitle}`);
    
    // Fetch the image from OpenAI
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/png';
    
    // Determine file extension
    const extension = contentType.includes('png') ? 'png' : 'jpg';
    
    // Create unique filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${trendId}-${timestamp}.${extension}`;
    
    console.log(`📤 Uploading to Vercel Blob: ${filename}`);
    
    // Upload to Vercel Blob
    const blob = await put(filename, Buffer.from(imageBuffer), {
      access: 'public',
      contentType: contentType
    });
    
    console.log(`✅ Image uploaded successfully: ${blob.url}`);
    
    return {
      success: true,
      blobUrl: blob.url,
      filename: filename,
      originalUrl: imageUrl
    };
    
  } catch (error) {
    console.error('❌ Error downloading/uploading image:', error);
    return {
      success: false,
      error: error.message,
      originalUrl: imageUrl
    };
  }
}

// Process all trends and upload their images
async function processTrendsWithImages(trends) {
  console.log(`🔄 Processing ${trends.length} trends with images...`);
  
  const processedTrends = [];
  
  for (let i = 0; i < trends.length; i++) {
    const trend = trends[i];
    console.log(`📋 Processing trend ${i + 1}/${trends.length}: ${trend.title}`);
    
    // If trend has an image URL, download and upload it
    if (trend.creative?.imageUrl) {
      const imageResult = await downloadAndUploadImage(
        trend.creative.imageUrl,
        trend.id,
        trend.title
      );
      
      if (imageResult.success) {
        // Replace the expired OpenAI URL with permanent blob URL
        trend.creative.imageUrl = imageResult.blobUrl;
        trend.creative.blobFilename = imageResult.filename;
        console.log(`✅ Updated image URL for "${trend.title}": ${imageResult.blobUrl}`);
      } else {
        console.log(`❌ Failed to process image for "${trend.title}": ${imageResult.error}`);
        // Keep the original URL but mark it as failed
        trend.creative.imageProcessingFailed = true;
      }
    } else {
      console.log(`ℹ️ No image URL for "${trend.title}"`);
    }
    
    processedTrends.push(trend);
  }
  
  console.log(`✅ Processed ${processedTrends.length} trends`);
  return processedTrends;
}

// Read trends from KV
async function readTrendsFromKV() {
  try {
    console.log('📁 Reading trends from Vercel KV...');
    const data = await kv.get('trends-latest');
    
    if (data) {
      console.log('📖 Read trends from KV:', data.trends?.length || 0);
      return data;
    } else {
      console.log('📁 No trends data in KV');
    }
  } catch (error) {
    console.error('❌ Error reading trends from KV:', error);
  }
  return null;
}

// Write trends to KV
async function writeTrendsToKV(data) {
  try {
    console.log('📁 Writing trends to Vercel KV...');
    
    // Add metadata
    const dataWithMetadata = {
      ...data,
      lastUpdated: new Date().toISOString(),
      storageType: 'vercel-kv',
      version: '1.0'
    };
    
    await kv.set('trends-latest', dataWithMetadata);
    console.log('💾 Successfully wrote trends to KV:', data.trends?.length || 0);
    return true;
  } catch (error) {
    console.error('❌ Error writing trends to KV:', error);
    return false;
  }
}

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
      
      // Validate the incoming data
      if (!validateTrendsData(req.body)) {
        console.log('❌ Data validation failed - not saving');
        return res.status(400).json({ 
          error: 'Invalid trends data - validation failed',
          receivedTrends: req.body?.trends?.length || 0
        });
      }
      
      // Check if we should overwrite existing data
      const existingData = await readTrendsFromKV();
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
      
      // Process trends and upload images to Vercel Blob
      console.log('🖼️ Processing trends and uploading images...');
      const processedTrends = await processTrendsWithImages(req.body.trends);
      
      // Create updated data with processed trends
      const updatedData = {
        ...req.body,
        trends: processedTrends,
        processedAt: new Date().toISOString(),
        storageType: 'vercel-kv-blob'
      };
      
      // Save to KV
      const writeSuccess = await writeTrendsToKV(updatedData);
      if (!writeSuccess) {
        console.log('❌ Failed to write to KV');
        return res.status(500).json({ 
          error: 'Failed to save trends data to KV',
          details: 'KV write operation failed'
        });
      }
      
      console.log('✅ Trends data updated and saved to KV with blob images');
      
      return res.status(200).json({ 
        success: true, 
        message: 'Trends updated and saved with permanent image storage',
        receivedTrends: req.body.trends.length,
        processedTrends: processedTrends.length,
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
      // Read from KV
      const trendsData = await readTrendsFromKV();
      
      console.log('🔍 GET request - trendsData exists:', !!trendsData);
      console.log('🔍 Trends count:', trendsData?.trends?.length || 0);
      
      if (!trendsData) {
        console.log('❌ No trends data available in KV');
        return res.status(404).json({ 
          error: 'No trends data available',
          debug: {
            hasData: false,
            dataType: typeof trendsData,
            storageType: 'vercel-kv'
          }
        });
      }
      
      console.log('✅ Returning trends data from KV');
      return res.status(200).json(trendsData);
    } catch (error) {
      console.error('❌ Error in GET request:', error);
      return res.status(500).json({ error: 'Failed to load trends data' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
