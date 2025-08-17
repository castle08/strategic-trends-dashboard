// Simple Clean & Dedupe with debugging
console.log('📰 === RSS PROCESSING START ===');

const allInputItems = $input.all();
console.log(`🔍 Total input items: ${allInputItems.length}`);

// Debug first few items
allInputItems.slice(0, 3).forEach((item, index) => {
  console.log(`📝 Item ${index + 1}:`, {
    title: item.json.title?.substring(0, 50),
    link: item.json.link?.substring(0, 50),
    hasTitle: !!item.json.title,
    hasLink: !!item.json.link,
    keys: Object.keys(item.json).slice(0, 10).join(', ')
  });
});

if (allInputItems.length === 0) {
  console.log('❌ No RSS items received!');
  return [{
    json: {
      title: 'No RSS Data',
      url: 'https://error.com',
      source: 'No Source',
      publishedAt: new Date().toISOString(),
      summary: 'No RSS items were received from the merge node.'
    }
  }];
}

// Process items with minimal validation
const items = [];
const seen = new Set();

for (const item of allInputItems) {
  const title = item.json.title || '';
  const url = item.json.link || item.json.url || '';
  
  if (!title || title.length < 5) {
    console.log(`⚠️ Skipping item with short title: "${title}"`);
    continue;
  }
  
  if (!url) {
    console.log(`⚠️ Skipping item with no URL: "${title}"`);
    continue;
  }
  
  // Simple deduplication
  const hash = title + '|' + url;
  if (seen.has(hash)) {
    console.log(`🔄 Duplicate: "${title.substring(0, 30)}"`);
    continue;
  }
  seen.add(hash);
  
  // Determine source
  let sourceName = 'RSS Source';
  if (url.includes('hubspot')) sourceName = 'HubSpot';
  else if (url.includes('searchengineland')) sourceName = 'Search Engine Land';
  else if (url.includes('neilpatel')) sourceName = 'Neil Patel';
  else if (url.includes('socialmediaexaminer')) sourceName = 'Social Media Examiner';
  else if (url.includes('hootsuite')) sourceName = 'Hootsuite';
  
  // Clean description
  const description = item.json.description || item.json.contentSnippet || '';
  const cleanSummary = description.replace(/<[^>]*>/g, '').trim().substring(0, 300);
  
  const processedItem = {
    json: {
      title: title.trim(),
      url: url.trim(),
      source: sourceName,
      publishedAt: new Date(item.json.pubDate || new Date()).toISOString(),
      summary: cleanSummary || 'No summary available'
    }
  };
  
  items.push(processedItem);
  console.log(`✅ Added: "${title.substring(0, 40)}..." from ${sourceName}`);
}

console.log(`🚀 Final result: ${items.length} items processed`);
console.log('📰 === RSS PROCESSING END ===');

return items.slice(0, 12);