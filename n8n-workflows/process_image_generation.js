// Process image generation results and add image URLs back to trend data
// This node should be inserted after the OpenAI image generation node

const inputData = $json;
const trends = Array.isArray(inputData.trends) ? inputData.trends : [];

console.log(`🖼️ Processing image generation results for ${trends.length} trends...`);

// Process each trend to add the generated image URL
const processedTrends = trends.map((trend, index) => {
  // Check if this trend has a generated image URL
  const imageUrl = trend.generatedImageUrl || null;
  
  if (imageUrl) {
    console.log(`✅ Image generated for "${trend.title}": ${imageUrl}`);
  } else {
    console.log(`❌ No image generated for "${trend.title}"`);
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
console.log(`🎯 Image processing complete: ${successfulGenerations}/${trends.length} successful`);

return [{
  json: {
    ...inputData,
    trends: processedTrends
  }
}];
