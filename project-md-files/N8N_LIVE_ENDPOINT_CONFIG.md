# N8N Live Endpoint Configuration

## Overview
Your live Vercel app now has a `/api/trends` endpoint that N8N can POST to for automatic updates.

## N8N HTTP Request Node Setup

### 1. Add HTTP Request Node to Your Workflow
At the end of your N8N workflow (after trend processing), add an **HTTP Request** node with these settings:

**Basic Settings:**
- **Authentication:** None
- **Request Method:** POST
- **URL:** `https://strategic-trends-dashboard-standalo.vercel.app/api/trends`
- **Response Format:** JSON

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body (JSON):**
Use the output from your trends processing node. The format should be:
```json
{
  "generatedAt": "{{ $now.toISOString() }}",
  "sourceSummary": {
    "totalFetched": "{{ $('RSS Feed Processing').item.json.totalFetched }}",
    "afterCluster": "{{ $('Trend Analysis').item.json.trends.length }}",
    "sources": "{{ $('RSS Feed Processing').item.json.sources }}"
  },
  "trends": "{{ $('Trend Analysis').item.json.trends }}"
}
```

### 2. Workflow Integration
Place this HTTP Request node:
1. **After** your trend analysis/processing nodes
2. **Before** any final notification nodes
3. Set it to **"Continue on Fail"** so workflow doesn't stop if API is temporarily down

### 3. Test the Integration

**Test URL (GET):**
```
https://strategic-trends-dashboard-standalo.vercel.app/api/trends
```

**Test POST with sample data:**
```bash
curl -X POST https://strategic-trends-dashboard-standalo.vercel.app/api/trends \
  -H "Content-Type: application/json" \
  -d '{
    "generatedAt": "2025-08-09T18:00:00Z",
    "sourceSummary": {
      "totalFetched": 50,
      "afterCluster": 10,
      "sources": ["TechCrunch", "Marketing Dive", "Adweek"]
    },
    "trends": [
      {
        "id": "test-1",
        "title": "Test Trend from N8N",
        "summary": "This is a test trend",
        "category": "Technology",
        "tags": ["test", "n8n"],
        "scores": {
          "novelty": 75,
          "velocity": 80,
          "relevance": 85,
          "confidence": 78,
          "total": 79.5
        },
        "whyItMatters": "Testing the N8N integration",
        "brandAngles": ["Integration", "Testing", "Automation"],
        "exampleUseCases": ["Test workflow", "API validation"],
        "creative": {
          "shortCardCopy": "N8N Integration Test",
          "imagePrompt": "Testing API integration",
          "altText": "Test trend",
          "podcastSnippet": "Testing N8N integration"
        },
        "viz": {
          "size": 8,
          "intensity": 1.5,
          "colorHint": "hsl(210, 70%, 60%)"
        }
      }
    ]
  }'
```

## What Happens When N8N Posts Data

1. **N8N Workflow Completes:** Your trend analysis finishes
2. **HTTP Request Node Executes:** Posts JSON data to `/api/trends`
3. **Vercel API Updates:** Server stores the new trends data
4. **Live Apps Refresh:** Both 3D dashboard and screens mode get new data automatically (they refresh every 5 minutes)
5. **Users See Updates:** Fresh trends appear on both views

## Live App URLs

- **3D Dashboard:** `https://strategic-trends-dashboard-standalo.vercel.app/`
- **TV Screens:** `https://strategic-trends-dashboard-standalo.vercel.app/?screens`
- **API Endpoint:** `https://strategic-trends-dashboard-standalo.vercel.app/api/trends`

## Error Handling

If the POST request fails:
- The API returns appropriate error codes (404, 500, etc.)
- N8N workflow can continue if you set "Continue on Fail"
- Apps will continue showing previous data until next successful update

## Next Steps

1. Add the HTTP Request node to your N8N workflow
2. Configure it with the settings above
3. Test with sample data first
4. Run your full workflow to see live updates
5. Monitor both dashboard views to confirm data synchronization

The integration is now ready! 🚀