// Process merged data from the dedicated Merge node
// This node takes the combined output and creates the final trends with images

const inputItems = $input.all();

console.log(`🔄 Processing merged data from ${inputItems.length} inputs`);

// The Merge node with "Combine" mode should give us the combined data
// We need to extract trends and image URLs from the merged items

let originalTrends = [];
let imageUrls = [];

// Process the merged items
inputItems.forEach((item, index) => {
  console.log(`\n📋 Processing merged item ${index + 1}:`);
  console.log(`Keys: ${Object.keys(item.json || {}).join(', ')}`);
  
  // Check if this item contains trends data
  if (item.json && item.json.trends) {
    console.log(`📊 Found trends data with ${item.json.trends.length} trends`);
    originalTrends = item.json.trends;
  }
  
  // Check if this item contains image URLs
  if (item.json && item.json.imageUrls) {
    console.log(`🖼️ Found image URLs: ${item.json.imageUrls.length} URLs`);
    imageUrls = item.json.imageUrls;
  } else if (item.json && item.json.urls) {
    console.log(`🖼️ Found URLs: ${item.json.urls.length} URLs`);
    imageUrls = item.json.urls;
  }
  
  // Check for individual URL items
  if (typeof item.json === 'string' && item.json.startsWith('http')) {
    console.log(`🖼️ Found direct URL: ${item.json}`);
    imageUrls.push(item.json);
  }
});

console.log(`\n📊 Summary:`);
console.log(`- Original trends: ${originalTrends.length}`);
console.log(`- Image URLs: ${imageUrls.filter(url => url).length}`);

// Combine trends with image URLs
const processedTrends = originalTrends.map((trend, index) => {
  const imageUrl = imageUrls[index] || null;
  
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

// Count successful image assignments
const successfulImages = processedTrends.filter(t => t.creative.imageUrl).length;
console.log(`✅ Successfully assigned ${successfulImages} images to trends`);

// Return the complete data structure expected by the dashboard
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
