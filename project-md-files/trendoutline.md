# Trends Dashboard Project – Technical & Strategic Outline

## 🎯 Project Goal
An automated system that generates **2 fresh, high-quality marketing & culture trends each week**.  
Trends should be **consumer-centric, culturally grounded, and behaviour-focused**.  
The final output is a **strict JSON schema** that can be visualised on a dashboard and reused in weekly digests.

---

## 🏗️ System Architecture

### **1. Trigger**
- Weekly cron starts the workflow.

### **2. Examples Node**
- Provides static **reference examples of past trends**.  
- Used for tone, schema, and depth — not duplication.

### **3. Trend Agent (Core AI)**
- Generates the final 2 trends.  
- Equipped with the following tools:
  - **Trend Database** – check existing trends to avoid duplication, compare framings.  
  - **RSS Agent** – fetches context from curated feeds:
    - AdWeek  
    - Campaign (latest & news)  
    - Reddit (advertising, marketing)  
    - NielsenIQ  
    - Mintel  
    - Forrester blogs  
  - **Perplexity** – validate live examples/signals, restricted to last 3 months of 2025.  
  - **Think Tool** – reflection step to refine insights and ensure non-generic output.

### **4. Output Schema**
- Trend Agent must return JSON with:
  - `title` – concise, newsworthy headline  
  - `summary` – 3-part framing: Driver → Tension → Behaviour → Signal  
  - `category` – mapped to dashboard categories (AI, Consumer Behaviour, Sustainability, Media, etc.)  
  - `tags` – key topical labels  
  - `scores` – novelty, velocity, relevance, confidence, total  
  - `whyItMatters` – strategic significance for brands  
  - `brandAngles` – how a brand could act on this trend  
  - `exampleUseCases` – real or plausible case studies  
  - `creative` – copy, image prompt, alt text, podcast snippet  
  - `viz` – size, intensity, colour hint

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
   - Checks DB for duplicates.  
   - Pulls context from RSS Agent.  
   - Validates with Perplexity (time-filtered).  
   - Uses Think Tool to refine.  
   - Outputs 2 schema-compliant trends.  
4. **Downstream**: trends sent to loop for image gen, API storage, and digest report.

---

## 🚀 Next Steps
- Ensure **RSS Agent prompt** is tuned to deliver *summaries and useful signals* rather than full feeds.  
- Add stricter guidance in Trend Agent prompt around **depth, consumer insight, and examples**.  
- Test Perplexity queries for recency.  
- Complete end-to-end test: cron → Trend Agent → image gen → API → digest.