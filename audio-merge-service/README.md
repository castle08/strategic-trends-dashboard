# Audio Merge Service

FFmpeg-based audio merging service for n8n podcast workflows.

## API Endpoint

`POST /api/merge-audio`

### Request Body

```json
{
  "audioSegments": [
    {
      "audio": "base64_encoded_audio_data",
      "duration": 4.2,
      "speaker": "Alex",
      "text": "Hello there..."
    },
    {
      "audio": "base64_encoded_audio_data", 
      "duration": 3.8,
      "speaker": "Jamie",
      "text": "Hi Alex..."
    }
  ]
}
```

### Response

```json
{
  "success": true,
  "audio": "base64_encoded_merged_audio",
  "duration": 8.0,
  "segments_processed": 2
}
```

## Usage in n8n

Add an HTTP Request node after your audio sequence collection:

1. **Method**: POST
2. **URL**: `https://your-vercel-app.vercel.app/api/merge-audio`
3. **Body**: 
   ```json
   {
     "audioSegments": {{ $json.segments }}
   }
   ```

## Local Development

```bash
npm install
npx vercel dev
```

## Deploy

```bash
npx vercel --prod
```