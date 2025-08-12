# Task
You are helping me build a visual trend dashboard pipeline.

We already have:
- An n8n workflow that scrapes RSS feeds and processes them into structured JSON trends called 'test_v5.json' in the n8n-workflows folder
- Each trend has items like: title, category, summary, whyItMatters, scores, and a category color.

Your job:
- Add a step in n8n (before the JSON is sent to the app) that generates a 3D-style object image for each trend using OpenAI’s image API.
- The image should visually represent the trend while matching the assigned category color.
- Save the image URL to the `creative.imageUrl` field in the trend object.

## Requirements for Image Prompt
For each trend:
- **Style:** hyper-detailed 3D render style, studio lighting, soft shadows, realistic textures.
- **Theme:** Include visual metaphors for the trend’s category and title.
- **Perspective:** Slightly angled from above to suggest depth.
- **Colors:** Use a dominant tone from the category’s color field.
- **Background:** Transparent PNG with alpha channel — no sky, no full-scene background.
- **Format:** 1024x1024 PNG.

Example image prompt that has been generated to send to the image model: Things like the Trend Name, the Category name
Create a hyper-detailed 3D render of a floating island symbolizing “Gen Z Micro-Influencer Trust” (trend title) in the Social Media (trend category) category.
	•	Perspective: Slightly angled from above, showing depth and dimension.
	•	Primary color tone: #803bff (trend category colour) (purple) used prominently in lighting, accents, and key elements.
	•	Island details: Lush green grass, natural landscaping with small trees, bushes, and flowers tinted with purple accents. Include realistic textures for soil, rock, and foliage.
	•	Symbolism: A large glowing 3D icon of two hands shaking above the island, with the word “Trust” in glowing 3D neon letters below it. Surround with floating holographic smartphone screens displaying social media profiles, likes, comments, and “verified” badges. Include small human figures interacting with the environment, symbolizing micro-influencers and their followers.
	•	Lighting: Studio-quality lighting with soft shadows and realistic reflections. Integrate glowing neon light trails connecting devices and people to convey a digital network.
	•	Style: Realistic yet slightly stylized for visual clarity, cinematic depth of field.
	•	Background: Transparent PNG with alpha channel (no sky or scenery).


## Expected Output JSON Shape
The n8n node should return something like:
```json
{
  "trends": [
    {
      "id": "1",
      "title": "Emergence of AI-Driven Personalization",
      "category": "Technology",
      "color": "#2E6BFF",
      "creative": {
        "imageUrl": "https://files.example.com/trend-1.png"
      }
    }
  ]
}

	Create a copy of the existing n8n workflow to add an HTTP Request node that calls OpenAI’s images.generate endpoint for each trend.
	2.	Use the prompt above with string interpolation for trend.title, trend.category, and trend.color.
	3.	Save the generated image URL in the creative.imageUrl field of the trend.
	4.	Pass the updated JSON to the final output node so the app receives both the trend metadata and the visual asset.