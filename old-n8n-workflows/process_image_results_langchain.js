// Process individual image generation results and merge back with original trends
// This node processes the results from the LangChain OpenAI image generation node and merges them back

const inputItems = $input.all();

console.log(`🖼️ Processing ${inputItems.length} image generation results...`);

// Process each result to extract the image URL and trend data
const processedTrends = inputItems.map((item, index) => {
  console.log(`🔍 Processing item ${index + 1}:`, JSON.stringify(item.json, null, 2));
  
  // The LangChain OpenAI node returns the image URL in a different structure
  // It might be in item.json.url, item.json.data, or item.json.result
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
  
  // Get the trend data from the original input
  // The trend data should be preserved from the previous node
  const trend = item.json.trend || item.json.originalTrend || item.json.inputTrend;
  const trendTitle = item.json.trendTitle || trend?.title || `Trend ${index + 1}`;
  
  if (!trend) {
    console.log(`❌ No trend data found for item ${index + 1}`);
    console.log(`🔍 Available keys:`, Object.keys(item.json || {}));
    return null; // Skip this item
  }
  
  if (imageUrl) {
    console.log(`✅ Image generated for "${trendTitle}": ${imageUrl}`);
  } else {
    console.log(`❌ No image generated for "${trendTitle}"`);
  }
  
  return {
    ...trend,
    creative: {
      ...trend.creative,
      imageUrl: imageUrl
    }
  };
}).filter(Boolean); // Remove any null items

// Count successful generations
const successfulGenerations = processedTrends.filter(t => t.creative.imageUrl).length;
console.log(`🎯 Image processing complete: ${successfulGenerations}/${processedTrends.length} successful`);

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
