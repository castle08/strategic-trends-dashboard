// Fixed Process Trend Item node code
const rawData = $input.first().json;
let aiResult;

try {
  // Get the OpenAI response - try multiple possible paths
  const response = $json.message?.content || $json.message || $json.choices?.[0]?.message?.content || $json;
  aiResult = typeof response === 'string' ? JSON.parse(response) : response;
  console.log('AI analysis successful');
} catch (error) {
  console.log('AI parsing failed, using fallback:', error);
  // Enhanced fallback with better categorization
  const title = rawData.title.toLowerCase();
  let category = 'Marketing';
  if (title.includes('ai') || title.includes('artificial intelligence') || title.includes('machine learning')) category = 'AI/ML';
  else if (title.includes('social') || title.includes('instagram') || title.includes('facebook') || title.includes('twitter')) category = 'Social Media';
  else if (title.includes('ecommerce') || title.includes('e-commerce') || title.includes('shopping')) category = 'E-commerce';
  else if (title.includes('design') || title.includes('ux') || title.includes('ui')) category = 'Design';
  else if (title.includes('data') || title.includes('analytics') || title.includes('insights')) category = 'Data/Analytics';
  else if (title.includes('tech') || title.includes('digital')) category = 'Technology';
  
  aiResult = {
    category: category,
    tags: rawData.title.toLowerCase().split(/\W+/).filter(w => w.length > 3).slice(0, 5),
    scores: {
      novelty: 60 + Math.random() * 30,
      velocity: 50 + Math.random() * 40,
      relevance: 65 + Math.random() * 25,
      confidence: 75
    },
    whyItMatters: `This ${category.toLowerCase()} trend represents a significant development that could reshape marketing strategies and customer engagement approaches.`,
    brandAngles: ['Market differentiation', 'Customer engagement', 'Innovation leadership', 'Competitive advantage'],
    exampleUseCases: ['Campaign strategy', 'Content creation', 'Customer experience', 'Brand positioning'],
    creative: {
      shortCardCopy: rawData.title.substring(0, 75) + (rawData.title.length > 75 ? '...' : ''),
      imagePrompt: `Professional marketing illustration showing ${rawData.title.toLowerCase()} concept with modern business aesthetic`,
      altText: `Visual representation of ${rawData.title} trend in marketing`,
      podcastSnippet: `Here's an interesting development: ${rawData.title}. ${rawData.summary.substring(0, 200)}`
    }
  };
}

// Ensure scores exist and calculate total
if (!aiResult.scores) {
  aiResult.scores = { novelty: 70, velocity: 60, relevance: 75, confidence: 70 };
}
aiResult.scores.total = (aiResult.scores.novelty + aiResult.scores.velocity + aiResult.scores.relevance + aiResult.scores.confidence) / 4;

// Generate viz properties with improved size calculation
const normalizedScore = Math.max(0, Math.min(100, aiResult.scores.total)) / 100;
const size = Math.round(2 + Math.pow(normalizedScore, 1.5) * 10);
const intensity = 0.3 + (aiResult.scores.velocity / 100) * 1.7;

// Generate color from category
let hash = 0;
const categoryStr = aiResult.category || 'Marketing';
for (let i = 0; i < categoryStr.length; i++) {
  hash = ((hash << 5) - hash) + categoryStr.charCodeAt(i);
  hash = hash & hash;
}
const hue = Math.abs(hash) % 360;
const saturation = 65 + (Math.abs(hash >> 8) % 25);
const lightness = 50 + (Math.abs(hash >> 16) % 15);

const trendItem = {
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  title: rawData.title || 'Untitled Trend',
  url: rawData.url || '',
  source: rawData.source || 'Unknown Source',
  publishedAt: rawData.publishedAt || new Date().toISOString(),
  summary: rawData.summary || 'No summary available',
  category: aiResult.category || 'Marketing',
  tags: aiResult.tags || [],
  scores: {
    novelty: Math.round((aiResult.scores.novelty || 70) * 10) / 10,
    velocity: Math.round((aiResult.scores.velocity || 60) * 10) / 10,
    relevance: Math.round((aiResult.scores.relevance || 75) * 10) / 10,
    confidence: Math.round((aiResult.scores.confidence || 70) * 10) / 10,
    total: Math.round(aiResult.scores.total * 10) / 10
  },
  whyItMatters: aiResult.whyItMatters || 'This trend could impact marketing strategies.',
  brandAngles: aiResult.brandAngles || ['Brand opportunity'],
  exampleUseCases: aiResult.exampleUseCases || ['Marketing application'],
  creative: aiResult.creative || {
    shortCardCopy: (rawData.title || 'Trend').substring(0, 75),
    imagePrompt: 'Professional marketing trend illustration',
    altText: 'Marketing trend visualization',
    podcastSnippet: 'An interesting marketing development worth noting.'
  },
  viz: {
    size: Math.max(2, size),
    intensity: Math.max(0.1, Math.round(intensity * 100) / 100),
    colorHint: `hsl(${hue}, ${saturation}%, ${lightness}%)`
  }
};

console.log(`✅ Processed trend: ${trendItem.title} (Size: ${trendItem.viz.size}, Score: ${trendItem.scores.total})`);

return [{ json: trendItem }];