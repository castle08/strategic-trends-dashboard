import React, { useMemo, useState, useEffect } from "react";

/** ---------------------------
 *  MOCK DATA (edit freely)
 *  --------------------------- */
const dashboardMock = {
  filters: {
    categories: ["Creativity","Sustainability","Technology","AI","Consumer Behaviour"],
    industries: ["Retail","CPG","Tech","Finance","Entertainment"],
    audiences: ["Gen Z Urban","Millennial Families","Value Seekers 45+"]
  },
  stateOfWorld: {
    thesis: "Trust‑first AI becomes a default consumer expectation.",
    velocity: [12,14,18,22,28,34,41,43], // weekly weighted signals
    movers: [
      {label:"Programmable Stores", delta:"+", strength:2},
      {label:"Refill Defaults", delta:"+", strength:1},
      {label:"Tokenised Loyalty", delta:"+", strength:2}
    ]
  },
  aiInsight: {
    title: "Ambient AI > app‑switching",
    bullets: [
      "People expect help without surveillance.",
      "Micro‑interactions reduce friction and attrition.",
      "Personalisation must be privacy‑first."
    ]
  },
  threats: [
    {brand:"Nike", move:"AI product recommendations in flagship app", urgency:"High", seen:"6 days ago",
     action:"Fast‑track PDP personalisation; A/B privacy‑first profiles in 2 key categories."},
    {brand:"Coca‑Cola", move:"Voice‑order commerce via Alexa bundles", urgency:"Medium", seen:"11 days ago",
     action:"Ship voice‑order SKUs and promo scripts; test re‑order prompts in Q4."},
    {brand:"Amazon", move:"One‑click checkout in 12 markets", urgency:"High", seen:"2 weeks ago",
     action:"Reduce checkout steps to 2; enable stored cart + pay‑link flows for social traffic."}
  ],
  opportunities: [
    {
      title:"Sustainable Packaging Becomes a Purchase Shortcut",
      level:"High",
      whyNow:"'Low‑waste' labels accelerate decisions at shelf and PDP.",
      signals:["Refill mentions +65% YoY (Jul 2025)","Refill lanes tied to loyalty (Aug 2025)"],
      play:"Add 'Refill Fast Lane' + waste‑saved badges to PDP and receipts."
    },
    {
      title:"Micro‑Influencer Networks Win in Niche Conversion",
      level:"Medium",
      whyNow:"Peer‑sized creators drive trust; live shopping boosts basket size.",
      signals:["Mid‑tier ER ~3× celebrity (Jul 2025)","Live shopping AOV +18% (Aug 2025)"],
      play:"Stand up a 50‑creator pool; floor CPM + bonus for 7‑day basket adds."
    }
  ],
  spotlights: [
    {
      id:"trend-1",
      title:"Stores Become Programmable Media",
      category:"Creativity",
      summary: {
        driver:"Retail media + game‑native shoppers normalise interactive spaces.",
        tension:"People want reasons to visit; gimmicky tech feels noisy.",
        behaviour:"Shoppers treat stores like episodic content with quests/unlocks."
      },
      scores:{novelty:72, velocity:63, relevance:84, confidence:68},
      tags:["retail media","AR quests","episodic merchandising"]
    },
    {
      id:"trend-2",
      title:"Product Passports Unlock Use‑Phase Value",
      category:"Sustainability",
      summary: {
        driver:"Cost‑of‑living + regulation push durability and transparency.",
        tension:"People want 'better' but can't afford premiums.",
        behaviour:"Repair, refill, and official resale become weekly habits."
      },
      scores:{novelty:58, velocity:69, relevance:90, confidence:78},
      tags:["digital ID","brand resale","repair economy"]
    }
  ],
  takeaways: [
    "Prioritise privacy‑first personalisation this quarter.",
    "Pilot refill lanes tied to loyalty in 3 stores.",
    "Launch 50‑creator mid‑tier pool with conversion bonuses.",
    "Plan Q4 'content season' for hero stores (quests + watch‑to‑shop)."
  ],
  liveSignals: [
    "Westfield AR quests expand (Jul 2025)",
    "EU DPP pilots broaden to mid‑market (Jul 2025)",
    "TikTok Shopping affiliate policy update (Aug 2025)"
  ]
};

/** ---------------------------
 *  SMALL UI PRIMITIVES
 *  --------------------------- */
const Panel: React.FC<{ className?: string; accent?: "blue"|"red"|"green"|"purple"|"amber"}> = ({children, className="", accent}) => {
  const accentMap = {
    blue: "from-[#5b90d4] via-[#4eccc9] to-[#bde4ff]",
    red: "from-[#dc2626] via-[#ef4444] to-[#f87171]",
    green: "from-[#059669] via-[#10b981] to-[#6ee7b7]",
    purple: "from-[#803bff] via-[#ab81fa] to-[#8ec2ef]",
    amber: "from-[#f59e0b] via-[#fbbf24] to-[#fde047]"
  } as const;
  return (
    <section className={`rounded-2xl border border-slate-200 shadow-sm bg-white text-slate-900 ${className}`}>
      {accent && <div className={`h-1 rounded-t-2xl bg-gradient-to-r ${accentMap[accent]}`} />}
      <div className="p-5">{children}</div>
    </section>
  );
};

const Chip: React.FC<{active?: boolean; onClick?: ()=>void; children: React.ReactNode}> = ({active, onClick, children}) => (
  <button
    onClick={onClick}
    className={`px-3 py-1 rounded-full text-sm border ${active ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"}`}>
    {children}
  </button>
);

const Badge: React.FC<{tone:"High"|"Medium"|"Low"}> = ({tone}) => {
  const toneMap = {
    High: "bg-red-100 text-red-700",
    Medium: "bg-amber-100 text-amber-700",
    Low: "bg-emerald-100 text-emerald-700"
  };
  return <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${toneMap[tone]}`}>{tone}</span>;
};

const Meter: React.FC<{value:number}> = ({value}) => (
  <div className="w-full h-2 rounded-full bg-slate-100">
    <div className="h-2 rounded-full bg-slate-900" style={{width: `${Math.max(0,Math.min(100,value))}%`}} />
  </div>
);

const Sparkline: React.FC<{data:number[]}> = ({data}) => {
  const max = Math.max(...data, 1);
  const w = 320, h = 56, pad = 8;
  const step = (w - pad*2) / (data.length - 1 || 1);
  const points = data.map((v,i)=>`${pad + i*step},${h - pad - (v/max)*(h - pad*2)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-16">
      <polyline fill="none" stroke="#0f172a" strokeWidth="2" points={points} />
    </svg>
  );
};

/** ---------------------------
 *  MODAL
 *  --------------------------- */
const Modal: React.FC<{open:boolean; onClose:()=>void; children:React.ReactNode; title?:string; accent?: "purple"|"green"}> = ({open,onClose,children,title,accent="purple"}) => {
  if(!open) return null;
  const ring = accent==="purple" ? "ring-[#ab81fa]" : "ring-[#10b981]";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className={`w-[900px] max-w-[95vw] rounded-2xl bg-white shadow-xl ring-2 ${ring}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

/** ---------------------------
 *  MAIN DASHBOARD
 *  --------------------------- */
export default function TrendsWallV2() {
  const [activeCats, setActiveCats] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [openTrend, setOpenTrend] = useState<(typeof dashboardMock.spotlights)[number] | null>(null);
  const [currentThreatIndex, setCurrentThreatIndex] = useState(0);
  const [currentOpportunityIndex, setCurrentOpportunityIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const filteredSpotlights = useMemo(()=>{
    let items = dashboardMock.spotlights;
    if(activeCats.length) items = items.filter(t => activeCats.includes(t.category));
    if(query.trim()) {
      const q = query.toLowerCase();
      items = items.filter(t => (t.title + " " + t.tags.join(" ") + " " + t.category).toLowerCase().includes(q));
    }
    return items;
  },[activeCats,query]);

  // Auto-cycle threats every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentThreatIndex((prev) => (prev + 1) % dashboardMock.threats.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Auto-cycle opportunities every 5 seconds (offset from threats)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentOpportunityIndex((prev) => (prev + 1) % dashboardMock.opportunities.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[1440px] px-4 py-6 grid grid-cols-12 gap-4">
        {/* Left rail */}
        <aside className="col-span-3 space-y-4">
          {/* Brand spot + search */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#803bff] to-[#8ec2ef]" />
            <div>
              <div className="text-sm font-semibold">Realtime Agentic Trends Wall</div>
              <div className="text-xs text-slate-500">Living intelligence panel</div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-3 py-2 text-xs font-medium text-slate-600 border-b bg-slate-50">Ask the wall</div>
            <div className="p-3">
              <input
                value={query}
                onChange={e=>setQuery(e.target.value)}
                placeholder="e.g., Gen Z retail, refill, on-device AI"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-900"
              />
              <div className="mt-2 flex gap-2 text-xs text-slate-500">
                <span className="px-2 py-0.5 rounded bg-slate-100">/search</span>
                <span className="px-2 py-0.5 rounded bg-slate-100">/discover</span>
                <span className="px-2 py-0.5 rounded bg-slate-100">/compare</span>
              </div>
            </div>
          </div>

          {/* Filter button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="text-sm font-medium text-slate-700">Filters</span>
            {activeCats.length > 0 && (
              <span className="ml-auto px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                {activeCats.length}
              </span>
            )}
          </button>

          {/* Live Signals */}
          <div className="overflow-hidden relative h-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <div className="absolute whitespace-nowrap animate-[marquee_20s_linear_infinite] text-green-700 text-sm py-2">
              {dashboardMock.liveSignals.map((s,i)=>(
                <span key={i} className="mr-8">• {s}</span>
              ))}
            </div>
          </div>

          {/* Trend Radar */}
          <Panel accent="blue">
            <h3 className="font-semibold text-base mb-2">Trend Radar</h3>
            <BubbleRadar trends={filteredSpotlights} />
          </Panel>
        </aside>

        {/* Filter Popup */}
        {showFilters && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Filters</h3>
                <button onClick={() => setShowFilters(false)} className="text-slate-500 hover:text-slate-900">✕</button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-semibold text-slate-500 mb-2">Categories</div>
                  <div className="flex flex-wrap gap-2">
                    {dashboardMock.filters.categories.map(cat=>{
                      const active = activeCats.includes(cat);
                      return (
                        <Chip
                          key={cat}
                          active={active}
                          onClick={()=>{
                            setActiveCats(prev => prev.includes(cat) ? prev.filter(c=>c!==cat) : [...prev, cat]);
                          }}
                        >
                          {cat}
                        </Chip>
                      );
                    })}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs font-semibold text-slate-500 mb-2">Industries</div>
                  <div className="flex flex-wrap gap-2">
                    {dashboardMock.filters.industries.map((i)=>(
                      <span key={i} className="px-3 py-1 rounded-full text-sm border bg-white text-slate-500 border-slate-200">{i}</span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs font-semibold text-slate-500 mb-2">Audiences</div>
                  <div className="flex flex-wrap gap-2">
                    {dashboardMock.filters.audiences.map((a)=>(
                      <span key={a} className="px-3 py-1 rounded-full text-sm border bg-white text-slate-500 border-slate-200">{a}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main grid */}
        <main className="col-span-9 grid grid-cols-12 gap-4">
          {/* State of World */}
          <Panel accent="blue" className="col-span-8">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-1">State of the World</h3>
                <p className="text-slate-600">{dashboardMock.stateOfWorld.thesis}</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500 mb-1">Trend Velocity (8 weeks)</div>
                <div className="w-80"><Sparkline data={dashboardMock.stateOfWorld.velocity} /></div>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xs text-slate-500 mb-2">Top Movers</div>
              <div className="flex flex-wrap gap-2">
                {dashboardMock.stateOfWorld.movers.map(m=>(
                  <span key={m.label} className="px-2.5 py-1 rounded-full text-sm bg-slate-100 text-slate-700">
                    {m.label} <span className="text-emerald-600">▲{m.strength}</span>
                  </span>
                ))}
              </div>
            </div>
          </Panel>

          {/* AI Insight */}
          <Panel accent="purple" className="col-span-4">
            <h3 className="font-semibold text-lg mb-2">AI Insight</h3>
            <div className="font-medium text-slate-900">{dashboardMock.aiInsight.title}</div>
            <ul className="mt-3 space-y-2 text-slate-600 text-sm list-disc pl-5">
              {dashboardMock.aiInsight.bullets.map(b=><li key={b}>{b}</li>)}
            </ul>
          </Panel>

          {/* Threats */}
          <Panel accent="red" className="col-span-6">
            <h3 className="font-semibold text-lg mb-2">Competitive Threats</h3>
            <div className="rounded-lg border border-slate-200 p-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium">{dashboardMock.threats[currentThreatIndex].brand} → <span className="text-slate-700">{dashboardMock.threats[currentThreatIndex].move}</span></div>
                  <div className="text-xs text-slate-500 mt-1">Seen: {dashboardMock.threats[currentThreatIndex].seen}</div>
                </div>
                <Badge tone={dashboardMock.threats[currentThreatIndex].urgency as any} />
              </div>
              <div className="text-sm text-slate-700 mt-2"><span className="font-semibold">Action:</span> {dashboardMock.threats[currentThreatIndex].action}</div>
            </div>
            {/* Navigation dots */}
            <div className="flex justify-center mt-3 space-x-1">
              {dashboardMock.threats.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentThreatIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    idx === currentThreatIndex 
                      ? 'bg-red-500 w-4' 
                      : 'bg-slate-300'
                  }`}
                />
              ))}
            </div>
          </Panel>

          {/* Opportunities */}
          <Panel accent="green" className="col-span-6">
            <h3 className="font-semibold text-lg mb-2">Brand Opportunities</h3>
            <div className="rounded-lg border border-slate-200 p-3">
              <div className="flex items-start justify-between">
                <div className="font-medium">{dashboardMock.opportunities[currentOpportunityIndex].title}</div>
                <Badge tone={dashboardMock.opportunities[currentOpportunityIndex].level as any} />
              </div>
              <div className="text-sm text-slate-700 mt-1"><span className="font-semibold">Why now:</span> {dashboardMock.opportunities[currentOpportunityIndex].whyNow}</div>
              <div className="text-sm text-slate-700 mt-1"><span className="font-semibold">Signals:</span> {dashboardMock.opportunities[currentOpportunityIndex].signals.join(" • ")}</div>
              <div className="text-sm text-slate-700 mt-1"><span className="font-semibold">Play:</span> {dashboardMock.opportunities[currentOpportunityIndex].play}</div>
            </div>
            {/* Navigation dots */}
            <div className="flex justify-center mt-3 space-x-1">
              {dashboardMock.opportunities.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentOpportunityIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    idx === currentOpportunityIndex 
                      ? 'bg-green-500 w-4' 
                      : 'bg-slate-300'
                  }`}
                />
              ))}
            </div>
          </Panel>

          {/* Trend Spotlights */}
          <Panel accent="purple" className="col-span-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Trend Spotlights</h3>
              <div className="text-xs text-slate-500">{filteredSpotlights.length} showing</div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {filteredSpotlights.map(t=>(
                <button
                  key={t.id}
                  onClick={()=>setOpenTrend(t)}
                  className="text-left rounded-xl border border-slate-200 p-3 hover:border-slate-300 hover:shadow-sm transition"
                >
                  <div className="text-xs text-slate-500 mb-1">{t.category}</div>
                  <div className="font-medium">{t.title}</div>
                  <div className="mt-2 text-sm text-slate-700">
                    <div><span className="font-semibold">Driver:</span> {t.summary.driver}</div>
                    <div><span className="font-semibold">Tension:</span> {t.summary.tension}</div>
                    <div><span className="font-semibold">Behaviour:</span> {t.summary.behaviour}</div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <ScoreRow label="Novelty" value={t.scores.novelty} />
                    <ScoreRow label="Velocity" value={t.scores.velocity} />
                    <ScoreRow label="Relevance" value={t.scores.relevance} />
                    <ScoreRow label="Confidence" value={t.scores.confidence} />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {t.tags.map(tag=>(
                      <span key={tag} className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">{tag}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </Panel>

          {/* Key Takeaways */}
          <Panel accent="amber" className="col-span-6">
            <h3 className="font-semibold text-lg mb-2">Key Takeaways</h3>
            <ul className="list-disc pl-5 space-y-2 text-slate-700">
              {dashboardMock.takeaways.map(t=><li key={t}>{t}</li>)}
            </ul>
          </Panel>

        </main>
      </div>
      
      {/* marquee keyframes */}
      <style>{`@keyframes marquee {0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>

      {/* Trend modal */}
      <Modal
        open={!!openTrend}
        onClose={()=>setOpenTrend(null)}
        title={openTrend?.title}
        accent={openTrend?.category==="Sustainability"?"green":"purple"}
      >
        {openTrend && (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-7 space-y-4">
              <section>
                <h4 className="font-semibold mb-2">Summary</h4>
                <div className="text-slate-700 space-y-1">
                  <div><span className="font-semibold">Driver:</span> {openTrend.summary.driver}</div>
                  <div><span className="font-semibold">Tension:</span> {openTrend.summary.tension}</div>
                  <div><span className="font-semibold">Behaviour:</span> {openTrend.summary.behaviour}</div>
                </div>
              </section>
              <section>
                <h4 className="font-semibold mb-2">Scores</h4>
                <div className="space-y-2">
                  <ScoreRow label="Novelty" value={openTrend.scores.novelty} />
                  <ScoreRow label="Velocity" value={openTrend.scores.velocity} />
                  <ScoreRow label="Relevance" value={openTrend.scores.relevance} />
                  <ScoreRow label="Confidence" value={openTrend.scores.confidence} />
                </div>
              </section>
            </div>
            <div className="col-span-5 space-y-4">
              <section>
                <h4 className="font-semibold mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {openTrend.tags.map(tag=>(
                    <span key={tag} className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">{tag}</span>
                  ))}
                </div>
              </section>
              <section>
                <h4 className="font-semibold mb-2">Viz (derived)</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg border p-3">
                    <div className="text-slate-500">Size (relevance)</div>
                    <div className="text-xl font-semibold">{Math.max(1, Math.min(20, Math.round(openTrend.scores.relevance/5)))}</div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-slate-500">Intensity (velocity)</div>
                    <div className="text-xl font-semibold">
                      {Math.max(0.5, Math.min(3.0, +(0.5 + (openTrend.scores.velocity/100)*2.5).toFixed(1)))}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/** ---------------------------
 *  SUB-COMPONENTS
 *  --------------------------- */
const ScoreRow: React.FC<{label:string; value:number}> = ({label, value}) => (
  <div>
    <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
      <span>{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
    <Meter value={value} />
  </div>
);

const BubbleRadar: React.FC<{trends: typeof dashboardMock.spotlights}> = ({trends}) => {
  // Map relevance → size, velocity → y, novelty → x (simple normalisation)
  const width = 720, height = 260, pad = 24;
  const maxScore = 100;
  const bubbles = trends.map((t, i) => {
    const x = pad + (t.scores.novelty/maxScore) * (width - pad*2);
    const y = height - pad - (t.scores.velocity/maxScore) * (height - pad*2);
    const r = 10 + (t.scores.relevance/maxScore) * 22;
    const color = t.category === "Sustainability" ? "#10b981" :
                  t.category === "Creativity" ? "#ab81fa" : "#1f2937";
    return {x,y,r,color,label:t.title};
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-64">
      {/* axes */}
      <line x1={pad} y1={height-pad} x2={width-pad} y2={height-pad} stroke="#e5e7eb" />
      <line x1={pad} y1={pad} x2={pad} y2={height-pad} stroke="#e5e7eb" />
      <text x={width/2} y={height-6} textAnchor="middle" fontSize="10" fill="#64748b">Novelty →</text>
      <text x={10} y={height/2} transform={`rotate(-90 10 ${height/2})`} textAnchor="middle" fontSize="10" fill="#64748b">Velocity ↑</text>
      {/* bubbles */}
      {bubbles.map((b, idx)=>(
        <g key={idx}>
          <circle cx={b.x} cy={b.y} r={b.r} fill={b.color} opacity={0.18} />
          <circle cx={b.x} cy={b.y} r={Math.max(6,b.r-6)} fill="none" stroke={b.color} strokeWidth={1.5}/>
          <text x={b.x} y={b.y - b.r - 4} textAnchor="middle" fontSize="10" fill="#334155">{b.label}</text>
        </g>
      ))}
    </svg>
  );
};
