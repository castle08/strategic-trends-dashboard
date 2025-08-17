// ENHANCED Process Trend Item with Better Debugging and Fallback Logic
console.log('🧠 === AI TREND PROCESSING START ===');

const rawData = $input.first().json;
let aiResult;
const itemTitle = rawData.title?.substring(0, 40) || 'Unknown Item';

console.log(`🎯 Processing: "${itemTitle}..."`);
console.log(`📝 Raw data received:`, {
  hasTitle: !!(rawData.title),
  title: rawData.title,
  hasUrl: !!(rawData.url),
  url: rawData.url,
  hasSource: !!(rawData.source),
  source: rawData.source,
  hasSummary: !!(rawData.summary),
  summaryLength: (rawData.summary || '').length
});

// Check if we have valid input data first
if (!rawData.title || rawData.title === 'Untitled Trend') {
  console.log('❌ ERROR: No valid title in rawData - this indicates RSS processing failed upstream');
  console.log('🔧 Raw data keys:', Object.keys(rawData));
  console.log('🔧 Raw data sample:', JSON.stringify(rawData, null, 2).substring(0, 500));
  
  return [{
    json: {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: '🚨 DEBUG: No RSS Data Received',
      url: 'https://debug.required/no-rss-data',
      source: 'Debug Error',
      publishedAt: new Date().toISOString(),
      summary: 'The Process Trend Item node received invalid data, indicating RSS feeds are not working properly. Check the Clean & Dedupe node output.',
      category: 'Debug',
      tags: ['debug', 'error', 'rss'],
      scores: {
        novelty: 0,
        velocity: 0,
        relevance: 0,
        confidence: 0,
        total: 0
      },
      whyItMatters: 'This debug message indicates that RSS feeds are not providing valid data to the workflow.',
      brandAngles: ['Fix RSS feeds', 'Check network connectivity'],
      exampleUseCases: ['Debug workflow', 'Check RSS endpoints'],
      creative: {
        shortCardCopy: 'RSS Feed Debug Required',
        imagePrompt: 'Error message illustration',
        altText: 'Debug error message',
        podcastSnippet: 'There appears to be an issue with the RSS feed processing.'
      },
      viz: {
        size: 2,
        intensity: 0.1,
        colorHint: 'hsl(0, 100%, 50%)'
      }
    }
  }];
}

// Try to process OpenAI response
try {
  // Multiple paths for OpenAI response parsing
  const response = $json.message?.content || $json.message || $json.choices?.[0]?.message?.content || $json.content || $json;
  
  console.log(`📥 OpenAI response type: ${typeof response}`);
  console.log(`📥 OpenAI response sample: ${JSON.stringify(response).substring(0, 200)}...`);
  
  if (typeof response === 'string') {
    // Try to parse JSON string
    aiResult = JSON.parse(response.trim());
  } else if (typeof response === 'object' && response !== null) {
    aiResult = response;
  } else {
    throw new Error(`Unrecognized response format: ${typeof response}`);
  }
  
  console.log(`✅ AI analysis successful for: "${itemTitle}..."`);
  console.log(`📊 AI scores received:`, aiResult.scores);
  
} catch (error) {
  console.log(`⚠️ AI parsing failed for "${itemTitle}...", error: ${error.message}`);
  console.log(`🔧 Using enhanced intelligent fallback with REAL RSS data...`);
  
  // IMPORTANT: Use real RSS data in fallback, not dummy data
  const title = rawData.title || '';
  const summary = rawData.summary || '';
  const combinedText = title + ' ' + summary;
  
  // Enhanced categorization based on actual content
  let category = 'Marketing';
  const tags = [];
  let noveltyScore = 60;
  let velocityScore = 55;
  let relevanceScore = 70;
  
  // AI/ML Detection
  if (combinedText.match(/(ai|artificial intelligence|machine learning|chatgpt|llm|neural|automation)/i)) {
    category = 'AI/ML';
    tags.push('ai', 'automation', 'technology');
    noveltyScore = 75;
    velocityScore = 80;
    relevanceScore = 85;
  }
  // Social Media Detection
  else if (combinedText.match(/(social media|instagram|facebook|twitter|tiktok|linkedin|influencer)/i)) {
    category = 'Social Media';
    tags.push('social', 'content', 'engagement');
    noveltyScore = 65;
    velocityScore = 75;
    relevanceScore = 80;
  }
  // E-commerce Detection
  else if (combinedText.match(/(ecommerce|e-commerce|shopping|retail|conversion|checkout)/i)) {
    category = 'E-commerce';
    tags.push('ecommerce', 'retail', 'conversion');
    noveltyScore = 70;
    velocityScore = 70;
    relevanceScore = 82;
  }
  // Data/Analytics Detection
  else if (combinedText.match(/(data|analytics|insights|metrics|measurement|roi)/i)) {
    category = 'Data/Analytics';
    tags.push('data', 'analytics', 'metrics');
    noveltyScore = 68;
    velocityScore = 60;
    relevanceScore = 88;
  }
  
  // Add source-based tags
  if (rawData.source === 'HubSpot') tags.push('inbound');
  else if (rawData.source === 'Search Engine Land') tags.push('seo', 'search');
  else if (rawData.source === 'Neil Patel') tags.push('growth', 'optimization');
  
  // Ensure we have exactly 5 tags
  const genericTags = ['marketing', 'trends', 'business', 'strategy', 'growth'];
  while (tags.length < 5) {
    const newTag = genericTags.find(tag => !tags.includes(tag));
    if (newTag) tags.push(newTag);
    else break;
  }
  
  aiResult = {
    category: category,
    tags: tags.slice(0, 5),
    scores: {
      novelty: Math.round(noveltyScore + (Math.random() * 20 - 10)), // ±10 variance
      velocity: Math.round(velocityScore + (Math.random() * 20 - 10)),
      relevance: Math.round(relevanceScore + (Math.random() * 15 - 7.5)), // ±7.5 variance
      confidence: 75 // Lower confidence for fallback
    },
    whyItMatters: `This ${category.toLowerCase()} trend from ${rawData.source} highlights important developments that could influence marketing strategies and customer engagement approaches.`,
    brandAngles: [
      'Competitive differentiation strategy',
      'Enhanced customer engagement',
      'Innovation leadership positioning',
      'Market opportunity capture'
    ],
    exampleUseCases: [
      'Campaign strategy development',
      'Content marketing enhancement',
      'Customer experience optimization',
      'Performance measurement improvement'
    ],
    creative: {
      shortCardCopy: title.substring(0, 75) + (title.length > 75 ? '...' : ''),
      imagePrompt: `Professional marketing illustration showcasing ${category.toLowerCase()} concepts with modern business aesthetic, representing the trend: ${title.substring(0, 100)}`,
      altText: `Visual representation of ${category.toLowerCase()} trend from ${rawData.source}`,
      podcastSnippet: `Here's an interesting ${category.toLowerCase()} development from ${rawData.source}: ${title}. ${summary.substring(0, 150)}`
    }
  };
  
  console.log(`🔧 Fallback categorized as: ${category} with ${tags.length} tags`);
}

// Ensure all required fields exist and calculate total score
if (!aiResult.scores) {
  aiResult.scores = { novelty: 70, velocity: 60, relevance: 75, confidence: 70 };
}

// FIXED: Calculate total score properly (this was the original bug!)
aiResult.scores.total = Math.round(
  (aiResult.scores.novelty + aiResult.scores.velocity + aiResult.scores.relevance + aiResult.scores.confidence) / 4 * 10
) / 10;

// Generate enhanced visualization properties with PROPER size variation
const normalizedScore = Math.max(0, Math.min(100, aiResult.scores.total)) / 100;
const size = Math.max(2, Math.round(2 + Math.pow(normalizedScore, 1.5) * 10));
const intensity = Math.max(0.1, Math.round((0.3 + (aiResult.scores.velocity / 100) * 1.7) * 100) / 100);

// Generate consistent color from category
let hash = 0;
const categoryStr = aiResult.category || 'Marketing';
for (let i = 0; i < categoryStr.length; i++) {
  hash = ((hash << 5) - hash) + categoryStr.charCodeAt(i);
  hash = hash & hash;
}
const hue = Math.abs(hash) % 360;
const saturation = 65 + (Math.abs(hash >> 8) % 25);
const lightness = 45 + (Math.abs(hash >> 16) % 20);

// Create final trend item using REAL RSS data
const trendItem = {
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  title: rawData.title, // Use REAL title from RSS
  url: rawData.url, // Use REAL URL from RSS
  source: rawData.source, // Use REAL source from RSS
  publishedAt: rawData.publishedAt || new Date().toISOString(),
  summary: rawData.summary || 'No summary available',
  category: aiResult.category || 'Marketing',
  tags: aiResult.tags || ['marketing', 'trends'],
  scores: {
    novelty: Math.max(0, Math.min(100, Math.round((aiResult.scores.novelty || 70) * 10) / 10)),
    velocity: Math.max(0, Math.min(100, Math.round((aiResult.scores.velocity || 60) * 10) / 10)),
    relevance: Math.max(0, Math.min(100, Math.round((aiResult.scores.relevance || 75) * 10) / 10)),
    confidence: Math.max(0, Math.min(100, Math.round((aiResult.scores.confidence || 70) * 10) / 10)),
    total: aiResult.scores.total
  },
  whyItMatters: aiResult.whyItMatters || 'This trend represents a significant development in the marketing landscape.',
  brandAngles: aiResult.brandAngles || ['Strategic opportunity identification', 'Competitive advantage development'],
  exampleUseCases: aiResult.exampleUseCases || ['Marketing strategy enhancement', 'Customer engagement optimization'],
  creative: aiResult.creative || {
    shortCardCopy: rawData.title?.substring(0, 75) || 'Marketing Trend',
    imagePrompt: 'Professional marketing trend illustration',
    altText: 'Marketing trend visualization',
    podcastSnippet: 'An important marketing development worth noting.'
  },
  viz: {
    size: size,
    intensity: intensity,
    colorHint: `hsl(${hue}, ${saturation}%, ${lightness}%)`
  }
};

console.log(`✅ Final trend processed: "${trendItem.title}"`);
console.log(`📊 Scores - N:${trendItem.scores.novelty} V:${trendItem.scores.velocity} R:${trendItem.scores.relevance} C:${trendItem.scores.confidence} Total:${trendItem.scores.total}`);
console.log(`🎨 Viz - Size:${trendItem.viz.size} Intensity:${trendItem.viz.intensity} Color:${trendItem.viz.colorHint}`);
console.log(`🔍 Using data from: ${trendItem.source} - "${trendItem.title.substring(0, 50)}..."`);
console.log('🧠 === AI TREND PROCESSING END ===');

return [{ json: trendItem }];