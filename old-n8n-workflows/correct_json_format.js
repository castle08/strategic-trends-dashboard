// Correct JSON Format - Single Object, Not Array
const data = $json;

console.log('💾 === CORRECT JSON FORMAT ===');
console.log(`📊 Generated ${data.trends?.length || 0} trends`);

// IMPORTANT: Return just the data object, not wrapped in array
// The issue was that n8n was wrapping it in an additional array
return [{ json: data }];