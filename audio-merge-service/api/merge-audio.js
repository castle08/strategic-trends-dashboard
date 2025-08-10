const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

// For Vercel, we need to use /tmp directory
const tmpDir = '/tmp';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Handle n8n input format (array of items directly)
    let audioSegments = req.body;
    
    // If it's wrapped in audioSegments property, extract it
    if (req.body.audioSegments) {
      audioSegments = req.body.audioSegments;
    }

    if (!audioSegments || !Array.isArray(audioSegments) || audioSegments.length === 0) {
      return res.status(400).json({ error: 'audioSegments array required' });
    }

    console.log(`Processing ${audioSegments.length} audio segments`);

    // Create temporary files for each audio segment
    const tempFiles = [];
    const listFilePath = path.join(tmpDir, `playlist_${Date.now()}.txt`);
    
    for (let i = 0; i < audioSegments.length; i++) {
      const segment = audioSegments[i];
      
      // Extract from n8n format (segment.json.segmentInfo, segment.binary.data)
      let audioData, duration;
      
      if (segment.binary && segment.binary.data) {
        // n8n format
        audioData = segment.binary.data;
        duration = segment.json?.segmentInfo?.duration || 1;
      } else if (segment.audio) {
        // Direct format
        audioData = segment.audio;
        duration = segment.duration || 1;
      } else {
        throw new Error(`Segment ${i} missing audio data`);
      }

      // Decode base64 audio (n8n binary data is already a buffer)
      const audioBuffer = Buffer.isBuffer(audioData) ? audioData : Buffer.from(audioData, 'base64');
      const tempFilePath = path.join(tmpDir, `segment_${i}_${Date.now()}.mp3`);
      
      await writeFile(tempFilePath, audioBuffer);
      tempFiles.push(tempFilePath);
    }

    // Create FFmpeg concat list file
    const listContent = tempFiles.map(file => `file '${file}'`).join('\n');
    await writeFile(listFilePath, listContent);

    // Output file path
    const outputPath = path.join(tmpDir, `merged_${Date.now()}.mp3`);

    // Use FFmpeg to concatenate audio files
    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(listFilePath)
        .inputOptions(['-f', 'concat', '-safe', '0'])
        .outputOptions(['-c', 'copy'])
        .output(outputPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    // Read merged file and convert to base64
    const mergedAudio = await readFile(outputPath);
    const base64Audio = mergedAudio.toString('base64');

    // Cleanup temporary files
    tempFiles.push(listFilePath, outputPath);
    for (const file of tempFiles) {
      try {
        fs.unlinkSync(file);
      } catch (err) {
        console.warn(`Failed to delete temp file ${file}:`, err.message);
      }
    }

    // Calculate total duration
    const totalDuration = audioSegments.reduce((sum, segment) => {
      if (segment.json?.segmentInfo?.duration) {
        return sum + segment.json.segmentInfo.duration;
      } else if (segment.duration) {
        return sum + segment.duration;
      }
      return sum + 1; // fallback
    }, 0);

    res.json({
      success: true,
      audio: base64Audio,
      duration: totalDuration,
      segments_processed: audioSegments.length
    });

  } catch (error) {
    console.error('Audio merge error:', error);
    res.status(500).json({ 
      error: 'Failed to merge audio files', 
      details: error.message 
    });
  }
}