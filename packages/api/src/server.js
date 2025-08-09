import express from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '../../../public');
const trendsDir = join(publicDir, 'trends');

const app = express();
const PORT = 3333;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Ensure directories exist
await fs.mkdir(trendsDir, { recursive: true });

// PUT endpoint for writing JSON files
app.put('/trends/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const data = req.body;
    
    // Validate filename (security)
    if (!filename.match(/^[a-zA-Z0-9_-]+\.json$/)) {
      return res.status(400).json({ error: 'Invalid filename format' });
    }
    
    const filepath = join(trendsDir, filename);
    await fs.writeFile(filepath, JSON.stringify(data, null, 2));
    
    console.log(`✅ Updated: ${filename}`);
    res.json({ success: true, message: `File ${filename} updated` });
  } catch (error) {
    console.error('Error writing file:', error);
    res.status(500).json({ error: 'Failed to write file' });
  }
});

// GET endpoint for reading files (optional)
app.get('/trends/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    if (!filename.match(/^[a-zA-Z0-9_-]+\.json$/)) {
      return res.status(400).json({ error: 'Invalid filename format' });
    }
    
    const filepath = join(trendsDir, filename);
    const data = await fs.readFile(filepath, 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: 'File not found' });
    } else {
      res.status(500).json({ error: 'Failed to read file' });
    }
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Trends API server running on http://localhost:${PORT}`);
  console.log(`📁 Writing to: ${trendsDir}`);
});