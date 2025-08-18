import React, { useMemo, useState, useEffect } from "react";
import { TrendsData, TrendItem } from '../types';

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
      <div className="p-3">{children}</div>
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
  const w = 360, h = 80, pad = 12;
  const step = (w - pad*2) / (data.length - 1 || 1);
  const points = data.map((v,i)=>`${pad + i*step},${h - pad - (v/max)*(h - pad*2)}`).join(" ");
  
  // Create gradient for the line
  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <filter id={`glow-${gradientId}`}>
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Background grid */}
      <rect x={0} y={0} width={w} height={h} fill="#f8fafc" rx="4" />
      
      {/* Grid lines */}
      {[0.25, 0.5, 0.75].map((val, i) => (
        <line 
          key={i}
          x1={pad} y1={h - pad - val * (h - pad*2)} 
          x2={w - pad} y2={h - pad - val * (h - pad*2)} 
          stroke="#e2e8f0" strokeWidth="1" 
        />
      ))}
      
      {/* Area fill */}
      <path 
        d={`M ${pad},${h - pad} L ${points.split(' ').map(p => p.split(',')[0]).join(',')} L ${w - pad},${h - pad} Z`}
        fill={`url(#${gradientId})`}
        opacity="0.1"
      />
      
      {/* Main line with gradient and glow */}
      <polyline 
        fill="none" 
        stroke={`url(#${gradientId})`} 
        strokeWidth="3" 
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        filter={`url(#glow-${gradientId})`}
      />
      
      {/* Data points */}
      {data.map((v, i) => {
        const x = pad + i * step;
        const y = h - pad - (v/max) * (h - pad*2);
        return (
          <g key={i}>
            <circle 
              cx={x} cy={y} r="4" 
              fill="white" 
              stroke={`url(#${gradientId})`} 
              strokeWidth="2"
            />
            <circle 
              cx={x} cy={y} r="2" 
              fill={`url(#${gradientId})`}
            />
          </g>
        );
      })}
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
  const [currentSpotlightIndex, setCurrentSpotlightIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [showRadarModal, setShowRadarModal] = useState(false);
  const [showOpportunities, setShowOpportunities] = useState(true);
  
  // Live data states
  const [trendsData, setTrendsData] = useState<TrendsData | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLiveTrends, setHasLiveTrends] = useState(false);
  const [hasLiveDashboard, setHasLiveDashboard] = useState(false);

                // Fetch live data
              useEffect(() => {
                const fetchData = async () => {
                  setLoading(true);
                  setError(null);
                  let hasLiveData = false;
                  
                  try {
                    // Fetch trends data
                    const trendsApiUrl = 'https://trends-dashboard-six.vercel.app/api/trends-individual';
                    const trendsResponse = await fetch(trendsApiUrl);
                    if (trendsResponse.ok) {
                      const trendsData = await trendsResponse.json();
                      setTrendsData(trendsData);
                      setHasLiveTrends(true);
                      console.log('✅ Live trends data loaded');
                    } else {
                      console.warn('⚠️ Trends data not available, using demo data');
                    }
                  } catch (err) {
                    console.error('❌ Error fetching trends data:', err);
                  }
                  
                  try {
                    // Fetch dashboard data (optional - for dashboard-specific insights)
                    const dashboardApiUrl = 'https://trends-dashboard-six.vercel.app/api/dashboard-data';
                    const dashboardResponse = await fetch(dashboardApiUrl);
                    if (dashboardResponse.ok) {
                      const dashboardData = await dashboardResponse.json();
                      setDashboardData(dashboardData);
                      setHasLiveDashboard(true);
                      console.log('✅ Live dashboard data loaded');
                    } else {
                      console.warn('⚠️ Dashboard insights not available yet, using demo data');
                    }
                  } catch (err) {
                    console.error('❌ Error fetching dashboard data:', err);
                  }
                  
                  setLoading(false);
                };
                fetchData();
              }, []);

  // Transform live trends to dashboard format
  const liveSpotlights = useMemo(() => {
    if (!trendsData?.trends) return dashboardMock.spotlights;
    
    return trendsData.trends.map(trend => ({
      id: trend.id,
      title: trend.title,
      category: trend.category,
      summary: {
        driver: trend.summary.split('\n')[0]?.replace('Driver: ', '') || '',
        tension: trend.summary.split('\n')[1]?.replace('Tension: ', '') || '',
        behaviour: trend.summary.split('\n')[2]?.replace('Behaviour: ', '') || ''
      },
      scores: trend.scores,
      tags: trend.tags
    }));
  }, [trendsData]);

  const filteredSpotlights = useMemo(()=>{
    let items = liveSpotlights;
    if(activeCats.length) items = items.filter(t => activeCats.includes(t.category));
    if(query.trim()) {
      const q = query.toLowerCase();
      items = items.filter(t => (t.title + " " + t.tags.join(" ") + " " + t.category).toLowerCase().includes(q));
    }
    return items;
  },[liveSpotlights, activeCats, query]);

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

  // Extract live categories from trends data
  const liveCategories = useMemo(() => {
    if (!trendsData?.trends) return dashboardMock.filters.categories;
    return [...new Set(trendsData.trends.map(t => t.category))];
  }, [trendsData]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-slate-600">Loading live trends...</div>
        </div>
      </div>
    );
  }

  // Show error state (only if we have no data at all)
  if (error && !trendsData && !dashboardData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">⚠️ {error}</div>
          <div className="text-slate-600">Using demo data instead</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-[1440px] px-4 py-6 grid grid-cols-12 gap-4 items-start">
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
                placeholder="e.g., Gen Z retail, refill, on-device AI (not functional)"
                className="w-full rounded-lg border border-red-300 px-3 py-2 outline-none focus:ring-2 focus:ring-red-500 text-red-600"
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
            className="w-full p-3 rounded-xl border border-red-300 hover:bg-red-50 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="text-sm font-medium text-red-700">Filters (not functional)</span>
            {activeCats.length > 0 && (
              <span className="ml-auto px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                {activeCats.length}
              </span>
            )}
          </button>





          {/* Trend Spotlights */}
          <Panel accent="purple">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-base">Trend Spotlights</h3>
              <div className="text-xs text-slate-500">{filteredSpotlights.length} total</div>
            </div>
            {filteredSpotlights.length > 0 && (
              <>
                <div className="mt-3">
                  <button
                    onClick={()=>setOpenTrend(filteredSpotlights[currentSpotlightIndex])}
                    className="w-full text-left rounded-xl border border-slate-200 p-3 hover:border-slate-300 hover:shadow-sm transition"
                  >
                    <div className={`text-xs mb-1 ${hasLiveTrends ? 'text-green-600' : 'text-red-600'}`}>
                      {filteredSpotlights[currentSpotlightIndex].category} {hasLiveTrends ? '(LIVE)' : '(DEMO)'}
                    </div>
                    <div className={`font-medium ${hasLiveTrends ? 'text-green-700' : 'text-red-700'}`}>
                      {filteredSpotlights[currentSpotlightIndex].title}
                    </div>
                    <div className="mt-2 text-sm text-slate-700">
                      <div><span className="font-semibold">Driver:</span> {filteredSpotlights[currentSpotlightIndex].summary.driver}</div>
                      <div><span className="font-semibold">Tension:</span> {filteredSpotlights[currentSpotlightIndex].summary.tension}</div>
                      <div><span className="font-semibold">Behaviour:</span> {filteredSpotlights[currentSpotlightIndex].summary.behaviour}</div>
                    </div>
                    <div className="mt-3 space-y-1">
                      <ScoreRow label="Novelty" value={filteredSpotlights[currentSpotlightIndex].scores.novelty} />
                      <ScoreRow label="Velocity" value={filteredSpotlights[currentSpotlightIndex].scores.velocity} />
                      <ScoreRow label="Relevance" value={filteredSpotlights[currentSpotlightIndex].scores.relevance} />
                      <ScoreRow label="Confidence" value={filteredSpotlights[currentSpotlightIndex].scores.confidence} />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {filteredSpotlights[currentSpotlightIndex].tags.map(tag=>(
                        <span key={tag} className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">{tag}</span>
                      ))}
                    </div>
                  </button>
                </div>
                {/* Navigation dots */}
                <div className="flex justify-center mt-3 space-x-1">
                  {filteredSpotlights.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSpotlightIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        idx === currentSpotlightIndex 
                          ? 'bg-purple-500 w-4' 
                          : 'bg-slate-300'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
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
                                {liveCategories.map(cat=>{
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
                  <div className="text-xs font-semibold text-red-600 mb-2">Industries (not functional)</div>
                  <div className="flex flex-wrap gap-2">
                    {dashboardMock.filters.industries.map((i)=>(
                      <span key={i} className="px-3 py-1 rounded-full text-sm border bg-red-50 text-red-600 border-red-200">{i}</span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs font-semibold text-red-600 mb-2">Audiences (not functional)</div>
                  <div className="flex flex-wrap gap-2">
                    {dashboardMock.filters.audiences.map((a)=>(
                      <span key={a} className="px-3 py-1 rounded-full text-sm border bg-red-50 text-red-600 border-red-200">{a}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main grid */}
        <main className="col-span-9 grid grid-cols-12 gap-4 content-start">
          {/* State of World */}
          <Panel accent="blue" className="col-span-8">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-base mb-0.5">State of the World <span className={`text-sm ${hasLiveDashboard ? 'text-green-600' : 'text-red-600'}`}>{hasLiveDashboard ? '(LIVE)' : '(DEMO)'}</span></h3>
                <p className={`text-sm ${hasLiveDashboard ? 'text-green-700' : 'text-red-600'}`}>{dashboardData?.stateOfWorld?.thesis || dashboardMock.stateOfWorld.thesis}</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500 mb-0.5">Trend Velocity (8 weeks)</div>
                <div className="w-90 h-20"><Sparkline data={dashboardData?.stateOfWorld?.velocity || dashboardMock.stateOfWorld.velocity} /></div>
              </div>
            </div>
            <div className="mt-1">
              <div className="text-xs text-slate-500 mb-0.5">Top Movers</div>
              <div className="flex flex-wrap gap-1">
                {(dashboardData?.stateOfWorld?.movers || dashboardMock.stateOfWorld.movers).map((m: any, i: number)=>(
                  <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700">
                    {m.label} <span className="text-emerald-600">▲{m.strength}</span>
                  </span>
                ))}
              </div>
            </div>
          </Panel>

          {/* AI Insight */}
          <Panel id="ai-insight-card" accent="purple" className="col-span-4 ai-insight-card">
                          <h3 className="font-semibold text-base mb-0.5">AI Insight <span className={`text-sm ${hasLiveDashboard ? 'text-green-600' : 'text-red-600'}`}>{hasLiveDashboard ? '(LIVE)' : '(DEMO)'}</span></h3>
            <div className={`font-medium text-sm ${hasLiveDashboard ? 'text-green-700' : 'text-red-700'}`}>{dashboardData?.aiInsight?.title || dashboardMock.aiInsight.title}</div>
            <ul className={`mt-1 space-y-0.5 text-sm list-disc pl-4 ${hasLiveDashboard ? 'text-green-600' : 'text-red-600'}`}>
              {(dashboardData?.aiInsight?.bullets || dashboardMock.aiInsight.bullets).map((b: string, i: number)=><li key={i}>{b}</li>)}
            </ul>
          </Panel>

          {/* Live Signals Strip */}
          <div id="live-signals-strip" className={`col-span-12 overflow-hidden relative h-8 rounded-lg border ${hasLiveDashboard ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-200' : 'bg-gradient-to-r from-red-50 to-red-100 border-red-200'}`}>
            <div className={`absolute whitespace-nowrap animate-[marquee_20s_linear_infinite] text-sm py-2 ${hasLiveDashboard ? 'text-green-700' : 'text-red-700'}`}>
              {(dashboardData?.liveSignals || dashboardMock.liveSignals).map((s: string, i: number)=>(
                <span key={i} className="mr-8">• {s} {hasLiveDashboard ? '(LIVE)' : '(DEMO)'}</span>
              ))}
            </div>
          </div>

          {/* Column 1: Opportunities and Threats (stacked) */}
          <div id="opportunities-threats-container" className="col-span-6 space-y-2">
            {/* Opportunities */}
            <Panel id="brand-opportunities-card" accent="green" className="opportunities-card">
              <h3 className="font-semibold text-base mb-1">Brand Opportunities <span className={`text-sm ${hasLiveDashboard ? 'text-green-600' : 'text-red-600'}`}>{hasLiveDashboard ? '(LIVE)' : '(DEMO)'}</span></h3>
              <div className="rounded-lg border border-slate-200 p-2">
                <div className="flex items-start justify-between">
                  <div className="font-medium">{(dashboardData?.opportunities || dashboardMock.opportunities)[currentOpportunityIndex]?.title}</div>
                  <Badge tone={(dashboardData?.opportunities || dashboardMock.opportunities)[currentOpportunityIndex]?.level as any} />
                </div>
                <div className="text-sm text-slate-700 mt-1"><span className="font-semibold">Why now:</span> {(dashboardData?.opportunities || dashboardMock.opportunities)[currentOpportunityIndex]?.whyNow}</div>
                <div className="text-sm text-slate-700 mt-1"><span className="font-semibold">Signals:</span> {(dashboardData?.opportunities || dashboardMock.opportunities)[currentOpportunityIndex]?.signals?.join(" • ")}</div>
                <div className="text-sm text-slate-700 mt-1"><span className="font-semibold">Play:</span> {(dashboardData?.opportunities || dashboardMock.opportunities)[currentOpportunityIndex]?.play}</div>
              </div>
              {/* Navigation dots */}
              <div className="flex justify-center mt-2 space-x-1">
                {(dashboardData?.opportunities || dashboardMock.opportunities).map((_, idx) => (
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

            {/* Threats */}
            <Panel id="competitive-threats-card" accent="red" className="threats-card">
              <h3 className="font-semibold text-base mb-1">Competitive Threats <span className={`text-sm ${hasLiveDashboard ? 'text-green-600' : 'text-red-600'}`}>{hasLiveDashboard ? '(LIVE)' : '(DEMO)'}</span></h3>
              <div className="rounded-lg border border-slate-200 p-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{(dashboardData?.threats || dashboardMock.threats)[currentThreatIndex]?.brand} → <span className="text-slate-700">{(dashboardData?.threats || dashboardMock.threats)[currentThreatIndex]?.move}</span></div>
                    <div className="text-xs text-slate-500 mt-1">Seen: {(dashboardData?.threats || dashboardMock.threats)[currentThreatIndex]?.seen}</div>
                  </div>
                  <Badge tone={(dashboardData?.threats || dashboardMock.threats)[currentThreatIndex]?.urgency as any} />
                </div>
                <div className="text-sm text-slate-700 mt-1"><span className="font-semibold">Action:</span> {(dashboardData?.threats || dashboardMock.threats)[currentThreatIndex]?.action}</div>
              </div>
              {/* Navigation dots */}
              <div className="flex justify-center mt-2 space-x-1">
                {(dashboardData?.threats || dashboardMock.threats).map((_, idx) => (
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
          </div>

          {/* Column 2: Trend Radar */}
          <Panel id="trend-radar-card" accent="blue" className="col-span-6 radar-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Trend Radar <span className={`text-sm ${hasLiveTrends ? 'text-green-600' : 'text-red-600'}`}>{hasLiveTrends ? '(LIVE)' : '(DEMO)'}</span></h3>
              <div className="text-xs text-slate-500">Positioned by relevance, velocity, and novelty</div>
            </div>
            <div className="w-full h-full flex items-center justify-center">
              <BubbleRadar trends={filteredSpotlights} />
            </div>
          </Panel>



        </main>
      </div>
      
      {/* marquee keyframes */}
      <style>{`@keyframes marquee {0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>

      {/* Radar Modal */}
      <Modal
        open={showRadarModal}
        onClose={() => setShowRadarModal(false)}
        title="Trend Radar"
        accent="blue"
      >
        <div className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Trend Landscape</h3>
            <p className="text-slate-600 text-sm">Positioned by relevance, velocity, and novelty</p>
          </div>
          <div className="w-full h-96 flex items-center justify-center">
            <BubbleRadar trends={filteredSpotlights} />
          </div>
          <div className="mt-6 grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="font-semibold text-slate-900">Relevance</div>
              <div className="text-slate-600">How important to your business</div>
            </div>
            <div>
              <div className="font-semibold text-slate-900">Velocity</div>
              <div className="text-slate-600">How fast it's accelerating</div>
            </div>
            <div>
              <div className="font-semibold text-slate-900">Novelty</div>
              <div className="text-slate-600">How new/emerging it is</div>
            </div>
          </div>
        </div>
      </Modal>

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
  const width = 800, height = 600, pad = 60;
  const maxScore = 100;
  
  // Create gradient definitions
  const gradients = [
    { id: 'gradient-green', colors: ['#10b981', '#059669'] },
    { id: 'gradient-purple', colors: ['#ab81fa', '#8b5cf6'] },
    { id: 'gradient-blue', colors: ['#3b82f6', '#1d4ed8'] },
    { id: 'gradient-orange', colors: ['#f59e0b', '#d97706'] },
    { id: 'gradient-red', colors: ['#ef4444', '#dc2626'] }
  ];

  const bubbles = trends.map((t, i) => {
    const x = pad + (t.scores.novelty/maxScore) * (width - pad*2);
    const y = height - pad - (t.scores.velocity/maxScore) * (height - pad*2);
    const r = 12 + (t.scores.relevance/maxScore) * 35;
    
    // Assign gradient based on category
    let gradientId = 'gradient-blue';
    if (t.category === "Sustainability") gradientId = 'gradient-green';
    else if (t.category === "Creativity") gradientId = 'gradient-purple';
    else if (t.category === "Technology") gradientId = 'gradient-orange';
    else if (t.category === "Social Media") gradientId = 'gradient-red';
    
    return {
      x, y, r, 
      gradientId,
      label: t.title,
      category: t.category,
      scores: t.scores
    };
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      {/* Gradient definitions */}
      <defs>
        {gradients.map(grad => (
          <linearGradient key={grad.id} id={grad.id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={grad.colors[0]} />
            <stop offset="100%" stopColor={grad.colors[1]} />
          </linearGradient>
        ))}
      </defs>
      
      {/* Background grid */}
      <rect x={0} y={0} width={width} height={height} fill="#f8fafc" />
      
      {/* Grid lines */}
      {[0.2, 0.4, 0.6, 0.8].map((val, i) => (
        <g key={i}>
          <line 
            x1={pad + val * (width - pad*2)} y1={pad} 
            x2={pad + val * (width - pad*2)} y2={height-pad} 
            stroke="#e2e8f0" strokeWidth={1} 
          />
          <line 
            x1={pad} y1={height-pad - val * (height - pad*2)} 
            x2={width-pad} y2={height-pad - val * (height - pad*2)} 
            stroke="#e2e8f0" strokeWidth={1} 
          />
        </g>
      ))}
      
      {/* Axes */}
      <line x1={pad} y1={height-pad} x2={width-pad} y2={height-pad} stroke="#64748b" strokeWidth={2} />
      <line x1={pad} y1={pad} x2={pad} y2={height-pad} stroke="#64748b" strokeWidth={2} />
      
      {/* Axis labels */}
      <text x={width/2} y={height-15} textAnchor="middle" fontSize="14" fill="#475569" fontWeight="600">
        Novelty → (How new/emerging)
      </text>
      <text x={15} y={height/2} transform={`rotate(-90 15 ${height/2})`} textAnchor="middle" fontSize="14" fill="#475569" fontWeight="600">
        Velocity ↑ (How fast accelerating)
      </text>
      
      {/* Axis values */}
      {[0, 25, 50, 75, 100].map((val, i) => (
        <g key={i}>
          <text x={pad + (val/100) * (width - pad*2)} y={height-pad+20} textAnchor="middle" fontSize="12" fill="#64748b">
            {val}
          </text>
          <text x={pad-20} y={height-pad - (val/100) * (height - pad*2)} textAnchor="middle" fontSize="12" fill="#64748b">
            {val}
          </text>
        </g>
      ))}
      
      {/* Bubbles */}
      {bubbles.map((b, idx) => (
        <g key={idx}>
          {/* Glow effect */}
          <circle cx={b.x} cy={b.y} r={b.r + 4} fill={`url(#${b.gradientId})`} opacity={0.3} />
          {/* Main bubble */}
          <circle cx={b.x} cy={b.y} r={b.r} fill={`url(#${b.gradientId})`} />
          {/* Inner highlight */}
          <circle cx={b.x - b.r*0.3} cy={b.y - b.r*0.3} r={b.r*0.4} fill="white" opacity={0.3} />
          {/* Border */}
          <circle cx={b.x} cy={b.y} r={b.r} fill="none" stroke="white" strokeWidth={2} opacity={0.8} />
          
          {/* Trend title */}
          <text x={b.x} y={b.y - b.r - 8} textAnchor="middle" fontSize="11" fill="#1e293b" fontWeight="600">
            {b.label}
          </text>
          
          {/* Category badge */}
          <rect 
            x={b.x - 20} y={b.y - b.r - 25} 
            width={40} height={16} 
            rx={8} 
            fill="white" 
            stroke={`url(#${b.gradientId})`} 
            strokeWidth={1}
          />
          <text x={b.x} y={b.y - b.r - 15} textAnchor="middle" fontSize="9" fill="#475569" fontWeight="500">
            {b.category}
          </text>
        </g>
      ))}
      
      {/* Legend */}
      <g transform={`translate(${width-200}, 20)`}>
        <text x={0} y={0} fontSize="12" fill="#475569" fontWeight="600">Categories</text>
        {['Sustainability', 'Creativity', 'Technology', 'Social Media', 'Other'].map((cat, i) => {
          const gradientId = cat === "Sustainability" ? 'gradient-green' :
                            cat === "Creativity" ? 'gradient-purple' :
                            cat === "Technology" ? 'gradient-orange' :
                            cat === "Social Media" ? 'gradient-red' : 'gradient-blue';
          return (
            <g key={i} transform={`translate(0, ${i*20 + 15})`}>
              <circle cx={8} cy={8} r={6} fill={`url(#${gradientId})`} />
              <text x={20} y={12} fontSize="10" fill="#475569">{cat}</text>
            </g>
          );
        })}
      </g>
    </svg>
  );
};
