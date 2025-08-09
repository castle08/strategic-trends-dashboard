// Enhanced Clean & Dedupe node with debug logging
const items = [];
const seen = new Set();
const allInputItems = $input.all();

console.log(`🔍 DEBUG: Received ${allInputItems.length} total input items from RSS merge`);

// Debug each input source
allInputItems.forEach((item, index) => {
  console.log(`📥 Input ${index + 1}:`, {
    hasTitle: !!(item.json.title),
    hasLink: !!(item.json.link || item.json.url),
    keys: Object.keys(item.json).join(', ')
  });
});

if (allInputItems.length === 0) {
  console.log('❌ No input items received from RSS merge - RSS feeds may have failed');
  // Return fallback data to prevent workflow from breaking
  return [{
    json: {
      title: 'RSS Feed Debug Required',
      url: 'https://example.com',
      source: 'Debug Source',
      publishedAt: new Date().toISOString(),
      summary: 'RSS feeds are not returning data. Check RSS feed nodes and network connectivity.',
      rawContent: { debug: true, inputCount: 0 }
    }
  }];
}

for (const item of allInputItems) {
  const title = item.json.title || '';
  const url = item.json.link || item.json.url || '';
  const source = item.json.creator || 'RSS Source';
  const published = item.json.pubDate || item.json.published || new Date().toISOString();
  const summary = (item.json.contentSnippet || item.json.description || item.json.content || '').replace(/<[^>]*>/g, '').trim();
  
  // More detailed filtering debug
  if (!title) {
    console.log('⚠️ Skipping item: no title');
    continue;
  }
  if (!url) {
    console.log('⚠️ Skipping item: no URL');
    continue;
  }
  if (title.length < 10) {
    console.log(`⚠️ Skipping item: title too short (${title.length} chars): "${title}"`);
    continue;
  }
  
  // Create hash for deduplication
  const hash = title + '|' + url;
  if (seen.has(hash)) {
    console.log(`🔄 Duplicate found: "${title.substring(0, 50)}..."`);
    continue;
  }
  seen.add(hash);
  
  // Extract source name from various fields
  let sourceName = 'Marketing Source';
  if (url.includes('hubspot')) sourceName = 'HubSpot';
  else if (url.includes('searchengineland')) sourceName = 'Search Engine Land';
  else if (url.includes('neilpatel')) sourceName = 'Neil Patel';
  else if (url.includes('socialmediaexaminer')) sourceName = 'Social Media Examiner';
  else if (url.includes('hootsuite')) sourceName = 'Hootsuite';
  
  console.log(`✅ Adding item: "${title.substring(0, 30)}..." from ${sourceName}`);
  
  items.push({
    json: {
      title: title.trim(),
      url: url.trim(),
      source: sourceName,
      publishedAt: new Date(published).toISOString(),
      summary: summary.substring(0, 500),
      rawContent: item.json
    }
  });
}

// Sort by published date (newest first) and limit to 12 items
items.sort((a, b) => new Date(b.json.publishedAt) - new Date(a.json.publishedAt));

const finalItems = items.slice(0, 12);

console.log(`🚀 Final result: ${finalItems.length} unique articles processed from ${allInputItems.length} raw RSS items`);
console.log(`📊 Sources breakdown: ${finalItems.map(item => item.json.source).join(', ')}`);

if (finalItems.length === 0) {
  console.log('⚠️ No valid articles after processing - falling back to debug item');
  return [{
    json: {
      title: 'No Valid RSS Articles Found',
      url: 'https://example.com',
      source: 'Debug Source',
      publishedAt: new Date().toISOString(),
      summary: `Processed ${allInputItems.length} raw RSS items but none met criteria (valid title >10 chars, valid URL). Check RSS feed content quality.`,
      rawContent: { 
        debug: true, 
        rawInputCount: allInputItems.length,
        processedCount: items.length
      }
    }
  }];
}

return finalItems;