# Strategic Trends Dashboard - Project Outline

## Overview
A visual trend dashboard pipeline that generates 3D-style images for trends using OpenAI's image API and displays them in an interactive 3D dashboard.

## System Architecture

### 1. Data Pipeline (n8n Workflow)
**Purpose**: Scrape RSS feeds, process trends, generate images, and send to API

#### Key Nodes:
- **RSS Feed Nodes**: Scrape multiple marketing/advertising RSS feeds
- **Merge RSS Sources**: Combine all RSS data
- **Process Articles**: Extract and analyze trend data
- **Strategic Trend Analyzer**: AI-powered trend analysis
- **Finalize Trends**: Create structured trend objects with viz properties
- **Split Trends for Image Generation**: Split trends into individual items for processing
- **Generate Image Prompts**: Create detailed prompts for image generation
- **OpenAI Image Generation**: Generate 3D wireframe images using GPT-4 Vision
- **Extract from File**: Convert binary image data to base64
- **Code2**: Add imageId for matching (avoiding reserved n8n keys)
- **Merge1**: Match trends with their corresponding images by ID
- **HTTP Request**: Send merged data to API endpoint

#### Current Testing Configuration:
- `TESTING_MODE = true`
- `TESTING_LIMIT = 2` (only generate 2 images for faster testing)

### 2. API Endpoint (`trends-with-storage.js`)
**Purpose**: Receive trend data, process images, store in database

#### Key Functions:
- **validateMergeData()**: Validates Merge node output structure
- **processMergeDataWithImages()**: Processes base64 images and uploads to Vercel Blob
- **downloadAndUploadImage()**: Converts base64 to Buffer and uploads to Vercel Blob
- **writeTrendsToSupabase()**: Saves processed trends to Supabase database
- **readTrendsFromSupabase()**: Retrieves trends from database

#### Data Flow:
1. Receives Merge node output (array of objects with `trend` and `imageBinary`)
2. Validates data structure
3. Uploads base64 images to Vercel Blob storage
4. Replaces base64 data with permanent blob URLs
5. Saves to Supabase database

### 3. Storage Solutions

#### Vercel Blob Storage
- **Purpose**: Permanent image storage (OpenAI URLs expire quickly)
- **Process**: Convert base64 → Buffer → Upload to Blob → Get permanent URL
- **Access**: Public URLs for frontend display

#### Supabase Database
- **Purpose**: Persistent trends data storage
- **Schema**: Single `trends` table with JSONB column
- **Columns**: `id`, `trends` (JSONB), `generatedat`, `lastupdated`, `storagetype`, `version`

### 4. Frontend (React + Three.js)
**Purpose**: Display trends in interactive 3D dashboard

#### Key Components:
- **TrendCrystal**: 3D visualization of individual trends
- **Scene**: Orchestrates 3D scene and renders crystals
- **UI**: User interface controls and information display

#### Data Source:
- Fetches from API endpoint: `https://trends-dashboard-six.vercel.app/api/trends-with-storage`

## Current Issue Being Fixed

### Problem:
The Merge node in n8n is successfully combining trends with their corresponding images, but the API endpoint is rejecting the data with validation errors.

### Error Message:
```
"Invalid Merge data - validation failed"
"receivedItems": 2
```

### Data Structure Being Sent:
```json
[
  {
    "trend": {
      "id": 0,
      "title": "AI-Driven Personalization Redefines Consumer Engagement",
      "summary": "...",
      "category": "AI",
      "scores": {"total": 88, ...},
      "creative": {...},
      "viz": {"size": 19, ...}
    },
    "trendId": 0,
    "trendTitle": "...",
    "imageBinary": "iVBORw0KGgoAAAANSUhEUgAABAAAAAQACAYAAAB/HSuDAADqSGNhQlgAAOpIanVtYgAAAB5qdW1kYzJwYQARABCAAACqADibcQNjMnBhAAAANwpqdW1kYgAAAClqdW1kYzJhcwARABCAAACqADibcQNjMnBhLmFzc2VydGlvbnMAAAABBWp1bWIAAAApanVtZGNib3IAEQAQgAAAqgA4m3EDYzJwYS5hY3Rpb25zLnYyAAAAANRjYm9yoWdhY3Rpb25zgqNmYWN0aW9ubGMycGEuY3JlYXRlZG1zb2Z0d2FyZUFnZW50v2RuYW1lZkdQVC00b/9xZGlnaXRhbFNvdXJjZVR5cGV4Rmh0dHA6Ly9jdi5pcHRjLm9yZy9uZXdzY29kZXMvZGlnaXRhbHNvdXJjZXR5cGV1dHJhaW5lZEFsZ29yaXRobWljTWVkaWGiZmFjdGlvbm5jMnBhLmNvbnZlcnRlZG1zb2Z0d2FyZUFnZW50..."
  }
]
```

### HTTP Request Configuration:
- **Method**: POST
- **URL**: `https://trends-dashboard-six.vercel.app/api/trends-with-storage`
- **Body**: `{{ $json }}` (entire Merge output as-is)
- **Content-Type**: application/json

### Validation Logic:
The API has been updated to:
1. Detect if input is an array (Merge format) vs object (old format)
2. Use `validateMergeData()` for Merge format
3. Accept minimum 2 items for testing
4. Be very lenient with field validation

### Recent Changes Made:
1. Updated API to handle Merge node output structure directly
2. Added `validateMergeData()` function
3. Added `processMergeDataWithImages()` function
4. Made validation more lenient (removed strict field requirements)
5. Added detailed logging to debug validation issues

### Current Status:
- ✅ Merge node is working and producing correct data structure
- ✅ HTTP Request node is sending data correctly
- ❌ API validation is still failing (unknown reason)
- ❌ Images not being processed and stored

### Next Steps Needed:
1. Debug why validation is still failing despite lenient rules
2. Check if there's a deployment/caching issue
3. Verify the exact data structure being received by API
4. Ensure images are processed and stored correctly
5. Test end-to-end workflow

## Technical Stack
- **n8n**: Workflow automation
- **OpenAI GPT-4 Vision**: Image generation
- **Vercel**: API hosting and Blob storage
- **Supabase**: PostgreSQL database
- **React + Three.js**: Frontend 3D visualization
- **TypeScript**: Type safety across the stack

## Environment Variables Required
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `BLOB_READ_WRITE_TOKEN` (Vercel Blob)
- OpenAI API keys (in n8n)

## Deployment
- **Frontend**: Vercel (from `trends-app` directory)
- **API**: Vercel serverless functions
- **Database**: Supabase
- **Storage**: Vercel Blob
