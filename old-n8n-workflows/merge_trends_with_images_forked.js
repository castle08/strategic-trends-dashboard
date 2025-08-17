// Merge node: Combine original trends data with generated image URLs
// This node takes 2 inputs from a forked workflow:
// Input 1: Original trends data (direct from Finalize Trends fork)
// Input 2: Image URLs (from the image generation path)

const inputItems = $input.all();

console.log(`🔄 Merge node: Processing ${inputItems.length} inputs from forked workflow`);

// We expect 2 inputs:
// Input 1: Original trends data (from Finalize Trends fork)
// Input 2: Image URLs (from Process Image Results)

if (inputItems.length < 2) {
  console.log(`❌ Expected 2 inputs, got ${inputItems.length}`);
  console.log(`Input items:`, inputItems.map((item, i) => `Input ${i}: ${Object.keys(item.json || {}).join(', ')}`));
  return [];
}

// Get the original trends data (first input - direct from Finalize Trends)
const originalTrendsData = inputItems[0].json;
console.log(`📊 Original trends data from fork:`, {
  trendsCount: originalTrendsData.trends?.length || 0,
  hasSourceSummary: !!originalTrendsData.sourceSummary,
  generatedAt: originalTrendsData.generatedAt
});

// Get the image URLs (second input - from image generation path)
const imageUrlsData = inputItems[1].json;
console.log(`🖼️ Image URLs data from image path:`, {
  imageUrlsCount: imageUrlsData.imageUrls?.length || 0,
  successfulUrls: imageUrlsData.successfulUrls || 0
});

// Extract the image URLs
const imageUrls = imageUrlsData.imageUrls || imageUrlsData.urls || [];
console.log(`📸 Found ${imageUrls.filter(url => url).length} image URLs`);

// Get the original trends
const originalTrends = originalTrendsData.trends || [];
console.log(`📈 Found ${originalTrends.length} original trends from fork`);

// Combine trends with image URLs
const processedTrends = originalTrends.map((trend, index) => {
  const imageUrl = imageUrls[index] || null;
  
  if (imageUrl) {
    console.log(`🎯 Assigned image to "${trend.title}": ${imageUrl}`);
  }
  
  return {
    ...trend,
    creative: {
      ...trend.creative,
      imageUrl: imageUrl
    }
  };
});

// Count successful image assignments
const successfulImages = processedTrends.filter(t => t.creative.imageUrl).length;
console.log(`✅ Successfully assigned ${successfulImages} images to trends`);

// Return the complete data structure expected by the dashboard
return [{
  json: {
    trends: processedTrends,
    generatedAt: originalTrendsData.generatedAt || new Date().toISOString(),
    sourceSummary: originalTrendsData.sourceSummary || {
      totalFetched: processedTrends.length,
      afterCluster: processedTrends.length,
      sources: ['Strategic Market Intelligence']
    }
  }
}];
