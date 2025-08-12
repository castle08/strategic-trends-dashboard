const inputItems = $input.all();

console.log(`🔄 Processing merged data from ${inputItems.length} inputs`);

let originalTrends = [];
let imageUrls = [];

inputItems.forEach((item, index) => {
  console.log(`\n📋 Processing merged item ${index + 1}:`);
  console.log(`Keys: ${Object.keys(item.json || {}).join(', ')}`);
  
  if (item.json && item.json.trends) {
    console.log(`📊 Found trends data with ${item.json.trends.length} trends`);
    originalTrends = item.json.trends;
  }
  
  if (item.json && item.json.imageUrls) {
    console.log(`🖼️ Found image URLs: ${item.json.imageUrls.length} URLs`);
    imageUrls = item.json.imageUrls;
  } else if (item.json && item.json.urls) {
    console.log(`🖼️ Found URLs: ${item.json.urls.length} URLs`);
    imageUrls = item.json.urls;
  }
  
  if (typeof item.json === 'string' && item.json.startsWith('http')) {
    console.log(`🖼️ Found direct URL: ${item.json}`);
    imageUrls.push(item.json);
  }
});

console.log(`\n📊 Summary:`);
console.log(`- Original trends: ${originalTrends.length}`);
console.log(`- Image URLs: ${imageUrls.filter(url => url).length}`);

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
