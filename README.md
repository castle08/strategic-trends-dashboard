# Trend Intelligence Hub

A production-ready system that runs daily to fetch, analyze, and visualize marketing trends with AI-powered insights. Features include office screens display, premium 3D dashboard, and weekly podcast generation.

## 🏗️ System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Data Sources  │    │    n8n Workflows │    │   Applications  │
│                 │    │                  │    │                 │
│ • RSS Feeds     │───▶│ trend_daily      │───▶│ • Screens App   │
│ • Google Trends │    │ • Fetch & Process│    │ • 3D Dashboard  │
│ • Reddit/Twitter│    │ • AI Analysis    │    │ • Podcast Gen   │
│ • TikTok/YouTube│    │ • JSON Output    │    │                 │
└─────────────────┘    │                  │    └─────────────────┘
                       │ trend_podcast    │
                       │ • Weekly Gen     │
                       │ • TTS + ffmpeg   │
                       └──────────────────┘
```

## 📁 Project Structure

```
trends/
├── apps/
│   ├── screens-app/       # React TV display (port 3000)
│   └── three-dashboard/   # React + Three.js 3D viz (port 3001)
├── packages/
│   ├── shared/           # Types, utils, validation
│   ├── agents/           # TrendMaker AI agent
│   └── podcast/          # Audio generation system
├── config/
│   ├── sources.json      # Data source configuration  
│   └── weights.json      # Scoring algorithm weights
├── public/
│   ├── trends/           # Generated JSON files
│   │   ├── latest.json   # Current trends (used by apps)
│   │   └── YYYY-MM-DD.json # Daily archives
│   └── audio/weekly/     # Generated podcasts
├── ops/
│   ├── backups/          # n8n workflow backups
│   └── ops-log.md        # Operations log
└── n8n-workflows/        # Exported workflow JSON
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm 8+
- n8n instance (cloud or self-hosted)
- FFmpeg (for podcast generation)

### Installation

1. **Clone and install dependencies:**
   ```bash
   pnpm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Generate sample data:**
   ```bash
   pnpm run daily:simulate
   ```

4. **Start applications:**
   ```bash
   # Terminal 1: Office screens
   pnpm run dev:screens
   # Opens http://localhost:3000

   # Terminal 2: 3D Dashboard  
   pnpm run dev:three
   # Opens http://localhost:3001
   ```

## 🔧 Configuration

### Environment Variables (.env)

**Required (choose one AI provider):**
```
ANTHROPIC_API_KEY=sk-ant-...
# OR
OPENAI_API_KEY=sk-...
```

**Optional services:**
```
ELEVENLABS_API_KEY=...        # TTS for podcasts
GOOGLE_TRENDS_API_KEY=...     # Enhanced trend data
REDDIT_CLIENT_ID=...          # Reddit trends
TWITTER_BEARER_TOKEN=...      # Twitter trends
```

**n8n Integration:**
```
N8N_BASE_URL=https://your-instance.n8n.cloud
N8N_API_KEY=your-api-key
```

### Data Sources (config/sources.json)

The system fetches from RSS feeds by default:
- Marketing Brew
- Creative Review  
- Adweek
- Campaign Live

Optional API sources activate with keys:
- Google Trends
- Reddit (r/technology)
- Twitter regional trends
- TikTok via Apify

### Scoring Weights (config/weights.json)

AI analysis scores trends on:
- **Novelty** (0-100): How new/unique
- **Velocity** (0-100): Rate of spread/engagement  
- **Relevance** (0-100): Business impact potential
- **Confidence** (0-100): Quality of source/data

## 📱 Applications

### Screens App (TV Display)
- **URL:** http://localhost:3000
- **Purpose:** Office/lobby displays
- **Features:** 
  - Auto-rotating trend cards (12s default)
  - QR codes for mobile access
  - Auto-refresh every 5 minutes
  - Demo mode: `?demo=true`

### 3D Dashboard (Interactive)
- **URL:** http://localhost:3001  
- **Purpose:** Executive/analyst exploration
- **Features:**
  - WebGL sphere visualization
  - Size = impact score, pulse = velocity
  - Click spheres for detailed panels
  - Orbit controls, zoom, premium aesthetic

### Weekly Podcast
- **Generated:** Fridays 8AM UTC
- **Duration:** ~5 minutes
- **Content:** Top 6 diverse trends with TTS narration
- **Output:** `/public/audio/weekly/YYYY-WW.mp3`

## 🤖 n8n Workflows

### trend_daily (Daily 07:30 Europe/London)
1. **Cron Trigger** → RSS feeds + APIs in parallel
2. **Data Processing** → Normalize, dedupe, sort by date
3. **AI Analysis** → TrendMaker processes each item
4. **Output** → Write JSON files + update latest.json
5. **Notifications** → Slack/Teams with app links

### trend_podcast_weekly (Fri 08:00 UTC + manual)
1. **Load Data** → Last 7 daily files
2. **Selection** → Top 6 trends with category diversity  
3. **TTS Generation** → ElevenLabs or fallback
4. **Audio Processing** → ffmpeg combine with intro/outro
5. **Publish** → Save MP3 + update feed.json

## 🧪 Testing & Development

### Run Simulations
```bash
# Generate sample trends data
pnpm run daily:simulate

# Generate sample podcast
pnpm run podcast:simulate
```

### Demo Modes
- Screens: `http://localhost:3000?demo=true`
- 3D Dashboard: `http://localhost:3001?demo=true`

### Build for Production
```bash
pnpm run build
pnpm run typecheck
pnpm run lint
```

## 🔧 Manual Test Checklist

- [ ] **Data Generation:** `pnpm run daily:simulate` creates latest.json with 8 valid trends
- [ ] **Screens App:** Loads trends, rotates cards, shows QR codes after 8s
- [ ] **3D Dashboard:** Renders spheres, hover tooltips work, click opens side panel  
- [ ] **Podcast:** Generates MP3 file and updates feed.json
- [ ] **n8n Workflows:** Both workflows are created and enabled in your instance
- [ ] **Graceful Degradation:** Apps work without API keys (using fallback data)

## 🚨 Troubleshooting

### Common Issues

**"No trends available"**
- Run `pnpm run daily:simulate` first
- Check `public/trends/latest.json` exists

**Screens/3D app blank screen**
- Add `?demo=true` to URL for sample data
- Check browser console for errors

**Podcast generation fails**
- Requires ffmpeg: `brew install ffmpeg` (macOS)  
- ElevenLabs API key optional (uses silent fallback)

**n8n workflows not working**
- Verify N8N_API_URL and N8N_API_KEY in .env
- Check workflow status in n8n interface
- Review ops/ops-log.md for backup history

### Performance Notes

**3D Dashboard:**
- Supports up to 200 spheres (configurable)
- Gracefully falls back on low-end hardware
- Uses GPU instancing for smooth 60fps

**Memory Usage:**
- Daily trends limited to 8 items by default
- Weekly podcast uses top 6 diverse trends
- Archive files accumulate in public/trends/

## 📊 System Metrics

**Default Configuration:**
- `DAILY_TOP_N=8` trends per day
- `WEEKLY_PODCAST_TRENDS=6` items per episode  
- `CARD_ROTATION_SEC=12` seconds between slides
- `THREE_MAX_NODES=200` spheres maximum

**Data Retention:**
- Daily JSON files: Indefinite archive
- Podcast episodes: 52 weeks (1 year)  
- n8n workflow backups: Manual cleanup

## 🔐 Security Notes

- API keys stored as environment variables
- n8n credentials managed within n8n interface  
- No secrets committed to repository
- CORS configured for localhost development

## 📈 Improvement Suggestions

### Reliability & Operations
- [ ] Add health check endpoints
- [ ] Implement retry logic for failed API calls
- [ ] Set up monitoring/alerting for workflow failures
- [ ] Add automated backup rotation for old files

### Data Quality  
- [ ] Implement sentiment analysis scoring
- [ ] Add source credibility weighting
- [ ] Create manual trend curation interface
- [ ] Develop trend prediction algorithms

### Creative Quality
- [ ] Integrate image generation for trend cards
- [ ] Add custom TTS voice training
- [ ] Implement dynamic intro/outro scripts
- [ ] Create branded audio watermarks

### Visual Polish
- [ ] Add particle effects to 3D dashboard
- [ ] Implement smooth transitions between trends
- [ ] Create responsive mobile layouts
- [ ] Add accessibility features (screen readers)

### Security
- [ ] Implement API rate limiting
- [ ] Add request validation middleware  
- [ ] Set up secure credential rotation
- [ ] Enable HTTPS for production deployment

---

**Built with:** React, Three.js, n8n, TypeScript, Tailwind CSS, Anthropic Claude, OpenAI GPT-4, ElevenLabs

**License:** MIT