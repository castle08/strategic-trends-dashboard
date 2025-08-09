// GPT-5 Response Processor - Parse and Validate Output
console.log('🔄 === GPT-5 RESPONSE PROCESSING START ===');

const rawResponse = $input.first().json;
let trendsData;

// Debug the response structure
console.log('📥 Raw response type:', typeof rawResponse);
console.log('📥 Response keys:', Object.keys(rawResponse));

try {
  // Extract the actual response content
  let responseContent;
  
  if (rawResponse.message?.content) {
    responseContent = rawResponse.message.content;
  } else if (rawResponse.choices?.[0]?.message?.content) {
    responseContent = rawResponse.choices[0].message.content;
  } else if (rawResponse.content) {
    responseContent = rawResponse.content;
  } else if (typeof rawResponse === 'string') {
    responseContent = rawResponse;
  } else {
    throw new Error('Could not find response content in expected locations');
  }
  
  console.log('📝 Response content type:', typeof responseContent);
  console.log('📝 Content preview:', responseContent.substring(0, 200));
  
  // Parse JSON response
  if (typeof responseContent === 'string') {
    // Clean any markdown formatting
    const cleanContent = responseContent.replace(/```json\n?|\n?```/g, '').trim();
    trendsData = JSON.parse(cleanContent);
  } else {
    trendsData = responseContent;
  }
  
  // Validate structure
  if (!trendsData.trends || !Array.isArray(trendsData.trends)) {
    throw new Error('Invalid response: missing trends array');
  }
  
  console.log(`✅ Successfully parsed ${trendsData.trends.length} trends`);
  
  // Ensure each trend has proper viz properties for 3D spheres
  trendsData.trends = trendsData.trends.map((trend, index) => {
    // Calculate size based on total score (2-12 range for variety)
    const normalizedScore = Math.max(0, Math.min(100, trend.scores?.total || 70)) / 100;
    const size = Math.max(2, Math.round(2 + Math.pow(normalizedScore, 1.2) * 10));
    
    // Calculate intensity based on velocity score
    const intensity = Math.max(0.3, Math.round(((trend.scores?.velocity || 60) / 100 * 1.7 + 0.3) * 100) / 100);
    
    // Generate color from category
    const category = trend.category || 'Marketing';
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      hash = ((hash << 5) - hash) + category.charCodeAt(i);
      hash = hash & hash;
    }
    const hue = Math.abs(hash) % 360;
    const saturation = 60 + (Math.abs(hash >> 8) % 30);
    const lightness = 45 + (Math.abs(hash >> 16) % 25);
    
    // Ensure proper viz object
    trend.viz = {
      size: size,
      intensity: intensity,
      colorHint: `hsl(${hue}, ${saturation}%, ${lightness}%)`
    };
    
    console.log(`🎨 Trend ${index + 1}: "${trend.title.substring(0, 30)}..." Size:${size} Intensity:${intensity}`);
    
    return trend;
  });
  
  // Ensure sourceSummary exists
  if (!trendsData.sourceSummary) {
    const sources = [...new Set(trendsData.trends.map(t => t.source))];
    const categories = [...new Set(trendsData.trends.map(t => t.category))];
    const scores = trendsData.trends.map(t => t.scores?.total || 70);
    
    trendsData.sourceSummary = {
      totalFetched: trendsData.trends.length,
      afterDedupe: trendsData.trends.length,
      sources: sources,
      topCategories: categories.slice(0, 5),
      scoreRange: {
        min: Math.min(...scores),
        max: Math.max(...scores),
        average: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10
      }
    };
  }
  
  // Ensure generatedAt timestamp
  if (!trendsData.generatedAt) {
    trendsData.generatedAt = new Date().toISOString();
  }
  
  console.log('📊 Final summary:');
  console.log(`   • ${trendsData.trends.length} trends processed`);
  console.log(`   • ${trendsData.sourceSummary.sources.length} unique sources`);
  console.log(`   • Score range: ${trendsData.sourceSummary.scoreRange.min}-${trendsData.sourceSummary.scoreRange.max}`);
  console.log(`   • Top categories: ${trendsData.sourceSummary.topCategories.join(', ')}`);
  
} catch (error) {
  console.error('❌ GPT-5 response parsing failed:', error.message);
  console.log('🔄 Creating fallback data structure');
  
  // Fallback structure
  trendsData = {
    generatedAt: new Date().toISOString(),
    sourceSummary: {
      totalFetched: 1,
      afterDedupe: 1,
      sources: ["Error Recovery"],
      topCategories: ["Error"],
      scoreRange: { min: 70, max: 70, average: 70 }
    },
    trends: [{
      id: Date.now().toString(),
      title: "GPT-5 Processing Error",
      url: "",
      source: "Error Recovery", 
      publishedAt: new Date().toISOString(),
      summary: `Failed to parse GPT-5 response: ${error.message}`,
      category: "Error",
      tags: ["error", "processing"],
      scores: { novelty: 70, velocity: 60, relevance: 50, confidence: 30, total: 52.5 },
      whyItMatters: "System encountered an error processing the trends analysis.",
      brandAngles: ["Error handling", "System reliability"],
      exampleUseCases: ["Debug workflows", "Error recovery"],
      creative: {
        shortCardCopy: "Processing Error",
        imagePrompt: "Error message illustration",
        altText: "Processing error",
        podcastSnippet: "An error occurred during trend analysis."
      },
      viz: { size: 4, intensity: 0.8, colorHint: "hsl(0, 70%, 50%)" }
    }]
  };
}

console.log('🔄 === GPT-5 RESPONSE PROCESSING END ===');

return [{ json: trendsData }];