# Trends Dashboard Project – Technical & Strategic Outline

## 🎯 Project Goal
An automated system that generates **2 fresh, high-quality marketing & culture trends each week** (scaling to 10).  
Trends should be **consumer-centric, culturally grounded, and behaviour-focused**.  
The final output is a **strict JSON schema** that can be visualised on a dashboard and reused in weekly digests.

**Current Status**: V2 Dashboard implemented with sidebar layout, filter popup, and auto-cycling components. Ready for live data integration.

---

## 🏗️ System Architecture

### **1. Trigger**
- Weekly cron starts the workflow every Monday at 8 AM.

### **2. Examples Node**
- Provides static **reference examples of past trends**.  
- Used for tone, schema, and depth — not duplication.
- Injects high-quality exemplar trends for agent guidance.

### **3. Trend Agent (Core AI)**
- Generates exactly 2 trends using OpenAI GPT-4o (will scale to 10).
- **Memory System**: 
  - Simple Memory node with session key `trends-agent-memory` (context: 5)
  - RSS Scout Memory node with session key `rss-scout-memory` (context: 10)
- Equipped with the following tools:
  - **Simple Memory** – stores conversation history across runs to avoid duplication
  - **Check Existing Trends (DB)** – queries database to avoid duplication
  - **Ask RSS Scout** – queries the RSS Scout agent which fetches context from curated feeds
  - **Search Current Examples** – Perplexity validates live examples/signals, restricted to last 3 months of 2025
  - **Reflect on Patterns** – internal thinking tool to refine insights

### **4. RSS Scout Agent**
- **Purpose**: Specialized agent for surfacing concrete, recent signals from marketing/culture feeds
- **Memory System**: RSS Scout Memory with session key `rss-scout-memory` (context: 10)
- **Connected Feeds**:
  - AdWeek Articles
  - Campaign Latest & News
  - Reddit Marketing & Advertising
  - NielsenIQ Insights
  - Mintel Insights
  - Forrester Blogs
- **Enhanced Prompt**: Focuses on finding specific brand launches, platform changes, and consumer behavior shifts
- **Output Format**: Concise bullets with source, action, date, and consumer angle

### **5. Output Schema**
- Trend Agent must return JSON with:
  - `title` – concise, newsworthy headline  
  - `summary` – 4-part framing: Driver → Tension → Behaviour → Signal  
  - `category` – mapped to dashboard categories (AI, Consumer Behaviour, Sustainability, Media, etc.)  
  - `tags` – key topical labels  
  - `scores` – novelty, velocity, relevance, confidence, total  
  - `whyItMatters` – strategic significance for brands  
  - `brandAngles` – how a brand could act on this trend  
  - `exampleUseCases` – real or plausible case studies  
  - `creative` – copy, image prompt, alt text, podcast snippet  
  - `viz` – size, intensity, colour hint (TBD: may be removed from schema)

---

## 📊 Quality Expectations
- Must use **Driver → Tension → Behaviour → Signal** framework.  
- Depth must show **consumer experience, cultural resonance, and strategic brand implications**.  
- Avoid clichés and vague statements — each trend should feel distinct and actionable.  
- Trends should **connect to fresh cultural or behavioural signals**, not just broad commentary.  
- Scoring should vary meaningfully to aid dashboard visualisation.

---

## 🔄 Execution Flow
1. **Weekly cron** triggers pipeline.  
2. **Examples** injected for guidance.  
3. **Trend Agent**:
   - Checks memory for previous trends
   - Checks DB for duplicates.  
   - Pulls context from RSS Scout (7 feeds).  
   - Validates with Perplexity (time-filtered).  
   - Uses Reflect tool to refine.  
   - Outputs 2 schema-compliant trends (will scale to 10).  
4. **Processing Pipeline**:
   - Loop Over Trends splits brain output into individual items
   - Each trend processed through image generation
   - Color mapping applied based on category
   - Data sent to API for storage and frontend visualization

---

## 🗂️ Prompts & Examples Storage
All prompt logic and references are stored as separate files.  
Agents should **first read this outline**, then fetch the additional files below as needed.

- **System Prompt**: `Agents-Instructions/trend-agent-system-prompt-v2.md`  
- **User Prompt**: `Agents-Instructions/trend-agent-user-prompt-v2.md`  
- **RSS Scout Enhanced Prompt**: `Agents-Instructions/rss-scout-enhanced-prompt.md`
- **Reference Examples**: Injected via Examples node in workflow
- **Output Schema**: `Agents-Instructions/trend-agent-schema.json`

**Usage Rules:**
1. Study the **reference examples** for depth, specificity, and consumer texture.  
2. Follow the **schema** strictly for output structure.  
3. Use the **system** and **user** prompt files for live instructions.  
4. Do not hardcode examples or schema into output — always check the stored files.  

---

## 🎨 Frontend Integration
- **React App** (`trends-app/`) with 3D visualization using Three.js
- **Real-time data fetching** from API endpoint: `https://trends-dashboard-six.vercel.app/api/trends-individual`
- **Auto-refresh** every 5 minutes
- **Color-coded categories** with 10-color palette system
- **Multiple view modes**: demo, screens, test

## 📊 Analytics Dashboard
- **New route**: `/dash` for analytics and data insights
- **Design**: Tailwind Plus components for WPP Open integration
- **Theme**: Dark mode toggle with system preference detection
- **Purpose**: Data analysis, trend performance, and system health monitoring

### **Dashboard Sections**
1. **Executive Summary**: Key metrics (total trends, confidence scores, signal freshness)
2. **Latest Trends Grid**: Current trends with status indicators
3. **Trend Analytics**: Charts for velocity, category distribution, confidence trends
4. **Signal Health Monitor**: RSS feed status, Perplexity performance, system health

### **Key Metrics Tracked**
- **Trend Quality**: Average confidence scores, signal freshness ratios
- **System Performance**: Workflow success rates, agent memory utilization
- **Business Impact**: Category diversity, velocity acceleration, engagement scores

### **Technical Implementation**
- **Database Extensions**: Analytics tables for trend performance tracking
- **New Agent**: "Trend Analyst" for pattern analysis and insights generation
- **Components**: Tailwind Plus Application UI and Marketing packages
- **Responsive Design**: Optimized for iFrame integration with WPP Open

---

## 🔐 Access & Permissions
- Workflow runs in **n8n MCP**.  
- **Workflow ID**: `ELyp1FDKhHb0boG2`
- **Workflow Name**: `agentic-trends-restore`
- **Status**: Currently inactive (needs activation for production)
- Agents have **VIEW-only access** to the workflow for traceability and inspection.

---

## 📈 Recent Improvements
- **Enhanced RSS Scout prompt** for better signal detection
- **Memory system** implemented to avoid trend duplication
- **Specific query strategy** for concrete brand launches and platform changes
- **Better signal validation** with Perplexity integration
- **Structured output parsing** with JSON schema validation
- **Workspace cleanup** - organized old files into `project-md-files/` and `old-n8n-workflows/`
- **Processing pipeline** connected to brain output

---

## 🚀 Current Status
- ✅ **Workflow architecture** complete and functional
- ✅ **Memory system** configured and working
- ✅ **RSS integration** with 7 curated feeds
- ✅ **Frontend visualization** ready for data
- ✅ **API endpoints** configured
- ✅ **Workspace organized** and cleaned up
- ✅ **Processing pipeline** connected to brain
- ✅ **V2 Dashboard** implemented with sidebar layout and filter popup
- ✅ **UI Components** created (Panel, Chip, Badge, Meter, Sparkline, Modal)
- ✅ **Auto-cycling carousels** for threats and opportunities
- ⏳ **Brain workflow** - configured but not tested
- ⏳ **Processing pipeline** - configured but not tested
- ⏳ **Live data integration** - ready to implement
- ⏳ **Workflow activation** pending
- ⏳ **Production deployment** pending

---

## 📋 Next Steps

### **Immediate (This Week)**
1. **Integrate live data** - Connect V2 dashboard to `/api/trends-individual` endpoint
2. **Implement data transformations** - Convert raw trend data to dashboard components
3. **Test brain workflow** - Validate trend generation and quality
4. **Test processing pipeline** - Verify image generation and API flow
5. **Fix color mapping** - Implement category-to-color mapping system
6. **Update image prompts** - Ensure colors are properly applied

### **Critical TODOs**
1. **Color System Fix**:
   - **Option A**: Remove `colorHint` from brain schema, add color mapping in processing loop
   - **Option B**: Update brain to know predefined category colors
   - **Decision needed**: Which approach is preferred?

2. **Image Generation Fix**:
   - Current image prompts don't properly apply category colors
   - Need to update image generation to use mapped colors
   - Ensure visual consistency with frontend color palette

3. **Scale to 10 Trends**:
   - Update brain schema from 2 to 10 trends
   - Test diversity and quality at scale
   - Optimize processing pipeline for larger batches

4. **n8n Agent Database Access**:
   - Update Trend Agent to use Supabase nodes directly instead of API endpoint
   - Use "service_role secret" key for n8n workflows
   - Implement direct database queries for checking existing trends and storing new ones

### **Short Term (Next 2 Weeks)**
1. **Deploy to production** environment
2. **Set up monitoring** and error handling
3. **Configure automated testing** for trend quality
4. **Document deployment process**

### **Medium Term (Next Month)**
1. **Scale to 10 trends** (currently set to 2)
2. **Add image generation** integration
3. **Implement analytics dashboard** with trend performance metrics
4. **Deploy Trend Analyst agent** for pattern analysis and insights
5. **Set up weekly digest** automation

### **Long Term (Next Quarter)**
1. **Add more RSS sources** for broader coverage
2. **Implement trend clustering** and categorization
3. **Build trend prediction** models
4. **Create trend impact** measurement tools

### **Future Stretch Goals (Post-Production)**
**Conversational Command System & WPP Open Integration**

## 🎯 Goal
Enable **natural-language interaction** with the Trend Engine for real-time use in workshops, pitches, and client sessions. Integrate as an iFrame within WPP Open platform.

## 🛠️ Natural Language Interface
Instead of rigid inputs, users can type natural queries like:
- *"Show me trends about sustainability in retail"*
- *"Generate insights about Gen Z gaming behaviors"*
- *"What's happening in retail media?"*

The system will automatically:
- **Parse intent** (search existing vs. generate new)
- **Route to appropriate agent** (search or discovery)
- **Return structured trend outputs**

## 🖼️ WPP Open Integration
- **iFrame deployment** of trends dashboard
- **PostMessage communication** with parent WPP Open system
- **Responsive design** for constrained container dimensions
- **Real-time command processing** from WPP Open interface

## ⚠️ Implementation Notes
- **Significant lift** - requires new workflow architecture
- **Dependencies**: Current brain must be fully tested and stable
- **Timeline**: Post-production, after core system is proven
- **Priority**: Low - focus on current brain and processing pipeline first