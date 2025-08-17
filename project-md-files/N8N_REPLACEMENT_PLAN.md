# N8N Replacement Plan - Internal Workflow Engine

## Current Problem Analysis

The current n8n workflow is experiencing issues with:
- Data format mismatches between nodes
- Complex debugging across multiple external services
- Limited error handling and retry logic
- Difficult deployment and version control
- External dependency on n8n platform

## Proposed Solution: Internal Workflow Engine

### Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   RSS Sources   │───▶│  Workflow       │───▶│  Live Dashboard │
│   (Config)      │    │  Engine         │    │  (Vercel)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │  Storage        │
                       │  (Supabase)     │
                       └─────────────────┘
```

### Core Components

#### 1. Workflow Engine (`packages/workflow-engine/`)
```typescript
// Core workflow orchestration
interface WorkflowStep {
  id: string;
  type: 'rss_fetch' | 'ai_process' | 'image_generate' | 'data_store';
  config: any;
  retryPolicy?: RetryPolicy;
  timeout?: number;
}

interface Workflow {
  id: string;
  name: string;
  steps: WorkflowStep[];
  schedule?: string; // cron expression
  enabled: boolean;
}
```

#### 2. RSS Aggregator (`packages/rss-aggregator/`)
```typescript
// RSS feed processing
interface RSSSource {
  id: string;
  name: string;
  url: string;
  category: string;
  weight: number;
  lastFetch?: Date;
  enabled: boolean;
}

interface RSSItem {
  title: string;
  description: string;
  link: string;
  pubDate: Date;
  source: string;
  category: string;
}
```

#### 3. AI Processing Engine (`packages/ai-processor/`)
```typescript
// AI trend analysis and image prompt generation
interface TrendAnalysis {
  title: string;
  summary: string;
  category: string;
  scores: {
    relevance: number;
    novelty: number;
    impact: number;
    total: number;
  };
  creative: {
    imagePrompt: string;
    visualStyle: string;
  };
  viz: {
    size: number;
    color: string;
  };
}
```

#### 4. Image Generation Service (`packages/image-generator/`)
```typescript
// Image generation using GPT-4 Vision/DALL-E 3
interface ImageRequest {
  prompt: string;
  style: string;
  size: '1024x1024' | '1792x1024' | '1024x1792';
  model: 'dall-e-3' | 'dall-e-2';
  trendId: string;
}

interface ImageResult {
  imageId: string;
  imageUrl: string;
  imageBinary: string;
  prompt: string;
  metadata: {
    model: string;
    size: string;
    quality: string;
    style: string;
  };
}
```

#### 5. Data Storage Layer (`packages/storage/`)
```typescript
// Unified data storage interface
interface StorageProvider {
  saveTrends(trends: Trend[]): Promise<void>;
  saveImages(images: ImageResult[]): Promise<void>;
  getLatestTrends(): Promise<Trend[]>;
  getTrendHistory(): Promise<Trend[]>;
}
```

### Implementation Plan

#### Phase 1: Core Infrastructure (Week 1-2)

1. **Create Workflow Engine Package**
   ```bash
   cd packages/
   mkdir workflow-engine
   cd workflow-engine
   npm init -y
   npm install node-cron axios lodash
   ```

2. **Implement Basic Workflow Runner**
   - Step execution with error handling
   - Retry logic with exponential backoff
   - Logging and monitoring
   - Configuration management

3. **Create RSS Aggregator**
   - RSS feed parsing and validation
   - Duplicate detection
   - Rate limiting and caching
   - Source management

#### Phase 2: AI Integration (Week 3-4)

1. **AI Processing Engine**
   - OpenAI API integration
   - Trend analysis prompts
   - Image prompt generation
   - Result validation and scoring

2. **Image Generation Service**
   - GPT-4 Vision/DALL-E 3 API integration
   - Multiple size and quality options
   - Image storage and optimization
   - Metadata management
   - Error handling for failed generations

#### Phase 3: Storage & API (Week 5-6)

1. **Unified Storage Layer**
   - Supabase integration
   - File storage for images
   - Data validation and sanitization
   - Backup and recovery

2. **Enhanced API Endpoints**
   - Workflow management endpoints
   - Real-time status monitoring
   - Manual trigger capabilities
   - Configuration management

#### Phase 4: Dashboard Integration (Week 7-8)

1. **Workflow Management UI**
   - Workflow configuration interface
   - Real-time execution monitoring
   - Error logs and debugging
   - Manual trigger buttons

2. **Enhanced Dashboard**
   - Real-time trend updates
   - Image display optimization
   - Performance monitoring
   - User feedback system

### Technical Requirements

#### Dependencies
```json
{
  "dependencies": {
    "node-cron": "^3.0.0",
    "axios": "^1.6.0",
    "openai": "^4.0.0",
    "@supabase/supabase-js": "^2.0.0",
    "lodash": "^4.17.21",
    "winston": "^3.11.0",
    "joi": "^17.11.0"
  }
}
```

#### Environment Variables
```env
# AI Services
OPENAI_API_KEY=your_openai_key

# Storage
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key

# Workflow Configuration
WORKFLOW_SCHEDULE="0 */6 * * *"  # Every 6 hours
MAX_RETRIES=3
REQUEST_TIMEOUT=30000
```

#### Database Schema
```sql
-- Workflows table
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  config JSONB NOT NULL,
  schedule VARCHAR(100),
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Execution logs
CREATE TABLE workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES workflows(id),
  status VARCHAR(50) NOT NULL,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  error_message TEXT,
  result_data JSONB
);

-- RSS sources
CREATE TABLE rss_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL,
  category VARCHAR(100),
  weight INTEGER DEFAULT 1,
  enabled BOOLEAN DEFAULT true,
  last_fetch TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Benefits of Internal Solution

1. **Full Control**: Complete control over data flow and error handling
2. **Better Debugging**: Integrated logging and monitoring
3. **Version Control**: All code in git with proper CI/CD
4. **Cost Effective**: No external service fees
5. **Customizable**: Tailored to specific needs
6. **Reliable**: No dependency on external platform availability
7. **Scalable**: Can be optimized for specific use cases

### Migration Strategy

1. **Parallel Development**: Build new system alongside n8n
2. **Data Validation**: Ensure both systems produce identical results
3. **Gradual Migration**: Move one workflow at a time
4. **Fallback Plan**: Keep n8n as backup during transition
5. **Testing**: Comprehensive testing before full migration

### Monitoring & Maintenance

1. **Health Checks**: Automated monitoring of all services
2. **Error Alerts**: Real-time notifications for failures
3. **Performance Metrics**: Track execution times and success rates
4. **Data Quality**: Validate output data integrity
5. **Backup Strategy**: Regular backups of configuration and data

### Next Steps

If the current n8n fix doesn't work:

1. **Immediate**: Start with Phase 1 (Core Infrastructure)
2. **Priority**: Focus on RSS aggregation and basic workflow execution
3. **Timeline**: 2-3 weeks for minimal viable replacement
4. **Resources**: Dedicate focused development time
5. **Testing**: Build comprehensive test suite

This internal solution would provide a robust, maintainable, and scalable alternative to n8n while giving you complete control over the entire workflow process.
