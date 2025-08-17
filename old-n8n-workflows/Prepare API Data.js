// Prepare API data for single trend from merged data

// Get trend data from the first input (Process Single Trend)
// The brain outputs: { trend: { output: { trends: [...] } } }
const trendOutput = $input.item.json.trend;
const trend = trendOutput.output.trends[0]; // Get the first trend from the array
// Get image data from the second input (Extract Image)  
const imageBinary = $input.item.json.base64Image;

console.log(`🎯 Preparing API data for trend: "${trend.title}"`);

// Ensure trend has all required fields for API validation
const enhancedTrend = {
  ...trend,
  // Ensure creative structure exists
  creative: {
    ...trend.creative,
    imagePrompt: trend.creative?.imagePrompt || `3D wireframe representing ${trend.title}`,
    shortCardCopy: trend.creative?.shortCardCopy || trend.title.substring(0, 140),
    altText: trend.creative?.altText || `Visual representation of ${trend.title}`,
    podcastSnippet: trend.creative?.podcastSnippet || `Today we're exploring ${trend.title}`
  },
  // Ensure viz structure exists
  viz: {
    ...trend.viz,
    size: trend.viz?.size || 15,
    intensity: trend.viz?.intensity || 1.5,
    colorHint: trend.viz?.colorHint || 'hsl(210, 80%, 50%)'
  },
  // Ensure scores structure exists
  scores: {
    ...trend.scores,
    total: trend.scores?.total || 50,
    novelty: trend.scores?.novelty || 50,
    velocity: trend.scores?.velocity || 50,
    relevance: trend.scores?.relevance || 50,
    confidence: trend.scores?.confidence || 50
  },
  // Add image binary
  imageBinary: imageBinary
};

// Create API payload in the format the API expects
const apiData = {
  trends: [enhancedTrend]
};

console.log(`✅ Prepared API data with ${apiData.trends.length} trend(s)`);
console.log(`🎨 Trend has creative.imagePrompt:`, !!enhancedTrend.creative?.imagePrompt);
console.log(`📊 Trend has viz.size:`, typeof enhancedTrend.viz?.size);

return [{
  json: {
    apiData: apiData,
    trendTitle: trend.title,
    generatedAt: new Date().toISOString()
  }
}];