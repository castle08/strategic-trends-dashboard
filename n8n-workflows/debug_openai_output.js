// Debug node to see exactly what the LangChain OpenAI node returns
// This will help us understand the data structure

const inputItems = $input.all();

console.log(`🔍 Debug: Processing ${inputItems.length} items from OpenAI node`);

// Log each item in detail
inputItems.forEach((item, index) => {
  console.log(`\n📋 Item ${index + 1}:`);
  console.log(`Type: ${typeof item.json}`);
  console.log(`Keys: ${Object.keys(item.json || {}).join(', ')}`);
  console.log(`Full JSON:`, JSON.stringify(item.json, null, 2));
  
  // Check if it's a string that might be a URL
  if (typeof item.json === 'string') {
    console.log(`String content: ${item.json.substring(0, 100)}...`);
    if (item.json.startsWith('http')) {
      console.log(`✅ Found URL: ${item.json}`);
    }
  }
  
  // Check nested structures
  if (item.json && typeof item.json === 'object') {
    if (item.json.data) {
      console.log(`Data object:`, JSON.stringify(item.json.data, null, 2));
    }
    if (item.json.result) {
      console.log(`Result:`, item.json.result);
    }
    if (item.json.url) {
      console.log(`URL:`, item.json.url);
    }
  }
});

// Try to extract any URLs we can find
const foundUrls = [];
inputItems.forEach((item, index) => {
  let url = null;
  
  // Check all possible locations
  if (typeof item.json === 'string' && item.json.startsWith('http')) {
    url = item.json;
  } else if (item.json && item.json.url) {
    url = item.json.url;
  } else if (item.json && item.json.data && item.json.data.url) {
    url = item.json.data.url;
  } else if (item.json && item.json.result) {
    url = item.json.result;
  } else if (item.json && item.json.imageUrl) {
    url = item.json.imageUrl;
  }
  
  if (url) {
    console.log(`✅ Found URL for item ${index + 1}: ${url}`);
    foundUrls.push(url);
  } else {
    console.log(`❌ No URL found for item ${index + 1}`);
    foundUrls.push(null);
  }
});

console.log(`\n📊 Summary: Found ${foundUrls.filter(url => url).length} URLs out of ${foundUrls.length} items`);

return [{
  json: {
    debug: {
      totalItems: inputItems.length,
      foundUrls: foundUrls.filter(url => url).length,
      urls: foundUrls,
      message: "Check console logs for detailed debug information"
    }
  }
}];
