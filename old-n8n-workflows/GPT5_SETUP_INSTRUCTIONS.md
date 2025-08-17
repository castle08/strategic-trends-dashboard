# GPT-5 Trend Analysis Workflow Setup

## 1. Update the OpenAI Node

1. **Delete the old OpenAI node** in your trend_daily workflow
2. **Add the new OpenAI node** (from @n8n/n8n-nodes-langchain package)
3. **Configure it as follows:**
   - **Resource**: Text
   - **Operation**: Message a Model (or similar)
   - **Model**: Select GPT-5 (if available) or gpt-4o-mini as fallback
   - **Connection**: Use your existing OpenAI credentials

## 2. Replace the Process Trend Item Node

**Replace the existing "Process Trend Item" node with this new setup:**

1. **Add a Code node** named "GPT-5 Batch Processor"
   - Copy the contents of `gpt5_trend_analyzer.js`
   - This prepares all RSS items for batch processing

2. **Connect it to the new OpenAI node:**
   - Input: `{{ $json.userPrompt }}`
   - System Prompt: `{{ $json.systemPrompt }}`

3. **Add another Code node** named "GPT-5 Response Handler" 
   - Copy the contents of `gpt5_response_processor.js`
   - This parses and validates the GPT-5 output

## 3. Workflow Structure

```
RSS Feeds → Clean & Dedupe → GPT-5 Batch Processor → OpenAI (GPT-5) → GPT-5 Response Handler → Write JSON
```

## 4. Expected Improvements

✅ **Multiple Trends**: Will process ALL RSS articles instead of just one  
✅ **GPT-5 Intelligence**: Better trend analysis and categorization  
✅ **Proper Sphere Sizes**: Each trend gets different size based on importance  
✅ **Rich Data**: Comprehensive trend objects with all required fields  
✅ **Batch Processing**: More efficient than processing items individually  

## 5. Testing

After setup, run the workflow and check:
- Multiple trends in latest.json (not just one)
- Different sphere sizes in the 3D dashboard
- Real article titles and sources (not "Marketing Trend")
- Varied categories and scores

## 6. GPT-5 Model Selection

In the OpenAI node:
- Look for GPT-5 in the model dropdown
- If not available yet, use `gpt-4o` or `gpt-4-turbo` as the best alternative
- The workflow is designed to work with any modern GPT model

## 7. Debugging

If issues occur:
- Check the n8n execution logs for the new Code nodes
- Verify the OpenAI node is receiving the prepared prompts
- Ensure the response handler is parsing the JSON correctly