# Client Trends Dashboard - Strategic Implementation Plan

## 🎯 **Core Product Principles**

1. **Decision-first**: Every chart answers a CMO question (Where's momentum? For whom? So what?)
2. **Proof over prose**: Trends anchored in recent signals with dates
3. **Comparability**: Consistent scoring for easy comparison across time/category/audience
4. **Drillable**: Exec view → one click to evidence (signals, examples, sources)
5. **Action bias**: Every view proposes opportunities and risks

---

## 📊 **Enhanced Data Model**

### **Core Tables (Extended)**

**trends (existing + new fields)**
```sql
- id, title, summary, category, tags[]
- scores: {novelty, velocity, relevance, confidence, total}
- NEW: industry_primary (enum), industry_secondary[]
- NEW: audience_impact[] (e.g., ["Gen Z","Parents","Affluent","Urban"])
- NEW: business_impact (enum: opportunity|risk|neutral)
- NEW: trend_stage (enum: emerging|accelerating|peak|declining)
- NEW: first_seen_at, last_seen_at
- why_it_matters, brand_angles[], use_cases[]
```

**signals (new table)**
```sql
- id, trend_id, source_name, source_type (brand_pilot|regulation|platform_change|culture)
- summary, url, signal_date, weight (0–1)
```

**trend_scores_time (new table)**
```sql
- trend_id, date, velocity, relevance, confidence, total
```

**category_industry_map (new table)**
```sql
- category, industry (many-to-many)
```

**trend_audience_map (new table)**
```sql
- trend_id, audience, evidence_note, weight
```

### **Derived Fields (Server/Job)**
- **momentum_index**: EMA of velocity over last 6–12 weeks
- **trend_stage**: Automated classification based on confidence, momentum, and time
- **impact_by_industry**: Aggregate relevance × confidence across trends mapped to each industry

---

## 🎯 **Client KPIs That Matter**

### **Executive Summary Metrics**
- **Top accelerating trends** (by momentum_index) this month
- **Industry impact heat map**: relevance×confidence rolled up to industry
- **Audience impact matrix**: which audiences are most affected per trend
- **Risk radar**: trends flagged business_impact = risk, ordered by confidence
- **Signal freshness**: % of trends with a <90-day signal
- **Coverage**: # of signals per trend (evidence depth)

### **Auto-Generated Narratives**
- *"Sustainability is shifting from virtue to value in CPG + Grocery, led by repair/refill defaults; strongest with Gen Z; 2 live signals this fortnight."*

---

## 🖥️ **Dashboard Sections & Widgets**

### **1. Executive Summary**
**Cards:**
- "Top 3 accelerators" (title, momentum ▲, last signal date)
- "Industries most impacted" (retail, CPG, finance… score bars)
- "Audiences moving fastest" (badges: Gen Z, Parents, Urban)
- **One-liner narrative** auto-generated from data

### **2. Trend Momentum**
**Widgets:**
- **Sparkline grid**: each trend's velocity over 12 weeks (small multiples)
- **Lifecycle ribbon**: stacked band showing emerging/accelerating/peak/declining counts by week
- **Compare mode**: pick 2–3 trends → side-by-side momentum, last 5 signals

### **3. Industry & Audience Analysis**
**Widgets:**
- **Heat map**: industries × categories with average (relevance×confidence)
- **Audience matrix**: trends × audiences with impact weights; filter by industry
- **Cross-category relationships**: "AI ↔ Retail ↔ Data & Privacy"

### **4. Strategic Insights (Action)**
**Widgets:**
- **Opportunity board**: draggable cards summarizing brand angles; tag by feasibility/ROI
- **Risk indicators**: list of risk-flagged trends with "leading counter-signals"
- **Competitor lens**: "who is already moving" (brand + activity)

### **5. Evidence Drawer (per trend)**
**Widgets:**
- **Signals timeline**: chips with source, date, type; click-through to link
- **Use cases**: shippable examples (brand type + mechanism + payoff)
- **Assurance**: show confidence rationale (signals count, recency, counter-signals)

---

## 🎮 **High-Value Interactions**

- **Drill-down everywhere**: click card → open trend with signals timeline
- **Pin to board**: save any trend to a client board for workshops
- **Audience overlay**: toggle Gen Z/Parents/etc. to reorder & recolor results
- **What-if slider**: move relevance threshold to auto-update radar
- **Export**: selected trends → PowerPoint/Google Slides with brand angles, use cases, signals

---

## 🧮 **Key Calculations**

### **Momentum Index**
```sql
EMA(velocity weekly), α=0.3
momentum_index = α * velocity_t + (1-α) * momentum_index_{t-1}
```

### **Industry Score**
```sql
Σ (trend relevance × confidence × mapping weight)
```

### **Audience Impact**
```sql
Σ (trend relevance × audience_weight)
```

### **Risk Rank**
```sql
risk_flag × confidence × momentum (descending)
```

### **Example SQL View**
```sql
CREATE VIEW v_industry_impact AS
SELECT
  cim.industry,
  date_trunc('week', tst.date) AS week,
  AVG(tst.relevance * tst.confidence) AS impact_score
FROM trend_scores_time tst
JOIN trends t ON t.id = tst.trend_id
JOIN category_industry_map cim ON cim.category = t.category
GROUP BY 1,2;
```

---

## 🚀 **Implementation Phases**

### **Phase 1: Data Foundation (Week 1-2)**
1. **Data model implementation**: Add new fields/tables; backfill stage and momentum
2. **Derivations job**: Nightly cron to recompute momentum, stage, impact rollups
3. **API views**: `/dashboard/summary`, `/trends/:id/evidence`, `/industry/heatmap`

### **Phase 2: Frontend v1 (Week 3-4)**
1. **Executive Summary cards**
2. **Momentum sparkline grid**
3. **Industry heat map**
4. **Trend drawer with signals timeline**

### **Phase 3: Workshop Tools (Week 5-6)**
1. **Client boards** + export to deck
2. **Audience overlays**
3. **Compare mode**

### **Phase 4: Advanced Features (Week 7-8)**
1. **Alerts & subscriptions**
2. **Live discovery** (`/discover "family grocery on a budget"`)
3. **Client skinning** (brand themes)

---

## 📋 **Quick Win Queries (v1 Power)**

```sql
-- Top accelerating (last 28 days)
SELECT title, momentum_index, last_signal_date 
FROM trends 
WHERE created_at >= NOW() - INTERVAL '28 days'
ORDER BY momentum_index DESC 
LIMIT 5;

-- Most impacted industries
SELECT industry, AVG(relevance * confidence) as impact_score
FROM v_industry_impact 
WHERE week >= NOW() - INTERVAL '30 days'
GROUP BY industry 
ORDER BY impact_score DESC 
LIMIT 5;

-- Audience matrix
SELECT title, audience_impact, relevance * confidence as impact
FROM trends 
WHERE audience_impact @> '{ "Gen Z" }'
ORDER BY impact DESC;

-- Risk list
SELECT title, confidence, momentum_index
FROM trends 
WHERE business_impact = 'risk'
ORDER BY confidence DESC, momentum_index DESC;
```

---

## 🎨 **Design System**

### **Tailwind Plus Components**
- **Application UI**: Data tables, charts, stats cards
- **Marketing**: Hero sections, feature cards
- **Dark mode**: System preference + manual toggle

### **WPP Open Integration**
- **iFrame responsive design**
- **PostMessage communication**
- **Client theming capabilities**

---

## 🔔 **Alerts & Subscriptions**

### **Alert Types**
- **Momentum alert**: Any trend crossing momentum > 80
- **Signal alert**: New regulation/platform change in client's category
- **Audience alert**: Audience weight change ≥ 15% for watched persona

### **Delivery**
- Email + Slack with 2-sentence summary + link to drawer

---

## 🧹 **Data Hygiene & Governance**

- **Signal freshness guard**: Flag trends with last_signal > 90 days
- **Confidence transparency**: Show confidence computation (count, recency, counter-signals)
- **Tenancy**: Client boards separated by org; trends dataset shared; annotations per client

---

## ❌ **De-scoped for v1**

- Chords & complex graphs → later
- Full competitor intelligence → later
- Persona engine (start with manual audience weights per trend)

---

## 🎯 **Success Metrics**

### **Client Value**
- **Workshop engagement**: Time spent drilling into trends
- **Action taken**: % of trends that lead to client initiatives
- **Return usage**: Client dashboard sessions per month

### **Data Quality**
- **Signal freshness**: % trends with <90-day signals
- **Coverage depth**: Average signals per trend
- **Confidence accuracy**: Correlation between confidence and trend validation

---

## 💡 **The "Wow" Factor**

The "wow" for clients isn't another pretty radar — it's live, defensible, audience-aware guidance:

*"Here are the 3 accelerating shifts affecting your category this quarter, why they're happening, who they hit hardest, and two moves you can ship next month — with proof."*

---

## 📝 **Next Steps**

1. **Review and approve** this strategic plan
2. **Prioritize Phase 1** data model changes
3. **Design static mockups** for key dashboard sections
4. **Build MVP** with placeholder data for UX validation
5. **Implement data pipeline** for real-time insights

---

## 🖥️ **Real-time Trends Wall - WPP Open Integration**

### **Concept Overview**
A live, ambient screen that continuously surfaces the latest, provable consumer trends and signals for pitches, labs, and workshops. Sits on top of your Trend Engine with minimal backend changes.

### **Experience Modes**

**1. Ambient Loop (No Input)**
- Auto-rotates: Top Accelerating, Industry Heat, Latest Signals, Audience Impact
- Perfect for lobby/pre-meeting buzz
- Passive engagement with trend momentum

**2. Facilitated Mode (Interactive)**
- On-screen command palette (`/commands`):
  - `/search "sustainability in grocery"` → pulls from DB instantly
  - `/discover "late-night delivery behaviors"` → runs Trend Agent live
  - `/audience "Gen Z parents"` → overlays audience weights
  - `/compare` → side-by-side trend analysis
- Tap any card → Evidence Drawer with signals timeline

**3. Workshop Mode (Capture)**
- Drag trends onto Prioritisation Canvas (Impact × Ease)
- Save as Client Board → export deck & follow-ups
- Real-time collaboration during sessions

### **Technical Implementation**

**API Layer (Lightweight)**
```javascript
GET /wall/summary → cards for ambient loop
GET /wall/trends?sort=momentum → real-time trend feed
GET /wall/trend/:id → full evidence drawer
GET /wall/industries/heatmap → industry impact
GET /wall/audiences/matrix → audience analysis
GET /wall/signals/recent → latest signals ticker
```

**UI Composition**
- **Header ticker**: "New signals last 14 days" (brand pilot | regulation | platform change)
- **Hero panel**: "Top 3 accelerators" with momentum sparklines
- **Heat map**: Industry × Category (relevance × confidence)
- **Sparkline grid**: Velocity last 12 weeks for top trends
- **Audience ribbons**: Which audiences each trend hits hardest
- **Evidence Drawer**: Signals timeline, brand angles, use cases

**Performance Strategy**
- **Instant search**: DB-only queries return immediately
- **Streaming discovery**: Show "generating" with ETA, stream results
- **Smart caching**: Last-good state for resilience
- **Offline mode**: Previous cycle's data if connection lost

### **WPP Open Integration**
- **iFrame wrapper**: No backend changes required
- **PostMessage communication**: Seamless integration with parent system
- **Responsive design**: Adapts to container dimensions
- **Client theming**: Brand colors and styling

### **Command System Integration**
Reuses your planned Conversational Command System:
- **Natural language**: "Show me sustainability trends in grocery"
- **Structured commands**: `/search`, `/discover`, `/audience`
- **Voice input**: Speech-to-text for hands-free operation
- **Export options**: PowerPoint, Google Slides, PDF

### **Implementation Timeline**
- **Phase 1**: Basic wall with ambient loop (Week 1-2)
- **Phase 2**: Interactive commands and evidence drawer (Week 3-4)
- **Phase 3**: Workshop mode and prioritization canvas (Week 5-6)
- **Phase 4**: WPP Open integration and client theming (Week 7-8)

### **Success Metrics**
- **Engagement time**: How long people interact with the wall
- **Discovery usage**: Frequency of `/discover` commands
- **Workshop adoption**: Number of saved client boards
- **Export frequency**: How often trends are shared/exported
