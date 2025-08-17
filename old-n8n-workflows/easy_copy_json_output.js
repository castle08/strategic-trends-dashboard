// Easy Copy JSON Output
const data = $json;

console.log('💾 === JSON OUTPUT GENERATION START ===');
console.log(`📊 Processing dataset with ${data.trends?.length || 0} trends`);

// Create clean JSON content
const jsonContent = JSON.stringify(data, null, 2);

console.log('✅ === COPY THE JSON BELOW ===');
console.log('📋 Ready to paste into: /Users/chelsea/Projects/trends/public/trends/latest.json');
console.log('=' * 80);
console.log(jsonContent);
console.log('=' * 80);
console.log('✅ === END OF JSON TO COPY ===');

// Also output for easy access in n8n UI
return [{
  json: {
    instruction: "Copy the 'content' field below to your latest.json file",
    filePath: "/Users/chelsea/Projects/trends/public/trends/latest.json",
    content: jsonContent,
    summary: {
      trendsCount: data.trends?.length || 0,
      sources: data.sourceSummary?.sources || [],
      scoreRange: data.sourceSummary?.scoreRange || {},
      generatedAt: data.generatedAt
    }
  }
}];