import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

// Set FFmpeg path for fluent-ffmpeg
ffmpeg.setFfmpegPath(ffmpegPath.path);
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
    console.log('Raw request body type:', typeof req.body);
    console.log('Raw request body is array:', Array.isArray(req.body));
    
    // n8n sends data as array directly when using $input.all()
    let audioSegments = req.body;
    
    console.log('Audio segments length:', audioSegments?.length);

    if (!audioSegments || !Array.isArray(audioSegments) || audioSegments.length === 0) {
      return res.status(400).json({ error: 'audioSegments array required' });
    }

    console.log(`Processing ${audioSegments.length} audio segments from n8n workflow`);

    // Create temporary files for each audio segment
    const tempFiles = [];
    
    for (let i = 0; i < audioSegments.length; i++) {
      const segment = audioSegments[i];
      console.log(`Segment ${i} structure:`, {
        hasJson: !!segment.json,
        hasBinary: !!segment.binary,
        jsonKeys: segment.json ? Object.keys(segment.json) : [],
        binaryKeys: segment.binary ? Object.keys(segment.binary) : []
      });
      
      // Extract binary data from n8n format
      if (!segment.binary || !segment.binary.data) {
        console.error(`Segment ${i} missing binary data:`, JSON.stringify(segment, null, 2));
        throw new Error(`Segment ${i} missing binary audio data`);
      }

      // n8n serializes binary data as objects when sent via HTTP JSON
      const binaryData = segment.binary.data;
      const duration = segment.json?.segmentInfo?.duration || 1;
      
      console.log(`Segment ${i}: binaryData type: ${typeof binaryData}, isBuffer: ${Buffer.isBuffer(binaryData)}`);
      
      // Handle all possible n8n binary data formats
      let audioBuffer;
      
      if (Buffer.isBuffer(binaryData)) {
        audioBuffer = binaryData;
        console.log(`Segment ${i}: using direct Buffer`);
      } else if (typeof binaryData === 'string') {
        // Base64 encoded string
        audioBuffer = Buffer.from(binaryData, 'base64');
        console.log(`Segment ${i}: decoded from base64 string`);
      } else if (binaryData && typeof binaryData === 'object') {
        // Try different object formats
        if (binaryData.type === 'Buffer' && Array.isArray(binaryData.data)) {
          // Standard Node.js Buffer serialization: {type: 'Buffer', data: [1,2,3...]}
          audioBuffer = Buffer.from(binaryData.data);
          console.log(`Segment ${i}: reconstructed from standard Buffer object`);
        } else if (binaryData.data && typeof binaryData.data === 'string') {
          // n8n might wrap base64 in data property
          audioBuffer = Buffer.from(binaryData.data, 'base64');
          console.log(`Segment ${i}: extracted base64 from data property`);
        } else if (Array.isArray(binaryData)) {
          // Direct array of bytes
          audioBuffer = Buffer.from(binaryData);
          console.log(`Segment ${i}: created from byte array`);
        } else {
          // Fallback: try to find any base64-looking string in the object
          const keys = Object.keys(binaryData);
          let found = false;
          
          for (const key of keys) {
            const value = binaryData[key];
            if (typeof value === 'string' && value.length > 100) {
              try {
                audioBuffer = Buffer.from(value, 'base64');
                console.log(`Segment ${i}: found base64 data in property '${key}'`);
                found = true;
                break;
              } catch (e) {
                // Not valid base64, continue
              }
            }
          }
          
          if (!found) {
            // Last resort: log full structure and fail gracefully
            console.error(`Segment ${i} unknown binary data structure:`);
            console.error(`Keys: ${keys.join(', ')}`);
            console.error(`Sample values:`, keys.slice(0, 3).map(k => `${k}: ${typeof binaryData[k]} (${String(binaryData[k]).substring(0, 50)}...)`));
            throw new Error(`Segment ${i}: Could not extract audio data from object`);
          }
        }
      } else {
        throw new Error(`Segment ${i}: Unexpected binary data type - ${typeof binaryData}`);
      }
      
      if (audioBuffer.length === 0) {
        throw new Error(`Segment ${i}: Audio buffer is empty`);
      }

      const tempFilePath = path.join(tmpDir, `segment_${i}_${Date.now()}.mp3`);
      
      await writeFile(tempFilePath, audioBuffer);
      tempFiles.push(tempFilePath);
      
      console.log(`Segment ${i}: wrote ${audioBuffer.length} bytes to ${tempFilePath}`);
    }

    // Most basic approach - individual inputs with filter_complex concat
    const outputPath = path.join(tmpDir, `merged_${Date.now()}.mp3`);
    
    console.log('Attempting FFmpeg merge with', tempFiles.length, 'files');

    await new Promise((resolve, reject) => {
      const command = ffmpeg();
      
      // Add each file as an input
      tempFiles.forEach((file, index) => {
        console.log(`Adding input ${index}:`, file);
        command.addInput(file);
      });
      
      // Simple concat filter without video streams
      const filterString = tempFiles.map((_, i) => `[${i}:a]`).join('') + `concat=n=${tempFiles.length}:v=0:a=1[outa]`;
      
      console.log('Using filter:', filterString);
      
      command
        .complexFilter([filterString])
        .outputOptions(['-map', '[outa]'])
        .audioCodec('aac') // Use AAC instead of copy to handle any format issues
        .output(outputPath)
        .on('start', (commandLine) => {
          console.log('FFmpeg command:', commandLine);
        })
        .on('end', () => {
          console.log('FFmpeg processing completed successfully');
          resolve();
        })
        .on('error', (err, stdout, stderr) => {
          console.error('FFmpeg error:', err.message);
          console.error('FFmpeg stderr:', stderr);
          console.error('FFmpeg stdout:', stdout);
          reject(err);
        })
        .run();
    });

    // Read merged file and convert to base64
    const mergedAudio = await readFile(outputPath);
    const base64Audio = mergedAudio.toString('base64');

    // Cleanup temporary files
    tempFiles.push(outputPath);
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