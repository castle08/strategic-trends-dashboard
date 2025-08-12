export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    // Process RSS data and trigger podcast workflow
    try {
      const rssData = req.body;
      
      console.log('Received RSS data for podcast generation');
      console.log('Data type:', typeof rssData);
      console.log('Data keys:', Object.keys(rssData || {}));
      
      if (!rssData) {
        return res.status(400).json({ error: 'No RSS data provided' });
      }

      // Trigger the n8n podcast workflow webhook
      const webhookUrl = 'https://t-and-p-innovation.app.n8n.cloud/webhook/podcast-trigger';
      
      console.log('Triggering podcast workflow webhook...');
      
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rssData: rssData,
          triggeredAt: new Date().toISOString(),
          source: 'trends-dashboard'
        })
      });

      let webhookResult = 'Webhook triggered';
      if (webhookResponse.ok) {
        console.log('Podcast workflow webhook triggered successfully');
        webhookResult = 'Podcast workflow started';
      } else {
        console.error('Webhook trigger failed:', webhookResponse.status, webhookResponse.statusText);
        webhookResult = `Webhook failed: ${webhookResponse.status}`;
      }

      const response = {
        success: true,
        message: 'RSS data received and podcast workflow triggered',
        timestamp: new Date().toISOString(),
        dataReceived: {
          hasData: !!rssData,
          type: typeof rssData,
          keys: Object.keys(rssData || {})
        },
        webhookTriggered: webhookResponse.ok,
        webhookStatus: webhookResult
      };

      console.log('RSS data processed and podcast workflow triggered');
      res.status(200).json(response);

    } catch (error) {
      console.error('Error processing RSS data:', error);
      res.status(500).json({ 
        error: 'Failed to process RSS data', 
        details: error.message 
      });
    }
  } 
  else if (req.method === 'GET') {
    // Health check endpoint
    res.status(200).json({
      status: 'active',
      message: 'RSS data endpoint ready to receive data',
      timestamp: new Date().toISOString(),
      usage: {
        post: 'Send RSS data from main trends workflow',
        webhook: 'Use as webhook trigger in podcast workflow'
      }
    });
  }
  else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}