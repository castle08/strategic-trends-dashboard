# Adaptive RSS Feed Discovery System

## Overview

The Adaptive RSS Feed Discovery System is an intelligent, self-improving mechanism that automatically discovers, tests, and optimizes RSS feeds for the trends dashboard. It learns from performance data and continuously improves the quality and diversity of content sources.

## Key Features

### 🔍 **Automatic Discovery**
- **Web Search Integration**: Uses search queries to find new RSS feeds
- **Category-Specific Targeting**: Searches for feeds in specific categories (Tech, Business, Marketing, etc.)
- **Domain Filtering**: Excludes social media and low-quality domains
- **Duplicate Prevention**: Avoids adding feeds that already exist

### 📊 **Performance Tracking**
- **Success Rate Monitoring**: Tracks how often feeds return valid content
- **Trend Contribution Scoring**: Measures how many trends each feed contributes
- **Quality Assessment**: Evaluates article quality and relevance
- **Response Time Tracking**: Monitors feed reliability and speed

### 🤖 **Intelligent Optimization**
- **Auto-Disabling**: Automatically disables underperforming feeds
- **Category Balancing**: Ensures adequate coverage across all categories
- **Priority-Based Discovery**: Focuses on categories with poor performance
- **Weekly Optimization**: Runs weekly to maintain feed quality

## Architecture

### 1. **Configuration Management** (`config/sources.json`)

```json
{
  "sources": [
    {
      "name": "TechCrunch",
      "type": "rss",
      "url": "https://techcrunch.com/feed/",
      "enabled": true,
      "performance": {
        "successRate": 0.95,
        "trendContribution": 8,
        "avgArticleQuality": 0.85,
        "lastSuccessfulFetch": "2025-08-15T10:30:00Z",
        "failureCount": 2,
        "totalFetches": 40
      },
      "metadata": {
        "category": "Technology",
        "discoveredAt": "2025-08-15T00:00:00Z"
      }
    }
  ],
  "adaptiveDiscovery": {
    "enabled": true,
    "discoveryFrequency": "weekly",
    "maxFeedsPerCategory": 5,
    "minSuccessRate": 0.7,
    "searchKeywords": ["tech trends RSS", "business innovation RSS"]
  }
}
```

### 2. **Database Schema** (`database-schema-feed-performance.sql`)

#### Core Tables:
- **`feed_performance`**: Tracks performance metrics for each feed
- **`feed_discovery_history`**: Records discovered feeds and test results
- **`feed_categories`**: Defines categories and performance targets

#### Views:
- **`feed_performance_summary`**: Easy access to performance data
- **`category_performance_summary`**: Category-level performance analysis

### 3. **API Endpoints**

#### Feed Performance Tracking (`/api/feed-performance`)
```javascript
POST /api/feed-performance
{
  "feedName": "TechCrunch",
  "success": true,
  "articleCount": 15,
  "quality": 0.85,
  "trendContribution": 2
}
```

### 4. **n8n Workflow** (`adaptive-feed-discovery.json`)

#### Workflow Steps:
1. **Weekly Discovery Trigger**: Runs every Sunday at 2 AM
2. **Analyze Current Feeds**: Evaluates existing feed performance
3. **Discovery Decision**: Determines if new feeds are needed
4. **Generate Search Queries**: Creates targeted search terms
5. **Web Search Discovery**: Finds candidate RSS feeds
6. **Test Candidate Feeds**: Validates and scores new feeds
7. **Update Sources Config**: Adds good feeds, removes bad ones
8. **Generate Reports**: Creates performance and discovery reports

## How It Works

### Discovery Process

1. **Performance Analysis**
   ```javascript
   // Analyzes current feed performance
   const analysis = {
     totalFeeds: 12,
     enabledFeeds: 10,
     underperformingFeeds: 2,
     categoryBreakdown: {
       'Technology': { enabled: 3, avgSuccessRate: 0.85 },
       'Business': { enabled: 2, avgSuccessRate: 0.65 } // Needs improvement
     }
   };
   ```

2. **Targeted Search**
   ```javascript
   // Generates category-specific search queries
   const queries = [
     { query: "business innovation RSS feed", category: "Business", priority: "high" },
     { query: "startup news RSS", category: "Business", priority: "high" },
     { query: "tech trends RSS", category: "Technology", priority: "medium" }
   ];
   ```

3. **Feed Testing**
   ```javascript
   // Tests each candidate feed
   const testResult = {
     feed: { name: "Harvard Business Review", url: "https://hbr.org/feed" },
     isValid: true,
     responseTime: 1200,
     articleCount: 20,
     quality: 0.9,
     category: "Business"
   };
   ```

4. **Performance Integration**
   ```javascript
   // Updates sources configuration
   const newSource = {
     name: "Harvard Business Review",
     type: "rss",
     url: "https://hbr.org/feed",
     enabled: true,
     performance: {
       successRate: 1.0,
       trendContribution: 0,
       avgArticleQuality: 0.9,
       lastSuccessfulFetch: new Date().toISOString()
     }
   };
   ```

### Performance Tracking

The system tracks multiple metrics for each feed:

- **Success Rate**: Percentage of successful fetches
- **Trend Contribution**: Number of trends generated from this feed
- **Article Quality**: Average quality score of articles
- **Response Time**: How quickly the feed responds
- **Failure Count**: Number of consecutive failures

### Optimization Rules

```javascript
const thresholds = {
  autoDisableAfterFailures: 5,
  minSuccessRateToKeep: 0.6,
  minTrendContributionToKeep: 1,
  maxFeedsPerCategory: 8,
  qualityScoreThreshold: 0.5
};
```

## Integration with Main Workflow

### 1. **Feed Performance Updates**
After each RSS fetch in the main workflow:

```javascript
// In RSS processing node
const feedName = "TechCrunch";
const success = items.length > 0;
const articleCount = items.length;
const quality = calculateQualityScore(items);
const trendContribution = countTrendsFromFeed(items);

// Update performance
await fetch('/api/feed-performance', {
  method: 'POST',
  body: JSON.stringify({
    feedName, success, articleCount, quality, trendContribution
  })
});
```

### 2. **Dynamic Feed Loading**
The main workflow loads feeds dynamically from the updated configuration:

```javascript
// Load current sources configuration
const sourcesConfig = JSON.parse(fs.readFileSync('config/sources.json'));
const enabledFeeds = sourcesConfig.sources.filter(s => s.enabled);

// Create RSS nodes dynamically
enabledFeeds.forEach(feed => {
  // Create RSS node for this feed
  // Connect to merge node
  // Track performance after processing
});
```

## Benefits

### 🎯 **Improved Content Quality**
- Automatically finds high-quality RSS feeds
- Removes low-performing sources
- Maintains diverse content coverage

### 📈 **Better Trend Generation**
- More relevant and timely content
- Higher quality trend insights
- Reduced noise from poor sources

### 🔄 **Self-Maintenance**
- No manual feed management required
- Continuous performance optimization
- Automatic problem detection and resolution

### 📊 **Performance Insights**
- Detailed analytics on feed performance
- Category-level performance tracking
- Discovery success rate monitoring

## Configuration Options

### Discovery Settings
```json
{
  "adaptiveDiscovery": {
    "enabled": true,
    "discoveryFrequency": "weekly", // daily, weekly, monthly
    "maxFeedsPerCategory": 5,
    "minSuccessRate": 0.7,
    "minTrendContribution": 2,
    "searchKeywords": [
      "marketing trends RSS",
      "tech innovation RSS",
      "business news RSS"
    ],
    "excludedDomains": [
      "facebook.com",
      "twitter.com",
      "instagram.com"
    ]
  }
}
```

### Performance Thresholds
```json
{
  "performanceThresholds": {
    "autoDisableAfterFailures": 5,
    "minSuccessRateToKeep": 0.6,
    "minTrendContributionToKeep": 1,
    "maxFeedsPerCategory": 8,
    "qualityScoreThreshold": 0.5
  }
}
```

## Monitoring and Reports

### Weekly Discovery Report
```json
{
  "timestamp": "2025-08-15T02:00:00Z",
  "discoveryRun": true,
  "summary": {
    "newFeedsAdded": 3,
    "feedsDisabled": 1,
    "totalFeeds": 15,
    "enabledFeeds": 12
  },
  "recommendations": [
    "Added 3 new RSS feeds to improve coverage",
    "Disabled 1 underperforming feed to maintain quality",
    "Monitor 2 feeds that are underperforming"
  ]
}
```

### Performance Dashboard
- **Feed Performance Summary**: Success rates, trend contributions
- **Category Performance**: Coverage and quality by category
- **Discovery History**: Track of discovered and tested feeds
- **Optimization Recommendations**: Suggested improvements

## Future Enhancements

### 🔮 **Planned Features**
1. **AI-Powered Feed Analysis**: Use AI to analyze feed content quality
2. **Trend Prediction**: Predict which feeds will produce good trends
3. **Cross-Platform Discovery**: Find feeds from multiple platforms
4. **User Feedback Integration**: Incorporate user ratings of trends
5. **Seasonal Optimization**: Adjust feed priorities based on trends

### 🤖 **Advanced AI Integration**
- **Content Quality Assessment**: AI evaluation of article relevance
- **Trend Relevance Scoring**: Predict trend potential from articles
- **Category Classification**: Automatically categorize new feeds
- **Performance Prediction**: Forecast feed performance

## Getting Started

### 1. **Setup Database**
```sql
-- Run the feed performance schema
\i database-schema-feed-performance.sql
```

### 2. **Import Discovery Workflow**
- Import `adaptive-feed-discovery.json` into n8n
- Configure the weekly trigger schedule
- Test the workflow manually

### 3. **Update Main Workflow**
- Add performance tracking to RSS nodes
- Integrate dynamic feed loading
- Add performance reporting

### 4. **Monitor Performance**
- Check weekly discovery reports
- Monitor feed performance dashboard
- Review optimization recommendations

## Troubleshooting

### Common Issues

1. **Discovery Not Running**
   - Check cron trigger configuration
   - Verify file permissions for config updates
   - Review n8n logs for errors

2. **Poor Feed Performance**
   - Review performance thresholds
   - Check network connectivity
   - Verify RSS feed URLs

3. **Database Errors**
   - Ensure schema is properly installed
   - Check database permissions
   - Verify environment variables

### Debug Mode
Enable debug logging in the discovery workflow to see detailed information about the discovery process.

---

This adaptive feed discovery system transforms the trends dashboard from a static collection of RSS feeds into a dynamic, self-improving content engine that continuously optimizes for better trend generation.
