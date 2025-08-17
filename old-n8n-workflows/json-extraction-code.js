// Master Agent JSON Extraction and Route Splitting
// Handles n8n agent wrapper format and extracts clean structured data

console.log('🔄 Processing Master Agent output and splitting routes');

const agentOutput = $input.all()[0].json;
console.log('📥 Raw agent output structure:', Object.keys(agentOutput));
console.log('📄 Raw agent output:', JSON.stringify(agentOutput, null, 2));

let extractedData;

try {
  // Handle n8n Agent wrapper format
  if (agentOutput.action === 'parse' && agentOutput.text) {
    console.log('📥 Found n8n agent action/text format');
    
    const textContent = agentOutput.text;
    
    // Try parsing the text content
    let parsed;
    try {
      parsed = JSON.parse(textContent);
    } catch (parseError) {
      // If direct parsing fails, try extracting JSON from markdown or other wrappers
      const jsonMatch = textContent.match(/\{[\s\S]*"__structured__output"[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in agent text output');
      }
    }
    
    console.log('📋 Parsed content structure:', Object.keys(parsed));
    console.log('📋 Parsed content:', JSON.stringify(parsed, null, 2));
    
    // Handle various wrapper formats
    if (parsed.output && parsed.output.__structured__output) {
      console.log('🎯 Removing agent internal "output" wrapper');
      extractedData = parsed.output.__structured__output;
    } else if (parsed.__structured__output) {
      console.log('✅ Found direct __structured__output');
      extractedData = parsed.__structured__output;
    } else {
      console.log('⚠️ Unexpected format, treating entire parsed content as structured data');
      extractedData = parsed;
    }
    
    console.log('🔍 Extracted data structure:', Object.keys(extractedData));
    console.log('🔍 Has trends?', !!extractedData.trends);
    console.log('🔍 Has reflection?', !!extractedData.reflection);
    console.log('🔍 Has analysis?', !!extractedData.analysis);
  }
  // Handle direct output (fallback)
  else if (agentOutput.__structured__output) {
    console.log('✅ Found direct structured output');
    extractedData = agentOutput.__structured__output;
  }
  // Handle raw text output
  else if (typeof agentOutput === 'string') {
    console.log('📝 Processing raw text output');
    const parsed = JSON.parse(agentOutput);
    extractedData = parsed.__structured__output || parsed;
  }
  else {
    console.log('🔄 Using agent output as-is');
    extractedData = agentOutput;
  }

  // Validate we have the essential structure and fix any missing fields
  if (!extractedData.trends) {
    console.error('❌ Missing trends in extracted data.');
    console.error('Available keys:', Object.keys(extractedData));
    console.error('Full extracted data:', JSON.stringify(extractedData, null, 2));
    
    // Try to find trends in the data structure
    if (extractedData.output && extractedData.output.trends) {
      console.log('🔧 Found trends in output wrapper');
      extractedData.trends = extractedData.output.trends;
      extractedData.reflection = extractedData.output.reflection || {};
      extractedData.analysis = extractedData.output.analysis || {};
    } else if (typeof extractedData === 'string') {
      console.log('🔧 Extracted data is still a string, trying to parse again');
      try {
        const reparsed = JSON.parse(extractedData);
        if (reparsed.__structured__output) {
          extractedData = reparsed.__structured__output;
        } else {
          extractedData = reparsed;
        }
      } catch (reparseError) {
        console.error('Failed to reparse string data:', reparseError);
      }
    }
    
    // Final check
    if (!extractedData.trends) {
      // Create detailed error with debugging info
      const debugInfo = {
        agentOutputKeys: Object.keys(agentOutput),
        extractedDataKeys: Object.keys(extractedData),
        extractedDataType: typeof extractedData,
        hasAction: !!agentOutput.action,
        hasText: !!agentOutput.text,
        hasStructuredOutput: !!extractedData.__structured__output,
        sampleData: JSON.stringify(extractedData).substring(0, 500) + '...'
      };
      throw new Error(`Missing trends field. Debug: ${JSON.stringify(debugInfo)}`);
    }
  }

  // Ensure we have reflection object (required)
  if (!extractedData.reflection) {
    console.warn('⚠️ Missing reflection, creating from available data');
    extractedData.reflection = {};
  }

  // Create analysis object if missing, using available data
  if (!extractedData.analysis) {
    console.log('🔧 Creating analysis object from available reflection data');
    extractedData.analysis = {
      totalArticles: extractedData.totalArticles || extractedData.articleCount || 0,
      keyInsights: []
    };
    
    // Move analysis-type fields from reflection to analysis if present
    if (extractedData.reflection.weeklyInsights) {
      extractedData.analysis.weeklyInsights = extractedData.reflection.weeklyInsights;
    }
    if (extractedData.reflection.categoryEmergence) {
      extractedData.analysis.categoryAnalysis = extractedData.reflection.categoryEmergence;
    }
    if (extractedData.reflection.strategicRecommendations) {
      extractedData.analysis.strategicRecommendations = extractedData.reflection.strategicRecommendations;
    }
    if (extractedData.reflection.rssFeedAssessment) {
      extractedData.analysis.dataQuality = extractedData.reflection.rssFeedAssessment;
    }
  }

  console.log(`✅ Successfully extracted structured data with ${extractedData.trends.length} trends`);

  // Generate session ID for tracking
  const sessionId = `trend-analysis-${new Date().toISOString().split('T')[0]}`;
  const timestamp = new Date().toISOString();

  // Return two outputs for separate routing
  return [
    // Output 1: For Summary Agent (reflection route)
    {
      json: {
        reflection: extractedData.reflection,
        analysis: extractedData.analysis,
        route: 'reflection',
        sessionId: sessionId,
        timestamp: timestamp
      }
    },
    // Output 2: For Trend Processing (trends route)  
    {
      json: {
        trends: extractedData.trends,
        reflection: extractedData.reflection, // Keep for context
        analysis: extractedData.analysis,     // Keep for context
        route: 'trends',
        sessionId: sessionId,
        timestamp: timestamp
      }
    }
  ];

} catch (error) {
  console.error('❌ Failed to extract JSON from agent output:', error);
  console.error('Raw agent output:', JSON.stringify(agentOutput, null, 2));
  throw new Error(`Failed to extract structured data: ${error.message}`);
}
