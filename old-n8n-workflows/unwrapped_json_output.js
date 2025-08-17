// Unwrapped JSON Output - No Array Wrapper
const data = $json;

console.log('💾 === UNWRAPPED JSON OUTPUT ===');
console.log(`📊 Generated ${data.trends?.length || 0} trends`);

// Return the data properties directly as individual fields
// This prevents n8n from wrapping in an extra array
return [{
  generatedAt: data.generatedAt,
  sourceSummary: data.sourceSummary,
  trends: data.trends
}];