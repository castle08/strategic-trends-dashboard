// Generate detailed image prompts for each trend using the template from imageprompt.md
// This node should be inserted between "Finalize Trends" and the OpenAI image generation node

const inputData = $json;
const trends = Array.isArray(inputData.trends) ? inputData.trends : [];

console.log(`🎨 Generating image prompts for ${trends.length} trends...`);

// Process each trend to create detailed image prompts
const processedTrends = trends.map((trend, index) => {
  const { title, category, creative } = trend;
  
  // Use the existing imagePrompt as the base, or create one from the title
  const basePrompt = creative?.imagePrompt || `A 3D visualization representing "${title}"`;
  
  // Create the detailed prompt using the template from imageprompt.md
  const detailedPrompt = `Create a hyper-detailed 3D render of ${basePrompt} symbolizing "${title}" (trend title) in the ${category} (trend category) category.
  
  • Perspective: Slightly angled from above, showing depth and dimension.
  • Primary color tone: Use colors that complement the ${category} theme prominently in lighting, accents, and key elements.
  • Details: Include realistic textures, materials, and lighting that represent the trend concept.
  • Symbolism: Incorporate visual metaphors that clearly represent "${title}" and its significance in ${category}.
  • Lighting: Studio-quality lighting with soft shadows and realistic reflections.
  • Style: Realistic yet slightly stylized for visual clarity, cinematic depth of field.
  • Background: Transparent PNG with alpha channel (no sky or scenery).
  • Format: 1024x1024 PNG with transparent background.`;

  console.log(`📝 Generated prompt for "${title}": ${detailedPrompt.substring(0, 100)}...`);
  
  return {
    ...trend,
    imageGenerationPrompt: detailedPrompt
  };
});

console.log(`✅ Generated ${processedTrends.length} image prompts`);

return [{
  json: {
    ...inputData,
    trends: processedTrends
  }
}];
