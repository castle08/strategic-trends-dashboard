// Merge original trends with generated image URLs
// This node combines the trends data with the image URLs from the OpenAI node

const inputItems = $input.all();

console.log(`🔄 Merging trends with images...`);

// We expect 2 inputs:
// Input 1: Original trends data (from Generate Image Prompts)
// Input 2: Generated image URLs (from OpenAI node)

if (inputItems.length < 2) {
  console.log(`❌ Expected 2 inputs, got ${inputItems.length}`);
  return [];
}

const originalTrendsData = inputItems[0].json;
const imageResults = inputItems[1];

console.log(`📊 Original trends: ${originalTrendsData.trends?.length || 0}`);
console.log(`🖼️ Image results: ${imageResults.length || 0}`);

// Extract image URLs from the OpenAI results
const imageUrls = [];
if (Array.isArray(imageResults)) {
  imageResults.forEach((item, index) => {
    let imageUrl = null;
    
    // Try different possible locations for the image URL
    if (item.json && item.json.url) {
      imageUrl = item.json.url;
    } else if (item.json && item.json.data && item.json.data.url) {
      imageUrl = item.json.data.url;
    } else if (item.json && item.json.result) {
      imageUrl = item.json.result;
    } else if (item.json && typeof item.json === 'string' && item.json.startsWith('http')) {
      imageUrl = item.json;
    }
    
    if (imageUrl) {
      console.log(`✅ Image ${index + 1}: ${imageUrl}`);
      imageUrls.push(imageUrl);
    } else {
      console.log(`❌ No image for item ${index + 1}`);
      imageUrls.push(null);
    }
  });
}

// Combine original trends with generated images
const originalTrends = originalTrendsData.trends || [];
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

// Count successful generations
const successfulGenerations = processedTrends.filter(t => t.creative.imageUrl).length;
console.log(`🎯 Merge complete: ${successfulGenerations}/${imageUrls.length} images assigned`);

return [{
  json: {
    trends: processedTrends,
    generatedAt: new Date().toISOString(),
    sourceSummary: {
      totalFetched: processedTrends.length,
      afterCluster: processedTrends.length,
      sources: ['Strategic Market Intelligence']
    }
  }
}];
