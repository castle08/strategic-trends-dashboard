import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TrendItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  confidence: number;
  signals: string[];
  generatedAt: string;
  takeaway?: string;
  drivers?: string[];
  tensions?: string[];
  behaviors?: string[];
  aiInsights?: string[];
  audienceImpact?: string[];
  industryImpact?: string[];
}

interface DashboardProps {
  trends: TrendItem[];
  isLoading: boolean;
}

// Mock data based on the specification
const dashboardMock = {
  filters: {
    categories: ["Creativity","Sustainability","Technology","AI","Consumer Behaviour"],
    industries: ["Retail","CPG","Tech","Finance","Entertainment"],
    audiences: ["Gen Z Urban","Millennial Families","Value Seekers 45+"]
  },
  stateOfWorld: {
    thesis: "Trust-first AI becomes a default consumer expectation.",
    velocity: [12,14,18,22,28,34,41,43],
    movers: [
      {label:"Programmable Stores", delta:"+", strength:2},
      {label:"Refill Defaults", delta:"+", strength:1},
      {label:"Tokenised Loyalty", delta:"+", strength:2}
    ]
  },
  aiInsight: {
    title: "Ambient AI > app-switching",
    bullets: [
      "People expect help without surveillance.",
      "Micro-interactions reduce friction and attrition.",
      "Personalisation must be privacy-first."
    ]
  },
  threats: [
    {brand:"Nike", move:"AI product recommendations in flagship app", urgency:"High", action:"Fast-track PDP personalisation; A/B privacy-first profiles"},
    {brand:"Coca-Cola", move:"Voice-order commerce with Alexa bundles", urgency:"Medium", action:"Ship voice-order SKUs; test promo scripts"},
    {brand:"Amazon", move:"One-click checkout in 12 markets", urgency:"High", action:"Reduce checkout steps to 2; enable stored cart + pay-link flows"}
  ],
  opportunities: [
    {
      title:"Sustainable Packaging Becomes a Purchase Shortcut",
      level:"High",
      whyNow:"'Low-waste' labels accelerate decisions at shelf and in PDP.",
      signals:["Refill mentions +65% YoY (Jul 2025)","Refill lane pilots tied to loyalty (Aug 2025)"],
      play:"Add 'Refill Fast Lane' + waste-saved badges to PDP & receipts"
    },
    {
      title:"Micro-Influencer Networks Win in Niche Conversion",
      level:"Medium",
      whyNow:"Peer-sized creators drive trust; live shopping boosts basket size.",
      signals:["Mid-tier ER ~3× celebrity (Jul 2025)","Live shopping AOV +18% (Aug 2025)"],
      play:"50-creator pool; floor CPM + bonus for 7-day basket adds"
    }
  ],
  spotlights: [
    {
      title:"Stores Become Programmable Media",
      category:"Creativity",
      summary: {
        driver:"Retail media + game-native shoppers normalise interactive spaces.",
        tension:"People want reasons to visit; gimmicky tech feels noisy.",
        behaviour:"Shoppers treat stores like episodic content with quests/unlocks."
      },
      scores:{novelty:72, velocity:63, relevance:84, confidence:68},
      tags:["retail media","AR quests","episodic merchandising"]
    },
    {
      title:"Product Passports Unlock Use-Phase Value",
      category:"Sustainability",
      summary: {
        driver:"Cost-of-living + regulation push durability and transparency.",
        tension:"People want 'better' but can't afford premiums.",
        behaviour:"Repair, refill, and official resale become weekly habits."
      },
      scores:{novelty:58, velocity:69, relevance:90, confidence:78},
      tags:["digital ID","brand resale","repair economy"]
    }
  ],
  takeaways: [
    "Prioritise privacy-first personalisation this quarter.",
    "Pilot refill lanes tied to loyalty in 3 stores.",
    "Stand up a 50-creator mid-tier pool with conversion bonuses.",
    "Plan Q4 'content season' for hero stores (quests + watch-to-shop)."
  ],
  liveSignals: [
    "Westfield AR quests expand (Jul 2025)",
    "EU DPP pilots broaden to mid-market (Jul 2025)",
    "TikTok Shopping affiliate policy update (Aug 2025)"
  ]
};

const Dashboard: React.FC<DashboardProps> = ({ trends, isLoading }) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([]);
  const [promptText, setPromptText] = useState('');
  const [isListening, setIsListening] = useState(false);

  const handleVoicePrompt = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      setPromptText("What's the biggest threat to my business right now?");
    }, 2000);
  };

  const toggleFilter = (filterType: string, value: string) => {
    switch (filterType) {
      case 'category':
        setSelectedCategories(prev => 
          prev.includes(value) 
            ? prev.filter(c => c !== value)
            : [...prev, value]
        );
        break;
      case 'industry':
        setSelectedIndustries(prev => 
          prev.includes(value) 
            ? prev.filter(i => i !== value)
            : [...prev, value]
        );
        break;
      case 'audience':
        setSelectedAudiences(prev => 
          prev.includes(value) 
            ? prev.filter(a => a !== value)
            : [...prev, value]
        );
        break;
    }
  };

  const FilterGroup = ({ title, chips, filterType }: { title: string, chips: string[], filterType: string }) => (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{title}</h3>
      <div className="flex flex-wrap gap-1">
        {chips.map((chip) => {
          const isSelected = 
            (filterType === 'category' && selectedCategories.includes(chip)) ||
            (filterType === 'industry' && selectedIndustries.includes(chip)) ||
            (filterType === 'audience' && selectedAudiences.includes(chip));
          
          return (
            <button
              key={chip}
              onClick={() => toggleFilter(filterType, chip)}
              className={`px-2 py-1 text-xs rounded-full transition-colors ${
                isSelected 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {chip}
            </button>
          );
        })}
      </div>
    </div>
  );

  const Panel = ({ children, className = "", accentColor = "" }: { children: React.ReactNode, className?: string, accentColor?: string }) => (
    <section className={`rounded-2xl border border-slate-200 shadow-sm bg-white ${className}`}>
      {accentColor && (
        <div className={`h-1 rounded-t-2xl ${accentColor}`} />
      )}
      <div className="p-5">{children}</div>
    </section>
  );

  const LogoSmall = () => (
    <div className="flex items-center space-x-2">
      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-sm">T</span>
      </div>
      <span className="text-sm font-semibold text-gray-800">Trends Wall</span>
    </div>
  );

  const CommandBar = () => (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="text"
          placeholder="Ask the wall..."
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleVoicePrompt}
          className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded ${
            isListening ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          🎤
        </button>
      </div>
      <div className="text-xs text-gray-500">
        Try: /search, /discover, /compare
      </div>
    </div>
  );

  const QuickActions = () => (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Quick Actions</h3>
      <div className="space-y-1">
        {['/search', '/discover', '/compare'].map((action) => (
          <button
            key={action}
            className="w-full text-left px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
          >
            {action}
          </button>
        ))}
      </div>
    </div>
  );

  const CardSoW = () => {
    const chartData = {
      labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'],
      datasets: [{
        label: 'Velocity',
        data: dashboardMock.stateOfWorld.velocity,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { display: false },
        y: { display: false }
      }
    };

    return (
      <Panel accentColor="bg-gradient-to-r from-[#5b90d4] via-[#4eccc9] to-[#bde4ff]">
        <h3 className="text-lg font-bold text-gray-800 mb-3">🌍 State of the World</h3>
        <p className="text-sm text-gray-700 mb-4">{dashboardMock.stateOfWorld.thesis}</p>
        
        <div className="h-16 mb-4">
          <Line data={chartData} options={chartOptions} />
        </div>
        
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-600 uppercase">Top Movers</h4>
          <div className="flex flex-wrap gap-2">
            {dashboardMock.stateOfWorld.movers.map((mover, index) => (
              <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                {mover.label} {mover.delta}{mover.strength}
              </span>
            ))}
          </div>
        </div>
      </Panel>
    );
  };

  const CardAIInsight = () => (
    <Panel accentColor="bg-gradient-to-r from-[#8b5cf6] via-[#a78bfa] to-[#c4b5fd]">
      <h3 className="text-base font-bold text-gray-800 mb-2">🤖 AI Insight</h3>
      <h4 className="text-sm font-semibold text-gray-700 mb-3">{dashboardMock.aiInsight.title}</h4>
      <div className="space-y-2">
        {dashboardMock.aiInsight.bullets.map((bullet, index) => (
          <div key={index} className="flex items-start space-x-2">
            <div className="w-1 h-1 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-xs text-gray-700">{bullet}</p>
          </div>
        ))}
      </div>
    </Panel>
  );

  const CardThreats = () => (
    <Panel accentColor="bg-gradient-to-r from-[#dc2626] via-[#ef4444] to-[#f87171]">
      <h3 className="text-base font-bold text-gray-800 mb-3">🚨 Competitive Threats</h3>
      <div className="space-y-3">
        {dashboardMock.threats.map((threat, index) => (
          <div key={index} className="p-3 bg-red-50 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-sm text-red-800">{threat.brand}</span>
                  <span className="text-red-600">→</span>
                  <span className="text-sm text-red-700">{threat.move}</span>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full font-medium ml-2 ${
                threat.urgency === 'High' 
                  ? 'bg-red-200 text-red-800' 
                  : 'bg-orange-200 text-orange-800'
              }`}>
                {threat.urgency}
              </span>
            </div>
            <p className="text-xs text-red-700">
              <span className="font-medium">Action:</span> {threat.action}
            </p>
          </div>
        ))}
      </div>
    </Panel>
  );

  const CardOpportunities = () => (
    <Panel accentColor="bg-gradient-to-r from-[#059669] via-[#10b981] to-[#6ee7b7]">
      <h3 className="text-base font-bold text-gray-800 mb-3">💡 Brand Opportunities</h3>
      <div className="space-y-3">
        {dashboardMock.opportunities.map((opp, index) => (
          <div key={index} className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-sm text-green-800 flex-1">{opp.title}</h4>
              <span className={`px-2 py-1 text-xs rounded-full font-medium ml-2 ${
                opp.level === 'High' 
                  ? 'bg-green-200 text-green-800' 
                  : 'bg-blue-200 text-blue-800'
              }`}>
                {opp.level}
              </span>
            </div>
            <p className="text-xs text-green-700 mb-2">
              <span className="font-medium">Why now:</span> {opp.whyNow}
            </p>
            <div className="space-y-1 mb-2">
              {opp.signals.map((signal, sigIndex) => (
                <p key={sigIndex} className="text-xs text-green-600">• {signal}</p>
              ))}
            </div>
            <p className="text-xs text-green-700">
              <span className="font-medium">Play:</span> {opp.play}
            </p>
          </div>
        ))}
      </div>
    </Panel>
  );

  const CardTrendSpotlights = () => {
    const renderScoreMeter = (label: string, score: number) => {
      const getColor = (score: number) => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
      };

      return (
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-600 w-16">{label}</span>
          <div className="flex-1 bg-gray-200 rounded-full h-1">
            <div 
              className={`h-1 rounded-full ${getColor(score)}`}
              style={{ width: `${score}%` }}
            ></div>
          </div>
          <span className="text-xs font-medium text-gray-700 w-6">{score}</span>
        </div>
      );
    };

    return (
      <Panel accentColor="bg-gradient-to-r from-[#803bff] via-[#ab81fa] to-[#8ec2ef]">
        <h3 className="text-base font-bold text-gray-800 mb-3">🔍 Trend Spotlights</h3>
        <div className="space-y-4">
          {dashboardMock.spotlights.map((trend, index) => (
            <div key={index} className="p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm text-purple-800 flex-1">{trend.title}</h4>
                <span className="px-2 py-1 bg-purple-200 text-purple-800 text-xs rounded-full font-medium ml-2">
                  {trend.category}
                </span>
              </div>
              
              <div className="space-y-1 mb-3">
                <p className="text-xs text-purple-700">
                  <span className="font-medium">Driver:</span> {trend.summary.driver}
                </p>
                <p className="text-xs text-purple-700">
                  <span className="font-medium">Tension:</span> {trend.summary.tension}
                </p>
                <p className="text-xs text-purple-700">
                  <span className="font-medium">Behaviour:</span> {trend.summary.behaviour}
                </p>
              </div>
              
              <div className="space-y-1 mb-3">
                {renderScoreMeter("Novelty", trend.scores.novelty)}
                {renderScoreMeter("Velocity", trend.scores.velocity)}
                {renderScoreMeter("Relevance", trend.scores.relevance)}
                {renderScoreMeter("Confidence", trend.scores.confidence)}
              </div>
              
              <div className="flex flex-wrap gap-1">
                {trend.tags.map((tag, tagIndex) => (
                  <span key={tagIndex} className="text-xs bg-purple-200 text-purple-700 px-2 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    );
  };

  const CardTakeaways = () => (
    <Panel accentColor="bg-gradient-to-r from-[#f59e0b] via-[#fbbf24] to-[#fde68a]">
      <h3 className="text-base font-bold text-gray-800 mb-3">📋 Key Takeaways</h3>
      <div className="space-y-2">
        {dashboardMock.takeaways.map((takeaway, index) => (
          <div key={index} className="flex items-start space-x-2">
            <div className="w-1 h-1 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-xs text-gray-700">{takeaway}</p>
          </div>
        ))}
      </div>
    </Panel>
  );

  const CardRadar = () => (
    <Panel accentColor="bg-gradient-to-r from-[#06b6d4] via-[#22d3ee] to-[#67e8f9]">
      <h3 className="text-base font-bold text-gray-800 mb-3">📊 Trend Radar</h3>
      <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
        <p className="text-sm text-gray-500">Bubble map visualization</p>
      </div>
      <p className="text-xs text-gray-600 mt-2">
        Bubbles by relevance (size) × velocity (y), color by category
      </p>
    </Panel>
  );

  const CardSignals = () => (
    <Panel accentColor="bg-gradient-to-r from-[#ec4899] via-[#f472b6] to-[#f9a8d4]">
      <h3 className="text-base font-bold text-gray-800 mb-3">📡 Live Signals</h3>
      <div className="space-y-2">
        {dashboardMock.liveSignals.map((signal, index) => (
          <div key={index} className="p-2 bg-pink-50 rounded-lg">
            <p className="text-xs text-pink-700">{signal}</p>
          </div>
        ))}
      </div>
    </Panel>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[1440px] px-4 py-6 grid grid-cols-12 gap-4">
        {/* Left Rail */}
        <aside className="col-span-3 space-y-4">
          <LogoSmall />
          <CommandBar />
          <FilterGroup title="Categories" chips={dashboardMock.filters.categories} filterType="category" />
          <FilterGroup title="Industries" chips={dashboardMock.filters.industries} filterType="industry" />
          <FilterGroup title="Audiences" chips={dashboardMock.filters.audiences} filterType="audience" />
          <QuickActions />
        </aside>

        {/* Main Grid */}
        <main className="col-span-9 grid grid-cols-12 gap-4">
          <div className="col-span-8">
            <CardSoW />
          </div>
          <div className="col-span-4">
            <CardAIInsight />
          </div>
          <div className="col-span-6">
            <CardThreats />
          </div>
          <div className="col-span-6">
            <CardOpportunities />
          </div>
          <div className="col-span-6">
            <CardTrendSpotlights />
          </div>
          <div className="col-span-6">
            <CardTakeaways />
          </div>
          <div className="col-span-8">
            <CardRadar />
          </div>
          <div className="col-span-4">
            <CardSignals />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
