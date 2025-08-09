You are Lead Engineer + Tech Director. Build and deploy a production‑ready “Trend Intelligence Hub” that runs daily, outputs one JSON file used by both an office screens app and a 3D dashboard, and (weekly) generates a 5‑minute podcast. Use n8n (via n8n‑MCP and the n8n REST API) to create and enable the workflows directly. Make sensible decisions without asking questions; document assumptions in the README. After you build it, propose concrete improvements and alternatives.

GOALS
	1.	Daily: fetch trends → analyze/contextualize → produce one JSON at /public/trends/YYYY‑MM‑DD.json and update /public/trends/latest.json.
	2.	Visuals: React “Screens App” that rotates card‑style slides from latest.json; React + Three.js “Dashboard” that renders a premium 3D map of trends.
	3.	Weekly: generate a ~5‑minute MP3 podcast from the best items; save to /public/audio/weekly/YYYY‑WW.mp3 and maintain /public/audio/weekly/feed.json.
	4.	All flows created/enabled in my n8n; backups taken; logs recorded.

OPERATING RULES (n8n)
	•	Use two capabilities: (a) n8n‑MCP to build/edit flows; (b) n8n REST API (${N8N_BASE_URL}, ${N8N_API_KEY}) for export/import/enable/run/tag.
	•	Before editing: export all workflows to ops/backups/YYYY‑MM‑DD/ and log actions in ops/ops‑log.md.
	•	Build in DEV (or tag env:dev). Validate each new flow by running it once with sample payload; if OK, enable and tag version:x.y.z.
	•	For PROD, export DEV JSON and import as “(prod)” with env:prod tag; never move dev credentials.
	•	Never print secrets; provide .env.example.

SINGLE SCHEMA (one file powers everything)
Create a single daily JSON with this structure:
{
“generatedAt”: ISO8601,
“sourceSummary”: { “totalFetched”: number, “afterDedupe”: number, “sources”: string[] },
“trends”: [
{
“id”: uuid,
“title”: string,
“url”: string,
“source”: string,
“publishedAt”: ISO8601,
“summary”: string,
“category”: string,
“tags”: string[],
“scores”: { “novelty”: number, “velocity”: number, “relevance”: number, “confidence”: number, “total”: number },
“whyItMatters”: string,
“brandAngles”: string[],
“exampleUseCases”: string[],
“creative”: { “shortCardCopy”: string, “imagePrompt”: string, “altText”: string, “podcastSnippet”: string },
“viz”: { “size”: number, “intensity”: number, “colorHint”: string }
}
]
}
	•	Validate each item with zod; drop invalid items.
	•	Map viz.size from scores.total; viz.intensity from scores.velocity; colorHint is deterministic from category (HSL seed).

DATA SOURCES (config‑driven; must run with or without keys)
	•	config/sources.json includes: RSS (Marketing Brew, Creative Review, Adweek, Campaign Live) as defaults.
	•	Optional if keys exist: Google Trends, Reddit (selected subs), X/Twitter regional trends, TikTok via Apify, YouTube trending.
	•	If a key is missing, mock gracefully so the pipeline still produces a valid file.

WORKFLOWS TO CREATE IN N8N
A) “trend_daily” (07:30 Europe/London)
	1.	Cron → Fetch sources in parallel (RSS/API).
	2.	Normalize + dedupe (hash title+url), sort by publishedAt desc.
	3.	Single agent “TrendMaker” (LLM) that, in one pass per item, fills category/tags/scores/whyItMatters/brandAngles/exampleUseCases/creative/viz using weights.json and guardrails.
	4.	Validate with zod; keep top DAILY_TOP_N (default 8).
	5.	Assemble master JSON → write /public/trends/YYYY‑MM‑DD.json; update /public/trends/latest.json.
	6.	Notify Slack/Teams with links to screens app, dashboard, latest.json.

B) “trend_podcast_weekly” (Fri 08:00 UTC and manual webhook)
	1.	Load last 7 daily files; pick top WEEKLY_PODCAST_TRENDS (default 6) with category diversity.
	2.	Generate TTS for each creative.podcastSnippet (ElevenLabs; mock if key absent).
	3.	Stitch intro/outro with ffmpeg; normalise levels.
	4.	Write /public/audio/weekly/YYYY‑WW.mp3 and append metadata to /public/audio/weekly/feed.json.
	5.	Notify Slack/Teams.

REPO LAYOUT (pnpm workspaces)
apps/
screens-app/       (Vite + React, TV mode)
three-dashboard/   (Vite + React + Three.js + framer-motion)
packages/
agents/            (TrendMaker agent, prompts, zod schemas)
shared/            (types, dedupe, hashing, HSL palette, utils)
podcast/           (buildPodcast.ts: TTS + ffmpeg)
config/
sources.json
weights.json
public/
trends/            (daily files + latest.json)
audio/weekly/
ops/
backups/
ops-log.md
.env.example
README.md

AGENT (one agent, one pass)
	•	“TrendMaker”: TypeScript wrapper around Anthropic/OpenAI.
	•	Input: normalized items with title/url/source/publishedAt/summary.
	•	Output: complete TrendItem objects.
	•	Guardrails: length limits, brand safety words list, require plain‑English justifications internally (don’t output) for whyItMatters; reject low‑confidence items if below threshold.
	•	Validate every item; silently drop invalid ones.

SCREENS APP (reads /public/trends/latest.json)
	•	Full‑bleed dark UI; large type; rotates through trends[].
	•	Show title, shortCardCopy, source favicon (from URL), time‑since‑publish, QR/link.
	•	Auto‑rotate every CARD_ROTATION_SEC (default 12s); auto‑refresh JSON every 5 min.
	•	?demo=true renders bundled sample.

THREE.JS DASHBOARD (reads same latest.json)
	•	Premium aesthetic: deep navy→graphite gradient, subtle volumetric fog; emissive pulsing spheres sized by viz.size, pulsing by viz.intensity; deterministic category colors.
	•	Hover → floating info card (title + whyItMatters); click → side panel with brandAngles/exampleUseCases/link.
	•	OrbitControls; GPU instancing for 200+ nodes; fallback 2D canvas if WebGL is poor; 60fps target.

DEV EXPERIENCE
	•	Monorepo with pnpm; TypeScript strict; eslint; zod validation everywhere.
	•	Scripts:
	•	pnpm dev:screens
	•	pnpm dev:three
	•	pnpm run daily:simulate (create /public/trends/sample.json and set latest.json to it)
	•	pnpm run podcast:simulate
	•	GitHub Actions: lint, typecheck, build, preview deploy (Vercel/Netlify ok for apps).

CONFIG / ENV
.env.example includes:
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
ELEVENLABS_API_KEY=
FAL_API_KEY=
GOOGLE_TRENDS_API_KEY=
BASE_PUBLIC_URL=
	•	If keys are missing, ask for these

DEFAULTS / KNOBS
DAILY_TOP_N=8
WEEKLY_PODCAST_TRENDS=6
CARD_ROTATION_SEC=12
THREE_MAX_NODES=200
TIMEZONE=Europe/London

ACCEPTANCE CRITERIA (must pass)
	1.	trend_daily creates /public/trends/latest.json with ≥5 valid TrendItem objects including creative and viz hints.
	2.	Screens app renders those items and rotates without errors.
	3.	Three.js dashboard renders a smooth, premium‑looking scene from latest.json.
	4.	trend_podcast_weekly generates a single MP3 (<6 minutes) and updates feed.json.
	5.	All n8n changes are backed up to ops/backups and logged in ops‑log.md.
	6.	README documents setup, env, first‑run, troubleshooting, and provides a simple system diagram.

NOW DO THIS
	1.	Review the plan, propose a concise plan and repo layout making any adjustments as recommended, then proceed to scaffold the monorepo, create both n8n workflows live via MCP, and wire everything end‑to‑end.
	2.	Produce sample content and run a dry‑run so latest.json and the apps show real data.
	3.	At the end, output:
	•	The repo tree, key file paths, and how to run each part locally.
	•	A short manual test checklist.
	•	Specific improvement suggestions: (a) reliability/ops, (b) data quality, (c) creative quality, (d) visual polish, (e) security.
	4.	If you believe anything in this brief should change for robustness, cost, or UX, state the change and implement it (unless it’s a breaking org policy risk).