## Requirements for Image Prompt
For each trend:
- **Style:** hyper-detailed 3D render style, studio lighting, soft shadows, realistic textures.
- **Theme:** Include visual metaphors for the trend’s category and title.
- **Perspective:** Slightly angled from above to suggest depth.
- **Colors:** Use a dominant tone from the category’s color field.
- **Background:** Transparent PNG with alpha channel — no sky, no full-scene background.
- **Format:** 1024x1024 PNG.

## Example image prompt that has been generated to send to the image model: Things like the Trend Name, the Category name
Create a hyper-detailed 3D render of a floating island symbolizing “Gen Z Micro-Influencer Trust” (trend title) in the Social Media (trend category) category.
	•	Perspective: Slightly angled from above, showing depth and dimension.
	•	Primary color tone: #803bff (trend category colour) (purple) used prominently in lighting, accents, and key elements.
	•	Island details: Lush green grass, natural landscaping with small trees, bushes, and flowers tinted with purple accents. Include realistic textures for soil, rock, and foliage.
	•	Symbolism: A large glowing 3D icon of two hands shaking above the island, with the word “Trust” in glowing 3D neon letters below it. Surround with floating holographic smartphone screens displaying social media profiles, likes, comments, and “verified” badges. Include small human figures interacting with the environment, symbolizing micro-influencers and their followers.
	•	Lighting: Studio-quality lighting with soft shadows and realistic reflections. Integrate glowing neon light trails connecting devices and people to convey a digital network.
	•	Style: Realistic yet slightly stylized for visual clarity, cinematic depth of field.
	•	Background: Transparent PNG with alpha channel (no sky or scenery).


// Generate image prompt for single trend

const trend = $json.trend;

// Use the existing imagePrompt as the base, or create one from the title
const basePrompt = trend.creative?.imagePrompt || `a 3D wireframe floating island`;

// Create the detailed prompt
const imagePrompt = `Create a hyper-detailed, high quality render of ${basePrompt} representing "${trend.title}" in the ${trend.category} category.

Style:
• Clean 3D wireframe with thin, glowing lines and geometric shapes
• Symbolism: Include visual elements symbolizing the trend theme "${trend.title}" and its significance in ${trend.category}
• Materials: Transparent surfaces with visible wireframe edges
• Primary color tone: Use ${trend.viz.colorHint} prominently in lighting, accents, and key elements
• Lighting: Subtle glow along the wireframe lines with ${trend.viz.colorHint} color
• Background: Transparent PNG with alpha channel (no sky or scenery)
• Format: 1024x1024 PNG with transparent background`;

console.log(`📝 Generated image prompt for "${trend.title}": ${imagePrompt.substring(0, 100)}...`);

return [{
  json: {
    trend: trend,
    imagePrompt: imagePrompt,
    generatedAt: new Date().toISOString()
  }
}];