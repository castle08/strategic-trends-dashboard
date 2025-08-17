# Agent Instructions

This folder contains the prompts and schemas for all n8n agents in the trends workflow.

## Trend Agent
- **System Prompt**: `trend-agent-system-prompt.md`
- **User Prompt**: `trend-agent-user-prompt.md` 
- **Schema**: `trend-agent-schema.json`
- **Purpose**: Analyzes RSS articles and extracts 5 strategic trends for advertising agencies

## Weekly Digest Agent (Future)
- **System Prompt**: `digest-agent-system-prompt.md` (to be created)
- **User Prompt**: `digest-agent-user-prompt.md` (to be created)
- **Purpose**: Creates weekly insights report from trends + RSS data

## Configuration Notes

### Trend Agent Setup in n8n:
1. Set `hasOutputParser: true`
2. Connect Structured Output Parser with `trend-agent-schema.json`
3. Disable custom retry prompts
4. Connect tools: Database, Memory, Think, Web Search
5. Use GPT-4o model

### Successful Output Format:
The Trend Agent should output exactly 5 trends with complete creative and viz properties, matching the working format from workflow `LG3cXZGowLL0SIEK`.

### Tools Required:
- Database tool for trend deduplication
- Think tool for pattern analysis
- Web search for trend validation
- Memory for session continuity
