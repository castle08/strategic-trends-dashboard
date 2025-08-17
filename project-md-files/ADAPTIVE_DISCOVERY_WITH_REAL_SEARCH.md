# Adaptive Discovery with Real Web Search

## 🤖 **Agent Integration Overview**

The adaptive feed discovery system works **alongside** your main trends agent:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Discovery     │    │   Main Trends    │    │   Your App      │
│   Workflow      │    │   Agent          │    │   Dashboard     │
│   (Weekly)      │    │   (Daily)        │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
   Finds better RSS      Uses optimized      Shows improved
   feeds automatically    feeds to generate   trends to users
                        better trends
```

## 🔍 **Replace Simulation with Real Web Search**

### Current Issue:
The "Web Search Discovery" node uses **simulated data** instead of real web search.

### Solution:
Replace the Code node with **OpenAI Web Search** nodes.

## 📋 **Updated Workflow Structure**

### 1. **Replace "Web Search Discovery" Node**

Instead of the current Code node, create:

**Node: "OpenAI Web Search"**
- **Type**: `n8n-nodes-base.openAi`
- **Operation**: `Web Search`
- **Model**: `gpt-4o-mini` (or your preferred model)
- **Search Query**: `={{ $json.query }}`
- **Max Results**: `5`

### 2. **Add "Process Search Results" Node**

**Node: "Process Search Results"**
- **Type**: `n8n-nodes-base.code`
- **Code**:
```javascript
// Process OpenAI web search results to find RSS feeds
const searchResults = $('OpenAI Web Search').first().json.results;
const searchQuery = $('Generate Search Queries').first().json.searchQueries;
const excludedDomains = $('Generate Search Queries').first().json.excludedDomains;

const candidateFeeds = [];

searchResults.forEach(result => {
  const url = result.url || '';
  const title = result.title || '';
  
  // Look for RSS feed indicators in the URL or title
  const isRSSFeed = url.includes('/feed') || 
                   url.includes('/rss') || 
                   url.includes('.xml') ||
                   title.toLowerCase().includes('rss') ||
                   title.toLowerCase().includes('feed');
  
  if (isRSSFeed) {
    // Extract domain
    const domain = new URL(url).hostname.replace('www.', '');
    
    // Check if domain is excluded
    const isExcluded = excludedDomains.some(domain => 
      result.domain.includes(domain.replace('*.', ''))
    );
    
    if (!isExcluded) {
      candidateFeeds.push({
        name: title,
        url: url,
        domain: domain,
        discoveredFrom: searchQuery,
        category: 'Technology', // Will be determined by AI analysis
        timestamp: new Date().toISOString()
      });
    }
  }
});

// Remove duplicates based on domain
const uniqueFeeds = [];
const seenDomains = new Set();
candidateFeeds.forEach(feed => {
  if (!seenDomains.has(feed.domain)) {
    seenDomains.add(feed.domain);
    uniqueFeeds.push(feed);
  }
});

console.log(`🔍 Discovered ${uniqueFeeds.length} candidate RSS feeds from real web search`);
console.log('Candidate feeds:', uniqueFeeds.map(f => `${f.name} (${f.domain})`));

return [{
  json: {
    candidateFeeds: uniqueFeeds,
    searchQueries: searchQuery,
    timestamp: new Date().toISOString()
  }
}];
```

### 3. **Add "AI Feed Analysis" Node**

**Node: "AI Feed Analysis"**
- **Type**: `n8n-nodes-base.openAi`
- **Operation**: `Chat`
- **Model**: `gpt-4o-mini`
- **Prompt**:
```
Analyze these discovered RSS feeds and determine their category and quality:

{{ $json.candidateFeeds }}

For each feed, provide:
1. Category (Technology, Business, Marketing, Creative, Advertising, Healthcare, Finance, Retail, Automotive, Gaming)
2. Quality score (0.0-1.0) based on:
   - Domain authority
   - Content relevance
   - Update frequency
   - Professional reputation

Return as JSON array with fields: name, url, domain, category, quality, reasoning
```

### 4. **Update "Test Candidate Feeds" Node**

Replace the simulation with real RSS testing:

```javascript
// Test candidate RSS feeds for validity and quality
const aiAnalysis = $('AI Feed Analysis').first().json.choices[0].message.content;
const analyzedFeeds = JSON.parse(aiAnalysis);
const currentSources = $('Analyze Current Feeds').first().json.sourcesConfig.sources;

const testResults = [];

// Test each feed with HTTP request
for (const feed of analyzedFeeds) {
  try {
    // Make HTTP request to test RSS feed
    const response = await fetch(feed.url, {
      method: 'GET',
      timeout: 5000
    });
    
    const testResult = {
      feed: feed,
      isValid: response.ok,
      responseTime: response.headers.get('x-response-time') || 1000,
      articleCount: 0, // Would parse RSS to count articles
      lastUpdated: new Date().toISOString(),
      quality: feed.quality || 0.5,
      category: feed.category || 'Technology'
    };
    
    // Check if feed already exists
    const alreadyExists = currentSources.some(source => 
      source.url === feed.url
    );
    
    if (alreadyExists) {
      testResult.isValid = false;
      testResult.reason = 'Already exists in sources';
    }
    
    testResults.push(testResult);
    
  } catch (error) {
    testResults.push({
      feed: feed,
      isValid: false,
      reason: error.message,
      quality: 0.0,
      category: feed.category || 'Technology'
    });
  }
}

// Filter valid feeds and sort by quality
const validFeeds = testResults
  .filter(result => result.isValid)
  .sort((a, b) => b.quality - a.quality);

console.log(`✅ Found ${validFeeds.length} valid RSS feeds out of ${analyzedFeeds.length} candidates`);

return [{
  json: {
    testResults: testResults,
    validFeeds: validFeeds,
    timestamp: new Date().toISOString()
  }
}];
```

## 🔄 **Updated Workflow Connections**

```
Generate Search Queries → OpenAI Web Search → Process Search Results → AI Feed Analysis → Test Candidate Feeds → Update Sources Config → Generate Discovery Report
```

## 🧪 **Testing the Real Search**

1. **Import the updated workflow**
2. **Configure OpenAI credentials**
3. **Test manually** with a single search query
4. **Check logs** to see real web search results
5. **Verify RSS feed testing** works correctly

## 🎯 **Benefits of Real Web Search**

- **Discovers actual RSS feeds** from the web
- **Finds new sources** like Harvard Business Review, MIT Technology Review
- **Real-time discovery** of emerging blogs and news sites
- **AI-powered analysis** of feed quality and categorization
- **Automatic testing** of discovered feeds

## 🤖 **Agent Integration**

Your main trends agent will automatically benefit from:

1. **Better RSS feeds** discovered by the weekly workflow
2. **Higher quality content** for trend generation
3. **More diverse sources** across all categories
4. **Self-improving system** that gets better over time

The discovery system feeds the agent, making it smarter without any changes to the agent itself!

## 📊 **Next Steps**

1. **Update the workflow** with real web search nodes
2. **Test the discovery process**
3. **Integrate with your main trends workflow**
4. **Set up weekly automation**

Would you like me to create the complete updated workflow JSON with real web search?
