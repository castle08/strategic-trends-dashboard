// Process individual image generation results and merge back with original trends
// This node combines the generated images with the original trends data

const inputItems = $input.all();

console.log(`🖼️ Processing ${inputItems.length} image generation results...`);

// Get the original trends data from the "Generate Image Prompts" node
// We need to access the original trends that were sent for image generation
const originalTrendsData = $('Generate Image Prompts').first().json;
const originalTrends = originalTrendsData.trends || [];

console.log(`📊 Found ${originalTrends.length} original trends to match with images`);

// Extract image URLs from the OpenAI node results
const imageResults = [];
inputItems.forEach((item, index) => {
  let imageUrl = null;
  
  // Try different possible locations for the image URL from LangChain OpenAI node
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
    console.log(`✅ Image ${index + 1} generated: ${imageUrl}`);
    imageResults.push({ index, imageUrl });
  } else {
    console.log(`❌ No image generated for item ${index + 1}`);
  }
});

// Combine original trends with generated images
// We'll assign images to the first N trends (where N is the number of images generated)
const processedTrends = originalTrends.map((trend, index) => {
  const imageResult = imageResults.find(img => img.index === index);
  const imageUrl = imageResult ? imageResult.imageUrl : null;
  
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
console.log(`🎯 Image processing complete: ${successfulGenerations}/${imageResults.length} successful`);

console.log(`📊 Final trends with images: ${processedTrends.length} trends processed`);

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
