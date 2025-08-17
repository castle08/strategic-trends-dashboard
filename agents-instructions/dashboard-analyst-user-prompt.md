CONTEXT

You are analyzing the current trend landscape to generate executive-ready dashboard insights. You have access to:

1. Trend Database: Recent trends with categories, scores, summaries, and tags
2. Perplexity Tool: For validating insights and finding **one strong example per claim**

TREND DATA

Here are the current trends from our database:

{{ $json.trends }}

TASK

Analyze this trend data and generate dashboard insights across five sections:

1. STATE OF THE WORLD
- Thesis: What’s the single most important macro trend right now?
- Velocity: Show 8 weeks of momentum (simulate from trend scores)
- Movers: Which categories are accelerating fastest? (Top 3-4 with growth metrics)

2. STRATEGIC LENS
- Title: What’s the single most important *strategic perspective* leaders should adopt?
- Bullets: 3–5 concise implications that reframe the landscape

3. LIVE SIGNALS
- List 3–6 high-impact recent developments (news/events)
- Use Perplexity to validate each with one strong example

4. BRAND OPPORTUNITIES
- 2–4 emerging opportunities brands should act on now
- For each: title, why-now, supporting signals, and one recommended play

5. COMPETITIVE THREATS
- 2–4 recent competitive moves
- For each: brand, move, urgency, when seen, and specific response action

VALIDATION REQUIREMENTS

- Use Perplexity only to surface **the single strongest supporting example per claim**
- Ensure all insights are concise, actionable, and evidence-backed

OUTPUT FORMAT

Return a JSON object in this schema:

{
  "stateOfWorld": {
    "thesis": "One-sentence macro thesis",
    "velocity": [12, 20, 35, 45, 60, 72, 85, 92],
    "movers": [
      {"label": "Category Name", "strength": "+45%"},
      {"label": "Category Name", "strength": "+32%"}
    ]
  },
  "strategicLens": {
    "title": "Single most important perspective",
    "bullets": [
      "Implication 1",
      "Implication 2",
      "Implication 3"
    ]
  },
  "liveSignals": [
    "Recent validated signal 1",
    "Recent validated signal 2",
    "Recent validated signal 3"
  ],
  "opportunities": [
    {
      "title": "Opportunity name",
      "level": "High",
      "whyNow": "Reason it matters now",
      "signals": ["Signal 1", "Signal 2"],
      "play": "Specific action brands should take"
    }
  ],
  "threats": [
    {
      "brand": "Competitor name",
      "move": "Description of move",
      "urgency": "High",
      "seen": "6 days ago",
      "action": "Recommended response"
    }
  ]
}

EXECUTIVE FOCUS

- Every insight must be strategic, actionable, and concise
- Think like a management consultant briefing a CEO
- Maximum clarity, minimum noise