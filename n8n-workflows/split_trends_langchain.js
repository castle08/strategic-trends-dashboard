// Split trends into individual items for image generation
// This node creates separate items for each trend so the LangChain OpenAI node can process them individually

const inputData = $json;
const trends = Array.isArray(inputData.trends) ? inputData.trends : [];

console.log(`🔄 Splitting ${trends.length} trends into individual items for image generation...`);

// Limit to first 5 trends for testing (to control costs and processing time)
// In production, you can increase this number or process all trends
const MAX_TRENDS_FOR_IMAGES = 5;
const trendsToProcess = trends.slice(0, MAX_TRENDS_FOR_IMAGES);
console.log(`📊 Processing first ${trendsToProcess.length} trends for image generation (out of ${trends.length} total)`);

// Create separate items for each trend to process
// For LangChain OpenAI node, we need to structure the data differently
// The trend data needs to be preserved in multiple locations to ensure it survives the LangChain node
const individualTrends = trendsToProcess.map(trend => ({
  json: {
    // This is what the LangChain node will use for the prompt
    trend: {
      ...trend,
      imageGenerationPrompt: trend.imageGenerationPrompt
    },
    // Preserve the original trend data in multiple locations for safety
    originalTrend: trend,
    inputTrend: trend,
    trendId: trend.id,
    trendTitle: trend.title,
    // Also include the prompt at the top level as backup
    prompt: trend.imageGenerationPrompt
  }
}));

console.log(`✅ Created ${individualTrends.length} individual trend items for image generation`);

return individualTrends;
