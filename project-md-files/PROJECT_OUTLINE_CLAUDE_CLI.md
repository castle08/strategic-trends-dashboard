# Strategic Trends Dashboard - Claude CLI + n8n-mcp Project Outline

## Overview
This document is specifically for Claude CLI with n8n-mcp integration to manage and troubleshoot the Strategic Trends Dashboard n8n workflow.

## Current n8n Workflow Status

### Working Components ✅
- **RSS Feed Collection**: Successfully scraping multiple marketing/advertising feeds
- **Trend Analysis**: AI-powered trend extraction working correctly
- **Image Generation**: GPT-4 Vision generating 3D wireframe images
- **Data Merging**: Merge1 node successfully combining trends with images
- **API Integration**: trends-with-storage.js API fully functional

### Current Issue 🔧
- **Request Size Limits**: n8n workflow hitting Vercel's 4.5MB request limit when sending multiple images
- **Solution Needed**: Individual API requests or smaller batches

## n8n Workflow Structure

### Current Flow:
```
RSS Feeds → Process Articles → Strategic Trend Analyzer → Finalize Trends → 
Generate Image Prompts → OpenAI Image Generation → Extract from File → 
Code2 → Merge1 → Code (batch/individual) → HTTP Request → API
```

### Key Nodes to Monitor:
1. **Merge1**: Combines trends with their corresponding images
2. **Code Node**: Currently attempting individual requests (needs fixing)
3. **HTTP Request**: Sends data to API endpoint

## Claude CLI + n8n-mcp Tasks

### Immediate Tasks:
1. **Fix Individual Requests Code Node**
   - Current error: `$http is not defined`
   - Need to implement proper n8n Code node HTTP requests
   - Or switch to batch approach with smaller sizes

2. **Test with Full Workflow**
   - Change `TESTING_LIMIT` from 2 to 10
   - Verify all 10 trends process correctly
   - Ensure images upload to Vercel Blob

3. **Monitor API Performance**
   - Check Vercel logs for request sizes
   - Verify image uploads to blob storage
   - Confirm database updates

### n8n-mcp Commands to Use:
```bash
# Check workflow status
n8n workflow:list

# View specific workflow
n8n workflow:get --id <workflow-id>

# Execute workflow
n8n workflow:execute --id <workflow-id>

# View execution logs
n8n execution:list

# Get specific execution details
n8n execution:get --id <execution-id>
```

## API Endpoint Details

### Endpoint: `https://trends-dashboard-six.vercel.app/api/trends-with-storage`
- **Method**: POST
- **Content-Type**: application/json
- **Expected Format**: 
  ```json
  {
    "trends": [
      {
        "trend": { /* trend data */ },
        "imageBinary": "base64_image_data"
      }
    ]
  }
  ```

### Current API Status:
- ✅ Validation working (fixed `id: 0` issue)
- ✅ Image processing working (`uploadImageBinary` function)
- ✅ Supabase integration working
- ✅ Vercel Blob storage working

## Data Structure Reference

### Merge1 Output Format:
```json
{
  "trends": [
    {
      "trend": {
        "id": 0,
        "title": "Trend Title",
        "summary": "Trend summary...",
        "category": "Technology",
        "scores": { "total": 85 },
        "creative": { "imagePrompt": "..." },
        "viz": { "size": 18 }
      },
      "imageBinary": "iVBORw0KGgoAAAANSUhEUgAABAAAAAQACAYAAAB/HSuD..."
    }
  ]
}
```

## Troubleshooting Guide

### Common Issues:
1. **"fetch is not defined"**: Use n8n's built-in HTTP methods
2. **"$http is not defined"**: Use different approach (batch or iterate)
3. **"Request Entity Too Large"**: Reduce batch size or use individual requests
4. **Validation failures**: Check data structure matches expected format

### Debug Steps:
1. Check Merge1 output structure
2. Verify Code node data transformation
3. Monitor HTTP Request payload size
4. Check API logs for validation errors
5. Verify image upload success

## Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `BLOB_READ_WRITE_TOKEN`
- OpenAI API keys (in n8n credentials)

## Next Steps for Claude CLI
1. **Fix the Code node** to handle individual requests properly
2. **Test with 2 trends** to verify the fix works
3. **Scale to 10 trends** for full production testing
4. **Monitor performance** and optimize if needed
5. **Plan n8n replacement** with internal workflow engine

## Terminal Windows Status
- **Current**: Multiple open terminals (may not all be needed)
- **Recommendation**: Close unused terminals, keep one for Claude CLI
- **n8n-mcp**: Should run in dedicated terminal for best performance

## Success Criteria
- ✅ All 10 trends process successfully
- ✅ All images upload to Vercel Blob
- ✅ Frontend displays trends with images
- ✅ No request size limit errors
- ✅ Reliable end-to-end workflow execution

