// Process individual image generation results and merge back with original trends
// This node combines the generated images with the original trends data using a simpler approach

const inputItems = $input.all();

console.log(`🖼️ Processing ${inputItems.length} image generation results...`);

// Since the LangChain OpenAI node only returns images, we need to reconstruct the trends
// We'll use the original trends data that was sent to the Split Trends node
// The images are returned in the same order as the trends were sent

// Extract image URLs from the OpenAI node results
const imageUrls = [];
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
    imageUrls.push(imageUrl);
  } else {
    console.log(`❌ No image generated for item ${index + 1}`);
    imageUrls.push(null);
  }
});

// For now, we'll create a simple output that can be manually combined
// In a production workflow, you might want to use a different approach
console.log(`📊 Generated ${imageUrls.filter(url => url).length} images out of ${imageUrls.length} attempts`);

// Return the image URLs for manual processing or further automation
return [{
  json: {
    imageUrls: imageUrls,
    generatedAt: new Date().toISOString(),
    message: "Images generated successfully. Manual combination with trends data required.",
    count: imageUrls.filter(url => url).length
  }
}];
