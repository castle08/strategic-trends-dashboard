// Direct File Output - No Copy/Paste Needed
const data = $json;

console.log('💾 === DIRECT FILE OUTPUT START ===');
console.log(`📊 Processing dataset with ${data.trends?.length || 0} trends`);

// Create clean JSON content
const jsonContent = JSON.stringify(data, null, 2);

console.log(`✅ Dataset generated with ${data.trends?.length || 0} trends`);
console.log(`📊 Score range: ${data.sourceSummary?.scoreRange?.min?.toFixed(1)}-${data.sourceSummary?.scoreRange?.max?.toFixed(1)}`);
console.log(`🌐 Sources: ${data.sourceSummary?.sources?.join(', ')}`);

// Return structured data that n8n can use to write files directly
return [{
  json: {
    // Raw JSON content ready to write
    fileContent: jsonContent,
    
    // File details
    fileName: 'latest.json',
    filePath: '/Users/chelsea/Projects/trends/public/trends/latest.json',
    
    // Metadata
    metadata: {
      trendsCount: data.trends?.length || 0,
      sources: data.sourceSummary?.sources || [],
      scoreRange: data.sourceSummary?.scoreRange || {},
      generatedAt: data.generatedAt,
      sizeRange: {
        min: Math.min(...(data.trends || []).map(t => t.viz?.size || 6)),
        max: Math.max(...(data.trends || []).map(t => t.viz?.size || 6))
      }
    },
    
    // Status
    status: 'ready_to_write',
    message: 'JSON data prepared for file writing'
  }
}];