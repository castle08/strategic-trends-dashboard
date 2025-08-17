// Enhanced RSS Processing with Comprehensive Debugging
console.log("🚀 === ENHANCED RSS PROCESSING START ===");

const allInputItems = $input.all();
console.log(`📊 Input Analysis: Received ${allInputItems.length} total items from RSS merge`);

// Detailed input debugging
let totalRSSItems = 0;
const sourceStats = {};

allInputItems.forEach((item, index) => {
  const keys = Object.keys(item.json);
  const hasTitle = !!(item.json.title);
  const hasLink = !!(item.json.link || item.json.url);
  const hasDescription = !!(item.json.description || item.json.contentSnippet);
  
  // Track statistics
  totalRSSItems++;
  const source = item.json.link ? 
    (item.json.link.includes("hubspot") ? "HubSpot" :
     item.json.link.includes("searchengineland") ? "Search Engine Land" :
     item.json.link.includes("neilpatel") ? "Neil Patel" :
     item.json.link.includes("socialmediaexaminer") ? "Social Media Examiner" :
     item.json.link.includes("hootsuite") ? "Hootsuite" : "Unknown") : "No Source";
  
  sourceStats[source] = (sourceStats[source] || 0) + 1;
  
  console.log(`📰 Item ${index + 1} [${source}]:`);
  console.log(`  ✓ Title: ${hasTitle ? `"${(item.json.title || "").substring(0, 50)}..."` : "❌ MISSING"}`);
  console.log(`  ✓ Link: ${hasLink ? "✅ Present" : "❌ MISSING"}`);
  console.log(`  ✓ Description: ${hasDescription ? `✅ Present (${(item.json.description || item.json.contentSnippet || "").length} chars)` : "❌ MISSING"}`);
  console.log(`  ✓ Keys available: ${keys.length} (${keys.slice(0, 8).join(", ")}${keys.length > 8 ? "..." : ""})`);
});

console.log("📈 Source Statistics:");
Object.entries(sourceStats).forEach(([source, count]) => {
  console.log(`  📍 ${source}: ${count} items`);
});

// Handle empty input
if (allInputItems.length === 0) {
  console.log("❌ CRITICAL ERROR: No RSS items received from any feed!");
  console.log("🔧 Troubleshooting steps:");
  console.log("  1. Check RSS feed URLs are accessible");
  console.log("  2. Verify network connectivity in n8n environment");
  console.log("  3. Check if RSS feeds are blocking n8n user agent");
  console.log("  4. Verify RSS feed URLs return valid XML");
  
  return [{
    json: {
      title: "🚨 RSS FEED FAILURE - All Feeds Down",
      url: "https://debug.required/no-rss-data",
      source: "System Error",
      publishedAt: new Date().toISOString(),
      summary: "All RSS feeds failed to return data. This indicates a systematic issue with feed access, network connectivity, or feed availability. Check n8n logs and RSS feed URLs.",
      rawContent: {
        debug: true,
        debugType: "no_rss_input",
        inputCount: 0,
        timestamp: new Date().toISOString()
      }
    }
  }];
}

// Process and validate RSS items
const validItems = [];
const rejectedItems = [];
const seenTitles = new Set();

for (const item of allInputItems) {
  const title = (item.json.title || "").trim();
  const url = (item.json.link || item.json.url || "").trim();
  const description = item.json.description || item.json.contentSnippet || item.json.content || "";
  const pubDate = item.json.pubDate || item.json.published || "";
  
  // Comprehensive validation
  const validationErrors = [];
  
  if (!title || title.length < 10) {
    validationErrors.push(`Invalid title: "${title}" (length: ${title.length})`);
  }
  
  if (!url || !url.startsWith("http")) {
    validationErrors.push(`Invalid URL: "${url}"`);
  }
  
  if (!description || description.length < 20) {
    validationErrors.push(`Insufficient description: ${description.length} chars`);
  }
  
  // Check for duplicates
  const titleKey = title.toLowerCase().substring(0, 50);
  if (seenTitles.has(titleKey)) {
    validationErrors.push("Duplicate title detected");
  }
  
  if (validationErrors.length > 0) {
    rejectedItems.push({ title: title.substring(0, 30), errors: validationErrors });
    continue;
  }
  
  seenTitles.add(titleKey);
  
  // Determine source from URL
  let sourceName = "Marketing Source";
  if (url.includes("hubspot.com")) sourceName = "HubSpot";
  else if (url.includes("searchengineland.com")) sourceName = "Search Engine Land";
  else if (url.includes("neilpatel.com")) sourceName = "Neil Patel";
  else if (url.includes("socialmediaexaminer.com")) sourceName = "Social Media Examiner";
  else if (url.includes("hootsuite.com")) sourceName = "Hootsuite";
  
  // Clean and process description
  const cleanDescription = description.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  
  const processedItem = {
    json: {
      title: title,
      url: url,
      source: sourceName,
      publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      summary: cleanDescription.substring(0, 500),
      rawContent: {
        originalTitle: item.json.title,
        originalDescription: description.substring(0, 200),
        allKeys: Object.keys(item.json)
      }
    }
  };
  
  validItems.push(processedItem);
  console.log(`✅ Valid item added: "${title.substring(0, 40)}..." from ${sourceName}`);
}

// Sort by published date (newest first) and limit results
validItems.sort((a, b) => new Date(b.json.publishedAt) - new Date(a.json.publishedAt));
const finalItems = validItems.slice(0, 12);

// Final reporting
console.log("📊 === PROCESSING RESULTS ===");
console.log(`✅ Valid items processed: ${finalItems.length}`);
console.log(`❌ Rejected items: ${rejectedItems.length}`);
console.log(`🌐 Sources represented: ${[...new Set(finalItems.map(item => item.json.source))].join(", ")}`);

// Log rejection reasons
if (rejectedItems.length > 0) {
  console.log("⚠️ Rejection summary:");
  rejectedItems.forEach((rejected, index) => {
    console.log(`  ${index + 1}. "${rejected.title}...": ${rejected.errors.join(", ")}`);
  });
}

console.log("🚀 === ENHANCED RSS PROCESSING END ===");

// Handle case where no valid items after processing
if (finalItems.length === 0) {
  console.log("🚨 WARNING: No valid items after processing - returning debug info");
  return [{
    json: {
      title: "⚠️ RSS Processing Failed - No Valid Items",
      url: "https://debug.required/no-valid-items",
      source: "Processing Error",
      publishedAt: new Date().toISOString(),
      summary: `Received ${totalRSSItems} RSS items but none passed validation. Common issues: titles too short, missing URLs, insufficient descriptions, or duplicates.`,
      rawContent: {
        debug: true,
        debugType: "no_valid_items_after_processing",
        totalReceived: totalRSSItems,
        rejectedCount: rejectedItems.length,
        rejectionReasons: rejectedItems.slice(0, 5),
        sourceStats: sourceStats
      }
    }
  }];
}

return finalItems;