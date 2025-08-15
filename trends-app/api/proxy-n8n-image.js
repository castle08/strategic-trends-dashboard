export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const { url } = req.query;
      
      if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
      }

      console.log(`🖼️ Proxying n8n image: ${url}`);

      // Add n8n authentication headers
      const headers = {
        'User-Agent': 'Mozilla/5.0 (compatible; n8n-image-downloader/1.0)',
        'Accept': 'image/png,image/jpeg,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzYmRmMGI3Ny02N2IxLTRkMmMtYWFjNS1kOTc1MTM3NTAyMjUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0NzQwOTI3LCJleHAiOjE3NTcyODYwMDB9.6J9LecqWNIw-Qd0rqHofjhZhDY382ZaHR-RLbKo6F_A'
      };

      // Fetch the image from n8n
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
        timeout: 30000
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }

      // Get the image data
      const imageBuffer = await response.arrayBuffer();
      const contentType = response.headers.get('content-type') || 'image/png';

      // Set response headers
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

      // Return the image
      return res.status(200).send(Buffer.from(imageBuffer));

    } catch (error) {
      console.error('❌ Error proxying image:', error);
      return res.status(500).json({ 
        error: 'Failed to proxy image',
        details: error.message 
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

