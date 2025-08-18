CONTEXT

You are analyzing the current trend landscape to generate executive-ready dashboard insights. You have access to:

1. Trend Database: Recent trends with categories, scores, summaries, and tags
2. Perplexity Tool: For validating insights and finding recent examples with sources and dates

TREND DATA

Here are the current trends from our database:

{{ $json.trends }}

TASK

Analyze this trend data and generate dashboard insights across six sections:

1. STATE_OF_WORLD
- thesis: Single-sentence macro thesis about current consumer behavior and market dynamics
- velocityPercent: Calculate week-over-week composite momentum as a percentage
- velocitySpark: Generate 8-week sparkline values (0-100 scale) showing trend momentum
- movers: Top 3-4 accelerating themes with deltaPercent values

2. AI_INSIGHT
- title: Single strategic headline about the most significant pattern across trends
- bullets: 3-5 concise implications that reframe the landscape for brands

3. LIVE_SIGNALS
- 3-8 recent, named signals with event, source, date, and whyItMatters
- Use Perplexity to find recent examples with specific brands/platforms/regulators
- Include dates for all events (within last 30 days)

4. BRAND_OPPORTUNITIES
- 2-4 emerging opportunities with title, level (High/Medium/Low), whyNow, signals array, and play
- Each opportunity should have specific evidence and actionable next steps

5. COMPETITIVE_THREATS
- 2-4 recent competitor moves with brand, move, urgency (High/Medium/Low), seen (e.g., "6 days ago"), and action
- Focus on moves that require immediate attention

6. SIGNAL_TICKER
- 3-6 short, scannable ticker items for the live signals strip
- Keep these concise and impactful

VALIDATION REQUIREMENTS

- Use Perplexity to find recent examples with named sources and dates
- Ensure all signals are from the last 30 days
- Provide specific brands, platforms, or regulators as sources
- Calculate velocityPercent from velocitySpark data

OUTPUT FORMAT

Return a JSON object in this schema:

{
  "STATE_OF_WORLD": {
    "thesis": "Trust-first AI is becoming a default consumer expectation.",
    "velocityPercent": 244,
    "velocitySpark": [12, 18, 26, 33, 48, 61, 77, 92],
    "movers": [
      {"label": "Privacy-by-design platforms", "deltaPercent": 62},
      {"label": "Zero-waste retail", "deltaPercent": 55},
      {"label": "Community-driven media", "deltaPercent": 48}
    ]
  },
  "AI_INSIGHT": {
    "title": "Ambient AI replaces app-switching",
    "bullets": [
      "People expect help without surveillance.",
      "Micro-interactions reduce friction and churn.",
      "Personalisation must be privacy-first."
    ]
  },
  "LIVE_SIGNALS": [
    {
      "event": "Digital Product Passport pilots expand to mid-market",
      "source": "EU Commission",
      "date": "2025-07-12",
      "whyItMatters": "Pushes provenance-by-default; enables repair/resale rails."
    },
    {
      "event": "Affiliate policy update for live commerce",
      "source": "TikTok Shopping",
      "date": "2025-08-04",
      "whyItMatters": "Shifts creator economics; accelerates conversion-led content."
    }
  ],
  "BRAND_OPPORTUNITIES": [
    {
      "title": "Sustainable packaging as a purchase shortcut",
      "level": "High",
      "whyNow": "'Low-waste' badges speed decisions at shelf and PDP.",
      "signals": [
        "Refill/reuse mentions +65% YoY (Jul 2025)",
        "Retailers piloting refill lanes in urban stores (Aug 2025)"
      ],
      "play": "Ship a 'Refill Fast Lane' and add waste-saved badges to receipts and product pages."
    }
  ],
  "COMPETITIVE_THREATS": [
    {
      "brand": "Coca-Cola",
      "move": "Voice-order bundles via Alexa with re-order prompts.",
      "urgency": "Medium",
      "seen": "11 days ago",
      "action": "Publish voice-order SKUs and promo scripts; test re-order flows in Q4."
    }
  ],
  "SIGNAL_TICKER": [
    "EU DPP pilots broaden to mid-market (Jul 2025)",
    "TikTok Shopping updates affiliate rules (Aug 2025)",
    "Apple Vision Pro v2 pre-orders beat forecasts (Sep 2025)"
  ]
}

EXECUTIVE FOCUS

- Every insight must be strategic, actionable, and concise
- Think like a management consultant briefing a CEO
- Maximum clarity, minimum noise
- All data must be properly structured and calculable