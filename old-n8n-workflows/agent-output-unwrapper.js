// n8n Agent Output Unwrapper
// Handles n8n's LangChain Agent wrapper format and extracts clean structured output

const agentOutput = $input.all()[0].json;

console.log('🔄 Processing n8n Agent output for Structured Output Parser');

let cleanStructuredOutput;

try {
  // Handle n8n Agent format: action/text wrapper
  if (agentOutput.action === 'parse' && agentOutput.text) {
    console.log('📥 Found n8n agent action/text format');
    
    const textContent = agentOutput.text;
    const parsed = JSON.parse(textContent);
    
    // Remove n8n agent's internal "output" wrapper if present
    if (parsed.output && parsed.output.__structured__output) {
      console.log('🎯 Removing n8n internal "output" wrapper');
      cleanStructuredOutput = parsed.output.__structured__output;
    } else if (parsed.__structured__output) {
      console.log('✅ Found direct __structured__output');
      cleanStructuredOutput = parsed.__structured__output;
    } else {
      console.log('⚠️ Unexpected format, using parsed content as-is');
      cleanStructuredOutput = parsed;
    }
  } 
  // Handle direct structured output (fallback)
  else if (agentOutput.__structured__output) {
    console.log('✅ Found direct structured output');
    cleanStructuredOutput = agentOutput.__structured__output;
  }
  // Handle pre-wrapped format
  else {
    console.log('🔄 Using agent output as-is');
    cleanStructuredOutput = agentOutput;
  }

  // Validate we have the expected structure
  if (!cleanStructuredOutput.trends || !cleanStructuredOutput.reflection || !cleanStructuredOutput.analysis) {
    console.error('❌ Missing required fields in structured output:', Object.keys(cleanStructuredOutput));
    throw new Error('Structured output missing required fields: trends, reflection, or analysis');
  }

  console.log(`✅ Successfully extracted structured output with ${cleanStructuredOutput.trends.length} trends`);

  // Return in the format the Structured Output Parser expects
  return [{
    json: {
      __structured__output: cleanStructuredOutput
    }
  }];

} catch (error) {
  console.error('❌ Failed to process agent output:', error);
  console.error('Raw agent output:', JSON.stringify(agentOutput, null, 2));
  throw new Error(`Failed to unwrap agent output: ${error.message}`);
}
