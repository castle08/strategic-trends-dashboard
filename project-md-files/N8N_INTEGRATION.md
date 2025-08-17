# N8N Integration Guide

## Overview
Both the 3D Dashboard and Screens App now use the same shared trends data source. The trends update endpoint allows N8N to automatically update both applications with new trends data.

## Current Setup

### Shared Data Source
- **File Location**: `apps/screens-app/public/trends/latest.json` and `apps/three-dashboard/public/trends/latest.json`
- **Format**: Standard TrendsData JSON with 10 N8N-generated trends
- **Both apps fetch from**: `/trends/latest.json` (local file)

### Update Endpoint
- **Server**: `http://localhost:8080`
- **Health Check**: `GET http://localhost:8080/api/health`
- **Update Endpoint**: `POST http://localhost:8080/api/update-trends`

## N8N Integration

### For N8N Workflow:
1. Configure an HTTP Request node in your N8N workflow
2. Set the following parameters:
   - **Method**: POST
   - **URL**: `http://localhost:8080/api/update-trends`
   - **Headers**: `Content-Type: application/json`
   - **Body**: Your processed trends data JSON

### Expected JSON Format:
```json
{
  "generatedAt": "ISO timestamp",
  "sourceSummary": {
    "totalFetched": number,
    "afterCluster": number,
    "sources": ["source1", "source2", ...]
  },
  "trends": [
    {
      "id": "unique-id",
      "title": "Trend Title",
      "summary": "Brief summary",
      "category": "Category",
      "tags": ["tag1", "tag2"],
      "scores": {
        "novelty": 0-100,
        "velocity": 0-100,
        "relevance": 0-100,
        "confidence": 0-100,
        "total": 0-100
      },
      "whyItMatters": "Explanation",
      "brandAngles": ["angle1", "angle2"],
      "exampleUseCases": ["use1", "use2"],
      "creative": {
        "shortCardCopy": "Card text",
        "imagePrompt": "Image description",
        "altText": "Alt text",
        "podcastSnippet": "Audio description"
      },
      "viz": {
        "size": 1-20,
        "intensity": 1-3,
        "colorHint": "hsl(hue, sat%, light%)"
      }
    }
  ]
}
```

## Running the Update Endpoint

### Start the server:
```bash
npm run update-endpoint
# or
node update-trends-endpoint.js
```

### Test the integration:
```bash
# Health check
curl -X GET http://localhost:8080/api/health

# Test update (with existing data)
curl -X POST http://localhost:8080/api/update-trends \
  -H "Content-Type: application/json" \
  -d @apps/screens-app/public/trends/latest.json
```

## What Happens When N8N Posts Data

1. N8N workflow completes and generates trends data
2. HTTP Request node posts JSON to `http://localhost:8080/api/update-trends`
3. Update endpoint receives data and validates it
4. Both app files are updated simultaneously:
   - `apps/screens-app/public/trends/latest.json`
   - `apps/three-dashboard/public/trends/latest.json`
5. Next time users refresh the apps, they see the new data

## Benefits

- **Synchronized Data**: Both apps always show identical trends
- **Real-time Updates**: No manual file copying required
- **N8N Integration**: Direct workflow output to display
- **Automatic Refresh**: Apps check for updates every 5 minutes

## Next Steps for Deployment

To deploy this for production use:

1. Deploy the update endpoint to a cloud service (Heroku, Railway, etc.)
2. Update the N8N workflow to post to the live endpoint URL
3. Consider adding authentication/API keys for security
4. Set up monitoring and error handling