// Process image URLs directly from LangChain OpenAI node
// This node should be connected directly to the OpenAI node output, not the debug node

const inputItems = $input.all();

console.log(`🖼️ Processing ${inputItems.length} items directly from OpenAI node`);

// Extract image URLs directly from the OpenAI node results
const imageUrls = [];
inputItems.forEach((item, index) => {
  console.log(`\n📋 Processing item ${index + 1}:`);
  console.log(`Type: ${typeof item.json}`);
  console.log(`Keys: ${Object.keys(item.json || {}).join(', ')}`);
  
  let imageUrl = null;
  
  // The LangChain node with "Respond with Image URL(s)" should return URLs directly
  if (typeof item.json === 'string' && item.json.startsWith('http')) {
    imageUrl = item.json;
    console.log(`✅ Found direct URL: ${imageUrl}`);
  } else if (item.json && item.json.url) {
    imageUrl = item.json.url;
    console.log(`✅ Found URL in url field: ${imageUrl}`);
  } else if (item.json && item.json.data && item.json.data.url) {
    imageUrl = item.json.data.url;
    console.log(`✅ Found URL in data.url: ${imageUrl}`);
  } else if (item.json && item.json.result) {
    imageUrl = item.json.result;
    console.log(`✅ Found URL in result: ${imageUrl}`);
  } else if (item.json && Array.isArray(item.json) && item.json.length > 0) {
    imageUrl = item.json[0];
    console.log(`✅ Found URL in array: ${imageUrl}`);
  }
  
  if (imageUrl) {
    console.log(`✅ Image ${index + 1} generated: ${imageUrl}`);
    imageUrls.push(imageUrl);
  } else {
    console.log(`❌ No URL found for item ${index + 1}`);
    console.log(`Full item:`, JSON.stringify(item.json, null, 2));
    imageUrls.push(null);
  }
});

console.log(`\n📊 Extracted ${imageUrls.filter(url => url).length} URLs out of ${imageUrls.length} items`);

// Return the URLs for further processing
return [{
  json: {
    imageUrls: imageUrls,
    successfulUrls: imageUrls.filter(url => url).length,
    totalItems: imageUrls.length,
    generatedAt: new Date().toISOString(),
    message: "URLs extracted successfully from OpenAI node.",
    urls: imageUrls.filter(url => url) // Only the successful URLs
  }
}];
