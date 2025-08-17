// GPT-5 Trend Analyzer - Batch Process Multiple RSS Items
console.log('🤖 === GPT-5 TREND ANALYZER START ===');

const allItems = $input.all();
console.log(`📊 Processing ${allItems.length} RSS items with GPT-5`);

// Prepare batch data for GPT-5
const rssArticles = allItems.map((item, index) => {
  const data = item.json;
  return {
    id: index + 1,
    title: data.title || 'Untitled',
    url: data.url || '',
    source: data.source || 'Unknown Source',
    publishedAt: data.publishedAt || new Date().toISOString(),
    summary: data.summary || 'No summary available'
  };
});

// Log sample articles
rssArticles.slice(0, 3).forEach(article => {
  console.log(`📝 Article ${article.id}: "${article.title.substring(0, 50)}..." from ${article.source}`);
});

// Create the GPT-5 prompt for batch processing
const systemPrompt = `You are a marketing trend intelligence analyst. You analyze RSS articles and identify emerging marketing trends.

For each article provided, analyze it and generate a structured trend object with the following properties:

SCORING CRITERIA (0-100 scale):
- Novelty: How new/innovative is this trend? (0=old news, 100=breakthrough)  
- Velocity: How fast is this trend growing? (0=declining, 100=viral growth)
- Relevance: How relevant to marketers? (0=niche, 100=affects all marketers)
- Confidence: How confident are you in this assessment? (0=uncertain, 100=certain)

CATEGORIES: Choose from AI/ML, Social Media, E-commerce, Data/Analytics, Content Marketing, Email Marketing, SEO/SEM, Sustainability, Privacy/Compliance, Customer Experience, Branding, Innovation, Mobile Marketing, Video Marketing, Influencer Marketing, Marketing Technology, or Other.

Return ONLY a valid JSON object with this exact structure:

{
  "trends": [
    {
      "id": "generated_unique_id",
      "title": "original article title",
      "url": "original article url", 
      "source": "original source name",
      "publishedAt": "original timestamp",
      "summary": "original or improved summary (max 300 chars)",
      "category": "chosen category",
      "tags": ["relevant", "marketing", "tags", "max5"],
      "scores": {
        "novelty": 85,
        "velocity": 70,
        "relevance": 92,
        "confidence": 88,
        "total": 83.8
      },
      "whyItMatters": "2-3 sentences explaining strategic importance",
      "brandAngles": ["angle1", "angle2", "angle3"],
      "exampleUseCases": ["usecase1", "usecase2", "usecase3"],
      "creative": {
        "shortCardCopy": "Catchy headline (max 70 chars)",
        "imagePrompt": "Detailed image generation prompt",
        "altText": "Accessibility description",
        "podcastSnippet": "Engaging 1-2 sentence teaser"
      },
      "viz": {
        "size": 8,
        "intensity": 1.5,
        "colorHint": "hsl(210, 70%, 60%)"
      }
    }
  ],
  "sourceSummary": {
    "totalFetched": ${rssArticles.length},
    "afterDedupe": ${rssArticles.length},
    "sources": ["unique", "source", "names"],
    "topCategories": ["top", "categories"],
    "scoreRange": {
      "min": 0,
      "max": 100, 
      "average": 75
    }
  },
  "generatedAt": "${new Date().toISOString()}"
}

CRITICAL: Return ONLY the JSON object. No markdown, no explanations, no extra text.`;

const userPrompt = `Analyze these ${rssArticles.length} marketing articles and generate trend intelligence:

${rssArticles.map(article => `
ARTICLE ${article.id}:
Title: ${article.title}
Source: ${article.source}  
URL: ${article.url}
Published: ${article.publishedAt}
Summary: ${article.summary}
---`).join('\n')}

Generate the complete JSON response with all ${rssArticles.length} articles analyzed as trends.`;

console.log(`🎯 Prepared prompt for ${rssArticles.length} articles`);
console.log('📝 Sample articles prepared for GPT-5 analysis');

// Return the prepared data for GPT-5
return [{
  json: {
    systemPrompt: systemPrompt,
    userPrompt: userPrompt,
    articleCount: rssArticles.length,
    articles: rssArticles
  }
}];