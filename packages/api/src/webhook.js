import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// GitHub integration would go here in production
// For now, just log the data and return success
app.put('/trends/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const data = req.body;
    
    console.log(`📊 Received trends data for ${filename}`);
    console.log(`📈 Trends count: ${data.trends?.length || 0}`);
    
    // In production, this would write to GitHub via API
    // For demo purposes, just acknowledge receipt
    res.json({ 
      success: true, 
      message: `Trends data received for ${filename}`,
      timestamp: new Date().toISOString(),
      trendsCount: data.trends?.length || 0
    });
  } catch (error) {
    console.error('Error processing trends:', error);
    res.status(500).json({ error: 'Failed to process trends data' });
  }
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'trends-webhook'
  });
});

app.listen(PORT, () => {
  console.log(`🌐 Trends webhook running on port ${PORT}`);
});

export default app;