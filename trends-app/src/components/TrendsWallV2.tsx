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
  STATE_OF_WORLD: {
    thesis: "Trust-first AI becomes a default consumer expectation.",
    velocitySpark: [12,14,18,22,28,34,41,43], // weekly weighted signals
    movers: [
      {label:"Privacy-by-design platforms", deltaPercent:62},
      {label:"Zero-waste retail", deltaPercent:55},
      {label:"Community-driven media", deltaPercent:48}
    ]
  },
  AI_INSIGHT: {
    title: "Ambient AI replaces app-switching.",
    bullets: [
      "Consumers expect seamless help without surveillance.",
      "Micro-interactions reduce friction and churn.",
      "Personalisation must be privacy-first."
    ]
  },
  COMPETITIVE_THREATS: [
    {brand:"Coca-Cola", move:"Voice-Order via Alexa", urgency:"Medium", seen:"11 days ago",
     action:"Test your own voice SKUs + promo scripts in Q4."},
    {brand:"Nike", move:"Phygital Membership Hubs", urgency:"High", seen:"6 days ago",
     action:"Explore experiential pop-ups tied directly to loyalty data."}
  ],
  BRAND_OPPORTUNITIES: [
    {
      title:"Sustainable Packaging Becomes a Purchase Shortcut",
      level:"High",
      whyNow:"\"Low-waste\" badges accelerate buying decisions online and in-store.",
      signals:["+65% mentions of refill/reuse in last 6 months"],
      play:"Launch a \"Refill Fast Lane\" option and badge receipts for waste saved."
    },
    {
      title:"Community-Powered Discovery",
      level:"Medium",
      whyNow:"Gen Z trusts creators and peers more than brands.",
      signals:["70% of TikTok users say they've bought after a peer recommendation"],
      play:"Shift budgets toward micro-influencer pods with direct-to-purchase links."
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
  SIGNAL_TICKER: [
    "EU expands Digital Product Passport pilots → mid-market brands (Jul 2025)",
    "TikTok Shopping revises affiliate rules (Aug 2025)",
    "Apple Vision Pro v2.0 pre-orders exceed forecasts (Sep 2025)",
    "Patagonia launches \"Repair in a Box\" DIY kits (Sep 2025)"
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

const ScoreRow: React.FC<{label:string; value:number}> = ({label, value}) => (
  <div className="flex items-center justify-between text-xs">
    <span className="text-slate-600">{label}</span>
    <div className="flex items-center gap-2">
      <div className="w-12 h-1.5 rounded-full bg-slate-100">
        <div className="h-1.5 rounded-full bg-slate-900" style={{width: `${value}%`}} />
      </div>
      <span className="text-slate-700 font-medium w-8 text-right">{value}</span>
    </div>
  </div>
);

const Sparkline: React.FC<{data:number[]}> = ({data}) => {
  const max = Math.max(...data, 1);
  const w = 360, h = 80, pad = 12;
  const step = (w - pad*2) / (data.length - 1 || 1);
  const points = data.map((v,i)=>`${pad + i*step},${h - pad - (v/max)*(h - pad*2)}`).join(" ");

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

      <rect x={0} y={0} width={w} height={h} fill="#f8fafc" rx="4" />

      {[0.25, 0.5, 0.75].map((val, i) => (
        <line
          key={i}
          x1={pad} y1={h - pad - val * (h - pad*2)}
          x2={w - pad} y2={h - pad - val * (h - pad*2)}
          stroke="#e2e8f0" strokeWidth="1"
        />
      ))}

      <path
        d={`M ${pad},${h - pad} L ${points.split(' ').map(p => p.split(',')[0]).join(',')} L ${w - pad},${h - pad} Z`}
        fill={`url(#${gradientId})`}
        opacity="0.1"
      />

      <polyline
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        filter={`url(#glow-${gradientId})`}
      />

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

const Modal: React.FC<{onClose:()=>void; title:string; children:React.ReactNode}> = ({onClose, title, children}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between p-6 border-b">
        <h3 className="text-lg font-semibold">{title}</h3>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-900">✕</button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

const BubbleRadar: React.FC<{trends:any[]}> = ({trends}) => {
  const width = 400, height = 300, pad = 40;
  const bubbles = trends.map((t, i) => {
    const x = pad + (t.scores.novelty / 100) * (width - pad*2);
    const y = height - pad - (t.scores.velocity / 100) * (height - pad*2);
    const r = Math.max(8, Math.min(20, t.scores.relevance / 5));
    const gradientId = `gradient-${i}`;
    return { x, y, r, label: t.title, category: t.category, gradientId };
  });

  const gradients = [
    { id: 'gradient-green', colors: ['#10b981', '#34d399'] },
    { id: 'gradient-purple', colors: ['#8b5cf6', '#a78bfa'] },
    { id: 'gradient-orange', colors: ['#f59e0b', '#fbbf24'] },
    { id: 'gradient-red', colors: ['#ef4444', '#f87171'] },
    { id: 'gradient-blue', colors: ['#3b82f6', '#60a5fa'] }
  ];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      <defs>
        {gradients.map(grad => (
          <linearGradient key={grad.id} id={grad.id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={grad.colors[0]} />
            <stop offset="100%" stopColor={grad.colors[1]} />
          </linearGradient>
        ))}
      </defs>
      
      <rect x={0} y={0} width={width} height={height} fill="#f8fafc" />
      
      {[0.2, 0.4, 0.6, 0.8].map((val, i) => (
        <g key={i}>
          <line 
            x1={pad + val * (width - pad*2)} y1={pad} 
            x2={pad + val * (width - pad*2)} y2={height-pad} 
            stroke="#e2e8f0" strokeWidth="1" 
          />
          <line 
            x1={pad} y1={height-pad - val * (height - pad*2)} 
            x2={width-pad} y2={height-pad - val * (height - pad*2)} 
            stroke="#e2e8f0" strokeWidth="1" 
          />
        </g>
      ))}
      
      <line x1={pad} y1={height-pad} x2={width-pad} y2={height-pad} stroke="#64748b" strokeWidth="2" />
      <line x1={pad} y1={pad} x2={pad} y2={height-pad} stroke="#64748b" strokeWidth="2" />
      
      <text x={width/2} y={height-15} textAnchor="middle" fontSize="14" fill="#475569" fontWeight="600">
        Novelty → (How new/emerging)
      </text>
      <text x={15} y={height/2} transform={`rotate(-90 15 ${height/2})`} textAnchor="middle" fontSize="14" fill="#475569" fontWeight="600">
        Velocity ↑ (How fast accelerating)
      </text>
      
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
      
      {bubbles.map((b, idx) => (
        <g key={idx}>
          <circle cx={b.x} cy={b.y} r={b.r + 4} fill={`url(#${b.gradientId})`} opacity={0.3} />
          <circle cx={b.x} cy={b.y} r={b.r} fill={`url(#${b.gradientId})`} />
          <circle cx={b.x - b.r*0.3} cy={b.y - b.r*0.3} r={b.r*0.4} fill="white" opacity={0.3} />
          <circle cx={b.x} cy={b.y} r={b.r} fill="none" stroke="white" strokeWidth={2} opacity={0.8} />
          
          <text x={b.x} y={b.y - b.r - 8} textAnchor="middle" fontSize="11" fill="#1e293b" fontWeight="600">
            {b.label}
          </text>
          
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

export default function TrendsWallV2() {
  // State management
  const [query, setQuery] = useState("");
  const [activeCats, setActiveCats] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentSpotlightIndex, setCurrentSpotlightIndex] = useState(0);
  const [currentThreatIndex, setCurrentThreatIndex] = useState(0);
  const [currentOpportunityIndex, setCurrentOpportunityIndex] = useState(0);
  const [openTrend, setOpenTrend] = useState<any>(null);
  const [openRadar, setOpenRadar] = useState(false);
  const [hoveredTrend, setHoveredTrend] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

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
          // Only set as live if we have actual dashboard insights, not just the fallback message
          if (dashboardData && dashboardData.STATE_OF_WORLD && !dashboardData.stateOfWorld) {
            setDashboardData(dashboardData);
            setHasLiveDashboard(true);
            console.log('✅ Live dashboard data loaded');
          } else {
            setDashboardData(dashboardData);
            setHasLiveDashboard(false);
            console.warn('⚠️ Dashboard insights not available yet, using demo data');
          }
        } else {
          setHasLiveDashboard(false);
          console.warn('⚠️ Dashboard insights not available yet, using demo data');
        }
      } catch (err) {
        setHasLiveDashboard(false);
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
      setCurrentThreatIndex((prev) => (prev + 1) % dashboardMock.COMPETITIVE_THREATS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Auto-cycle opportunities every 5 seconds (offset from threats)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentOpportunityIndex((prev) => (prev + 1) % dashboardMock.BRAND_OPPORTUNITIES.length);
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
    <div className="bg-white overflow-auto">


      <div className="max-w-8xl mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <aside className="col-span-3 space-y-4">
            {/* Title */}
            <div className="mb-4">
              <div className="text-2xl font-bold text-slate-900">Trends Dashboard</div>
              <div className="text-sm text-slate-500">Strategic Intelligence</div>
            </div>
            
            {/* Ask the wall */}
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
                    <div className="text-xs font-semibold text-slate-500 mb-2">Categories (not functional)</div>
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
                    <div className="text-xs font-semibold text-slate-500 mb-2">Industries (not functional)</div>
                    <div className="flex flex-wrap gap-2">
                      {dashboardMock.filters.industries.map(ind=>(
                        <Chip key={ind} active={false}>
                          {ind}
                        </Chip>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs font-semibold text-slate-500 mb-2">Audiences (not functional)</div>
                    <div className="flex flex-wrap gap-2">
                      {dashboardMock.filters.audiences.map(aud=>(
                        <Chip key={aud} active={false}>
                          {aud}
                        </Chip>
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
            <Panel id="state-of-world-card" accent="blue" className="col-span-8 state-of-world-card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">State of the World <span className={`text-sm ${hasLiveDashboard ? 'text-green-600' : 'text-red-600'}`}>{hasLiveDashboard ? '(LIVE)' : '(DEMO)'}</span></h3>
                  <p className={`text-base font-medium ${hasLiveDashboard ? 'text-green-700' : 'text-red-600'}`}>{dashboardData?.STATE_OF_WORLD?.thesis || dashboardMock.STATE_OF_WORLD.thesis}</p>
                  <div className="mt-2 space-y-1">
                    <div className="text-sm text-slate-700">• Top Movers:</div>
                    <div className="ml-4 space-y-1">
                      {(dashboardData?.STATE_OF_WORLD?.movers || dashboardMock.STATE_OF_WORLD.movers).map((m: any, i: number) => (
                        <div key={i} className="text-sm text-slate-700">• {m.label} ({m.deltaPercent > 0 ? '+' : ''}{m.deltaPercent}%)</div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900">
                    {(() => {
                      const velocityData = dashboardData?.STATE_OF_WORLD?.velocitySpark || dashboardMock.STATE_OF_WORLD.velocitySpark;
                      if (velocityData && velocityData.length >= 2) {
                        const first = velocityData[0];
                        const last = velocityData[velocityData.length - 1];
                        const growth = Math.round(((last - first) / first) * 100);
                        return `${growth > 0 ? '+' : ''}${growth}%`;
                      }
                      return '+0%';
                    })()}
                  </div>
                  <div className="text-xs text-slate-500">Velocity</div>
                </div>
              </div>
            </Panel>

                         {/* AI Insight */}
             <Panel id="ai-insight-card" accent="purple" className="col-span-4 ai-insight-card">
               <h3 className="font-semibold text-lg">AI Insight <span className={`text-sm ${hasLiveDashboard ? 'text-green-600' : 'text-red-600'}`}>{hasLiveDashboard ? '(LIVE)' : '(DEMO)'}</span></h3>
               <div className={`text-base font-medium ${hasLiveDashboard ? 'text-green-700' : 'text-red-700'}`}>{dashboardData?.AI_INSIGHT?.title || dashboardMock.AI_INSIGHT.title}</div>
               <ul className={`mt-2 space-y-1 text-sm list-disc pl-4 ${hasLiveDashboard ? 'text-green-600' : 'text-red-600'}`}>
                 {(dashboardData?.AI_INSIGHT?.bullets || dashboardMock.AI_INSIGHT.bullets).map((b: string, i: number)=><li key={i}>{b}</li>)}
               </ul>
             </Panel>

                          {/* Live Signals Strip */}
             <div id="live-signals-strip" className={`col-span-12 overflow-hidden relative h-8 rounded-lg border ${hasLiveDashboard ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-200' : 'bg-gradient-to-r from-red-50 to-red-100 border-red-200'}`}>
                                <div className={`text-sm py-2 px-4 ${hasLiveDashboard ? 'text-green-700' : 'text-red-700'}`}>
                   • {(dashboardData?.SIGNAL_TICKER || dashboardMock.SIGNAL_TICKER)[0]} {hasLiveDashboard ? '(LIVE)' : '(DEMO)'} • {(dashboardData?.SIGNAL_TICKER || dashboardMock.SIGNAL_TICKER)[1]} {hasLiveDashboard ? '(LIVE)' : '(DEMO)'}
                 </div>
             </div>

            {/* Column 1: Opportunities and Threats (stacked) */}
            <div id="opportunities-threats-container" className="col-span-6 space-y-2">
                             {/* Opportunities */}
               <Panel id="brand-opportunities-card" accent="green" className="opportunities-card">
                 <h3 className="font-semibold text-base mb-1">Brand Opportunities <span className={`text-sm ${hasLiveDashboard ? 'text-green-600' : 'text-red-600'}`}>{hasLiveDashboard ? '(LIVE)' : '(DEMO)'}</span></h3>
                 <div className="rounded-lg border border-slate-200 p-2">
                   <div className="font-medium">{(dashboardData?.BRAND_OPPORTUNITIES || dashboardMock.BRAND_OPPORTUNITIES)[currentOpportunityIndex]?.title || dashboardMock.BRAND_OPPORTUNITIES[currentOpportunityIndex]?.title}</div>
                   <div className="text-sm text-slate-700 mt-1"><span className="font-semibold">Why now:</span> {(dashboardData?.BRAND_OPPORTUNITIES || dashboardMock.BRAND_OPPORTUNITIES)[currentOpportunityIndex]?.whyNow || dashboardMock.BRAND_OPPORTUNITIES[currentOpportunityIndex]?.whyNow}</div>
                   <div className="text-sm text-slate-700 mt-1"><span className="font-semibold">Signals:</span> {(dashboardData?.BRAND_OPPORTUNITIES || dashboardMock.BRAND_OPPORTUNITIES)[currentOpportunityIndex]?.signals?.join(" • ") || dashboardMock.BRAND_OPPORTUNITIES[currentOpportunityIndex]?.signals?.join(" • ")}</div>
                   <div className="text-sm text-slate-700 mt-1"><span className="font-semibold">Play:</span> {(dashboardData?.BRAND_OPPORTUNITIES || dashboardMock.BRAND_OPPORTUNITIES)[currentOpportunityIndex]?.play || dashboardMock.BRAND_OPPORTUNITIES[currentOpportunityIndex]?.play}</div>
                 </div>
                 {/* Navigation dots */}
                 <div className="flex justify-center mt-2 space-x-1">
                   {(dashboardData?.BRAND_OPPORTUNITIES || dashboardMock.BRAND_OPPORTUNITIES).map((_, idx) => (
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
                   <div className="font-medium">{dashboardMock.COMPETITIVE_THREATS[currentThreatIndex]?.brand} → {dashboardMock.COMPETITIVE_THREATS[currentThreatIndex]?.move}</div>
                   <div className="text-sm text-slate-700 mt-1"><span className="font-semibold">Seen:</span> {(dashboardData?.COMPETITIVE_THREATS || dashboardMock.COMPETITIVE_THREATS)[currentThreatIndex]?.seen || dashboardMock.COMPETITIVE_THREATS[currentThreatIndex]?.seen}</div>
                   <div className="text-sm text-slate-700 mt-1"><span className="font-semibold">Move:</span> {(dashboardData?.COMPETITIVE_THREATS || dashboardMock.COMPETITIVE_THREATS)[currentThreatIndex]?.move || dashboardMock.COMPETITIVE_THREATS[currentThreatIndex]?.move}</div>
                   <div className="text-sm text-slate-700 mt-1"><span className="font-semibold">Urgency:</span> {(dashboardData?.COMPETITIVE_THREATS || dashboardMock.COMPETITIVE_THREATS)[currentThreatIndex]?.urgency || dashboardMock.COMPETITIVE_THREATS[currentThreatIndex]?.urgency}</div>
                   <div className="text-sm text-slate-700 mt-1"><span className="font-semibold">Action:</span> {(dashboardData?.COMPETITIVE_THREATS || dashboardMock.COMPETITIVE_THREATS)[currentThreatIndex]?.action || dashboardMock.COMPETITIVE_THREATS[currentThreatIndex]?.action}</div>
                 </div>
                 {/* Navigation dots */}
                 <div className="flex justify-center mt-2 space-x-1">
                   {(dashboardData?.COMPETITIVE_THREATS || dashboardMock.COMPETITIVE_THREATS).map((_, idx) => (
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
              
              {/* Chart Version */}
              <div className="h-80">
                <svg viewBox="0 0 100 60" className="w-full h-full">
                  <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="50%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                  
                  {/* Background */}
                  <rect x="0" y="0" width="100" height="60" fill="#f8fafc" rx="2" />
                  
                  {/* Grid lines */}
                  {[0.2, 0.4, 0.6, 0.8].map((val, i) => (
                    <g key={i}>
                      <line x1={15} y1={10 + val * 40} x2={85} y2={10 + val * 40} stroke="#e2e8f0" strokeWidth="0.5" />
                      <line x1={15 + val * 70} y1={10} x2={15 + val * 70} y2={50} stroke="#e2e8f0" strokeWidth="0.5" />
                    </g>
                  ))}
                  
                  {/* Axes */}
                  <line x1="15" y1="10" x2="15" y2="50" stroke="#64748b" strokeWidth="1" />
                  <line x1="15" y1="50" x2="85" y2="50" stroke="#64748b" strokeWidth="1" />
                  
                  {/* Axis labels */}
                  <text x="50" y="58" textAnchor="middle" fontSize="3" fill="#475569" fontWeight="600">Novelty →</text>
                  <text x="8" y="30" transform="rotate(-90 8 30)" textAnchor="middle" fontSize="3" fill="#475569" fontWeight="600">Velocity →</text>
                  
                  {/* Trend bubbles */}
                  {liveSpotlights.slice(0, 6).map((trend, idx) => {
                    const x = 15 + (trend.scores.novelty / 100) * 70;
                    const y = 50 - (trend.scores.velocity / 100) * 40;
                    const r = Math.max(1.5, Math.min(4, trend.scores.relevance / 25));
                    const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
                    
                    return (
                      <g key={idx}>
                        <circle 
                          cx={x} 
                          cy={y} 
                          r={r + 0.5} 
                          fill={colors[idx % colors.length]} 
                          opacity="0.3" 
                        />
                        <circle 
                          cx={x} 
                          cy={y} 
                          r={r} 
                          fill={colors[idx % colors.length]}
                          onMouseEnter={(e) => {
                            setHoveredTrend(trend.title);
                            setTooltipPosition({ x: e.clientX, y: e.clientY });
                          }}
                          onMouseLeave={() => setHoveredTrend(null)}
                          style={{ cursor: 'pointer' }}
                        />
                        <circle cx={x - r*0.3} cy={y - r*0.3} r={r*0.4} fill="white" opacity="0.3" />
                        <circle cx={x} cy={y} r={r} fill="none" stroke="white" strokeWidth="0.3" opacity="0.8" />
                      </g>
                    );
                  })}
                  
                  {/* Legend */}
                  <g transform="translate(75, 3)">
                    <text x="0" y="0" fontSize="3" fill="#475569" fontWeight="600">Size = Relevance</text>
                    <circle cx="2" cy="3" r="1.5" fill="#3b82f6" />
                    <text x="5" y="1" fontSize="3" fill="#64748b">High</text>
                    <circle cx="2" cy="6" r="1" fill="#8b5cf6" />
                    <text x="5" y="4" fontSize="3" fill="#64748b">Med</text>
                    <circle cx="2" cy="8.5" r="0.7" fill="#06b6d4" />
                    <text x="5" y="6.5" fontSize="3" fill="#64748b">Low</text>
                  </g>
                </svg>
                
                {/* Tooltip */}
                {hoveredTrend && (
                  <div 
                    className="fixed bg-slate-900 text-white text-xs px-2 py-1 rounded pointer-events-none z-50"
                    style={{
                      left: tooltipPosition.x + 10,
                      top: tooltipPosition.y - 30
                    }}
                  >
                    {hoveredTrend}
                    <div className="absolute top-full left-0 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
                  </div>
                )}
              </div>
              
              {/* Text Grid Version (commented out) */}
              {/*
              <div className="space-y-3">
                {liveSpotlights.slice(0, 4).map((trend, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                    <div className="flex-1">
                      <div className="font-medium text-sm text-slate-900">{trend.title}</div>
                      <div className="text-xs text-slate-500 mt-1">{trend.category}</div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{trend.scores.novelty}</div>
                        <div className="text-xs text-slate-500">Novelty</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-emerald-600">{trend.scores.velocity}</div>
                        <div className="text-xs text-slate-500">Velocity</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">{trend.scores.relevance}</div>
                        <div className="text-xs text-slate-500">Relevance</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              */}
            </Panel>
          </main>
        </div>
      </div>

      {/* Trend Detail Modal */}
      {openTrend && (
        <Modal onClose={() => setOpenTrend(null)} title={openTrend.title}>
          <div className="space-y-4">
            <div>
              <div className="text-sm font-semibold text-slate-500">Category</div>
              <div className="text-lg font-medium">{openTrend.category}</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-500">Summary</div>
              <div className="space-y-2">
                <div><span className="font-semibold">Driver:</span> {openTrend.summary.driver}</div>
                <div><span className="font-semibold">Tension:</span> {openTrend.summary.tension}</div>
                <div><span className="font-semibold">Behaviour:</span> {openTrend.summary.behaviour}</div>
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-500">Scores</div>
              <div className="grid grid-cols-2 gap-2">
                <ScoreRow label="Novelty" value={openTrend.scores.novelty} />
                <ScoreRow label="Velocity" value={openTrend.scores.velocity} />
                <ScoreRow label="Relevance" value={openTrend.scores.relevance} />
                <ScoreRow label="Confidence" value={openTrend.scores.confidence} />
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-500">Tags</div>
              <div className="flex flex-wrap gap-2">
                {openTrend.tags.map((tag: string) => (
                  <span key={tag} className="px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-600">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Radar Modal */}
      {openRadar && (
        <Modal onClose={() => setOpenRadar(false)} title="Interactive Trend Radar">
          <div className="w-800 h-600">
            <BubbleRadar trends={liveSpotlights} />
          </div>
        </Modal>
      )}
    </div>
  );
}
