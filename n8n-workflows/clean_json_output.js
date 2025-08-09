// Clean JSON Output - Returns the actual JSON object
const data = $json;

console.log('💾 === CLEAN JSON OUTPUT ===');
console.log(`📊 Generated ${data.trends?.length || 0} trends`);
console.log(`🌐 Sources: ${data.sourceSummary?.sources?.join(', ')}`);

// Return the data object directly (not as a string)
// This way n8n will output clean JSON without escaped characters
return [{ json: data }];