const inputItems = $input.all();

console.log(`🔍 DEBUG MERGE: Processing ${inputItems.length} inputs`);

inputItems.forEach((item, index) => {
  console.log(`\n📋 Input ${index + 1}:`);
  console.log(`Type: ${typeof item.json}`);
  console.log(`Keys: ${Object.keys(item.json || {}).join(', ')}`);
  
  if (item.json && item.json.trends) {
    console.log(`📊 Input ${index + 1} has ${item.json.trends.length} trends`);
    console.log(`First trend:`, item.json.trends[0]);
  }
  
  if (item.json && item.json.imageUrls) {
    console.log(`🖼️ Input ${index + 1} has ${item.json.imageUrls.length} image URLs`);
    console.log(`First URL:`, item.json.imageUrls[0]);
  }
  
  if (item.json && item.json.urls) {
    console.log(`🖼️ Input ${index + 1} has ${item.json.urls.length} URLs`);
    console.log(`First URL:`, item.json.urls[0]);
  }
  
  if (typeof item.json === 'string' && item.json.startsWith('http')) {
    console.log(`🖼️ Input ${index + 1} is a direct URL:`, item.json);
  }
});

let originalTrends = [];
let imageUrls = [];

inputItems.forEach((item, index) => {
  if (item.json && item.json.trends) {
    originalTrends = item.json.trends;
  }
  
  if (item.json && item.json.imageUrls) {
    imageUrls = item.json.imageUrls;
  } else if (item.json && item.json.urls) {
    imageUrls = item.json.urls;
  }
  
  if (typeof item.json === 'string' && item.json.startsWith('http')) {
    imageUrls.push(item.json);
  }
});

console.log(`\n📊 FINAL SUMMARY:`);
console.log(`- Original trends: ${originalTrends.length}`);
console.log(`- Image URLs: ${imageUrls.filter(url => url).length}`);
console.log(`- Image URLs array:`, imageUrls);

const processedTrends = originalTrends.map((trend, index) => {
  const imageUrl = imageUrls[index] || null;
  
  if (imageUrl) {
    console.log(`🎯 Assigned image to "${trend.title}": ${imageUrl}`);
  } else {
    console.log(`❌ No image for "${trend.title}" (index ${index})`);
  }
  
  return {
    ...trend,
    creative: {
      ...trend.creative,
      imageUrl: imageUrl
    }
  };
});

const successfulImages = processedTrends.filter(t => t.creative.imageUrl).length;
console.log(`✅ Successfully assigned ${successfulImages} images to trends`);

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
