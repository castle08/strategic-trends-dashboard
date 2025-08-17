// Generate 3D-style images for each trend using OpenAI's image API
// This node should be inserted between "Finalize Trends" and "Update Live Dashboard"

const OPENAI_API_KEY = $env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/images/generations';

// Image generation configuration
const IMAGE_CONFIG = {
  model: 'dall-e-3',
  size: '1024x1024',
  quality: 'standard',
  style: 'vivid',
  format: 'png'
};

// Generate image prompt for a trend
function generateImagePrompt(trend) {
  const { title, category, summary, whyItMatters, scores, creative } = trend;
  
  // Create a unique, detailed prompt using trend data
  let basePrompt = creative?.imagePrompt || `A 3D visualization representing "${title}"`;
  
  // Extract key concepts from trend data
  const keyConcepts = [];
  if (summary) keyConcepts.push(summary.substring(0, 100));
  if (whyItMatters) keyConcepts.push(whyItMatters.substring(0, 100));
  
  // Create category-specific visual elements
  const categoryVisuals = {
    'technology': 'futuristic interfaces, digital networks, glowing circuits',
    'ai': 'neural networks, artificial intelligence, machine learning visualizations',
    'media': 'content creation, broadcasting, digital media platforms',
    'culture': 'social movements, cultural shifts, human behavior patterns',
    'retail': 'shopping experiences, e-commerce platforms, consumer behavior',
    'consumer behaviour': 'human interactions, decision-making processes, behavioral patterns',
    'creativity': 'artistic expression, creative processes, design elements',
    'regulation': 'legal frameworks, compliance structures, governance systems',
    'data & privacy': 'data flows, privacy protection, security measures',
    'sustainability': 'environmental elements, green technology, eco-friendly solutions'
  };
  
  const visualElements = categoryVisuals[category.toLowerCase()] || 'abstract concepts, modern design elements';
  
  // Enhanced prompt template with trend-specific details
  const enhancedPrompt = `Create a hyper-detailed 3D render of ${basePrompt} in the ${category} category.
  
  • Core Concept: "${title}" - ${keyConcepts.join(' ')}
  • Visual Elements: ${visualElements}
  • Impact Score: ${scores.total}/100 (${scores.novelty} novelty, ${scores.velocity} velocity, ${scores.relevance} relevance)
  
  • Perspective: Slightly angled from above, showing depth and dimension.
  • Primary color tone: Use colors that complement the ${category} theme prominently in lighting, accents, and key elements.
  • Details: Include realistic textures, materials, and lighting that represent the trend concept.
  • Symbolism: Incorporate visual metaphors that clearly represent "${title}" and its significance in ${category}.
  • Lighting: Studio-quality lighting with soft shadows and realistic reflections.
  • Style: Realistic yet slightly stylized for visual clarity, cinematic depth of field.
  • Background: Transparent PNG with alpha channel (no sky or scenery).
  • Format: 1024x1024 PNG with transparent background.`;

  return enhancedPrompt;
}

// Generate image for a single trend
async function generateTrendImage(trend) {
  try {
    const prompt = generateImagePrompt(trend);
    
    console.log(`🎨 Generating image for: "${trend.title}"`);
    console.log(`📝 Prompt: ${prompt.substring(0, 100)}...`);
    
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: IMAGE_CONFIG.model,
        prompt: prompt,
        size: IMAGE_CONFIG.size,
        quality: IMAGE_CONFIG.quality,
        style: IMAGE_CONFIG.style,
        response_format: 'url'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const imageUrl = data.data[0].url;
    
    console.log(`✅ Image generated successfully: ${imageUrl}`);
    
    return {
      ...trend,
      creative: {
        ...trend.creative,
        imageUrl: imageUrl
      }
    };
    
  } catch (error) {
    console.error(`❌ Failed to generate image for "${trend.title}":`, error.message);
    
    // Return trend without image URL on failure
    return {
      ...trend,
      creative: {
        ...trend.creative,
        imageUrl: null
      }
    };
  }
}

// Main execution
async function processTrends() {
  const inputData = $json;
  const trends = Array.isArray(inputData.trends) ? inputData.trends : [];
  
  if (trends.length === 0) {
    console.log('⚠️ No trends to process for image generation');
    return [{ json: inputData }];
  }
  
  console.log(`🖼️ Starting image generation for ${trends.length} trends...`);
  
  // Process trends sequentially to avoid rate limits
  const processedTrends = [];
  for (let i = 0; i < trends.length; i++) {
    const trend = trends[i];
    console.log(`📊 Processing trend ${i + 1}/${trends.length}: "${trend.title}"`);
    
    const processedTrend = await generateTrendImage(trend);
    processedTrends.push(processedTrend);
    
    // Rate limiting: wait 1 second between requests
    if (i < trends.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Count successful generations
  const successfulGenerations = processedTrends.filter(t => t.creative.imageUrl).length;
  console.log(`🎯 Image generation complete: ${successfulGenerations}/${trends.length} successful`);
  
  return [{
    json: {
      ...inputData,
      trends: processedTrends
    }
  }];
}

// Execute the main function
return await processTrends();
