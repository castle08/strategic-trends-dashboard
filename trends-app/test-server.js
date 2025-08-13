import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Test the download-and-store-image endpoint
app.post('/api/download-and-store-image', async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { imageUrl, trendId, trendTitle } = req.body;

  if (!imageUrl || !trendId) {
    return res.status(400).json({ error: 'Missing imageUrl or trendId' });
  }

  try {
    console.log('🖼️ Downloading image for trend:', trendTitle);
    
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
    
    // Create unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${trendId}-${timestamp}.${extension}`;
    
    // Ensure images directory exists
    const imagesDir = path.join(process.cwd(), 'public', 'trends', 'images');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }
    
    // Save image to file
    const imagePath = path.join(imagesDir, filename);
    fs.writeFileSync(imagePath, Buffer.from(imageBuffer));
    
    // Create local URL
    const localImageUrl = `/trends/images/${filename}`;
    
    console.log('✅ Image saved successfully:', localImageUrl);
    
    return res.status(200).json({
      success: true,
      localImageUrl: localImageUrl,
      filename: filename,
      originalUrl: imageUrl
    });
    
  } catch (error) {
    console.error('❌ Error downloading image:', error);
    res.status(500).json({ 
      error: 'Failed to download and store image',
      details: error.message 
    });
  }
});

// Serve the test page
app.get('/test-download', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'test-download.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
  console.log(`📄 Test page: http://localhost:${PORT}/test-download`);
});
