import React, { useState, useEffect } from 'react';
import { TrendsData } from './types';
import TrendCard from './components/TrendCard';
import LoadingScreen from './components/LoadingScreen';
import ErrorScreen from './components/ErrorScreen';

const CARD_ROTATION_SEC = parseInt(import.meta.env.VITE_CARD_ROTATION_SEC || '12');
const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

const DEMO_DATA: TrendsData = {
  generatedAt: new Date().toISOString(),
  sourceSummary: {
    totalFetched: 8,
    afterDedupe: 8,
    sources: ["Marketing Brew", "Creative Review", "Adweek", "Campaign Live"]
  },
  trends: [
    {
      id: "demo-1",
      title: "AI-Powered Personalization Reaches New Heights",
      url: "https://example.com/ai-personalization",
      source: "Marketing Brew",
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      summary: "Machine learning algorithms enable hyper-personalized customer experiences with 73% improvement in conversion rates.",
      category: "AI/ML",
      tags: ["AI", "personalization", "marketing", "conversion"],
      scores: { novelty: 85, velocity: 78, relevance: 92, confidence: 88, total: 85.8 },
      whyItMatters: "Brands can now deliver truly individualized experiences at scale, transforming customer relationships.",
      brandAngles: ["Personalized campaigns", "Customer data utilization", "Competitive differentiation"],
      exampleUseCases: ["Dynamic website content", "Personalized email campaigns", "Custom product recommendations"],
      creative: {
        shortCardCopy: "AI Personalization Revolution",
        imagePrompt: "Futuristic AI interface with personalized customer data flowing through neural networks",
        altText: "AI-powered personalization dashboard",
        podcastSnippet: "AI personalization is changing how brands connect with customers, offering unprecedented levels of customization."
      },
      viz: { size: 8, intensity: 1.5, colorHint: "hsl(210, 70%, 60%)" }
    },
    {
      id: "demo-2", 
      title: "Sustainable Packaging Revolution Transforms E-commerce",
      url: "https://example.com/sustainable-packaging",
      source: "Creative Review",
      publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      summary: "Biodegradable materials and minimal design reshape brand packaging strategies.",
      category: "Sustainability",
      tags: ["sustainability", "packaging", "design", "ecommerce"],
      scores: { novelty: 75, velocity: 82, relevance: 88, confidence: 85, total: 82.5 },
      whyItMatters: "Environmental consciousness drives purchasing decisions, making sustainable packaging a competitive necessity.",
      brandAngles: ["Environmental leadership", "Cost reduction", "Consumer appeal"],
      exampleUseCases: ["Biodegradable shipping materials", "Minimal packaging design", "Circular economy initiatives"],
      creative: {
        shortCardCopy: "Sustainable Packaging Takes Over",
        imagePrompt: "Elegant eco-friendly packaging made from natural materials in a modern setting",
        altText: "Sustainable product packaging examples",
        podcastSnippet: "The packaging revolution is here - brands are discovering that sustainable design isn't just good for the planet, it's good for business."
      },
      viz: { size: 7, intensity: 1.3, colorHint: "hsl(120, 60%, 50%)" }
    }
  ]
};

function App() {
  const [trendsData, setTrendsData] = useState<TrendsData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isDemoMode = new URLSearchParams(window.location.search).has('demo');

  useEffect(() => {
    const fetchTrends = async () => {
      if (isDemoMode) {
        setTrendsData(DEMO_DATA);
        setLoading(false);
        return;
      }

      try {
        console.log('🔄 Fetching trends from local N8N data...');
        const response = await fetch('/trends/latest.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: TrendsData = await response.json();
        console.log('✅ Successfully loaded trends data:', data);
        console.log('📊 Trends count:', data.trends?.length);
        setTrendsData(data);
        setError(null);
      } catch (err) {
        console.error('❌ Failed to fetch trends:', err);
        console.log('🔄 Falling back to demo data');
        setError('Failed to load trends data');
        setTrendsData(DEMO_DATA);
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
    const interval = setInterval(fetchTrends, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isDemoMode]);

  useEffect(() => {
    if (!trendsData?.trends.length) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % trendsData.trends.length);
    }, CARD_ROTATION_SEC * 1000);
    
    return () => clearInterval(interval);
  }, [trendsData]);

  if (loading) return <LoadingScreen />;
  if (error && !trendsData) return <ErrorScreen message={error} />;
  if (!trendsData?.trends.length) return <ErrorScreen message="No trends available" />;

  const currentTrend = trendsData.trends[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-slate-800 to-black flex items-center justify-center overflow-hidden">
      <div className="w-full max-w-[95vw]">
        <TrendCard 
          trend={currentTrend} 
          index={currentIndex}
          total={trendsData.trends.length}
          generatedAt={trendsData.generatedAt}
        />
        
        {/* Modern Progress indicators */}
        <div className="fixed bottom-12 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {trendsData.trends.map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all duration-500 ${
                index === currentIndex 
                  ? 'bg-blue-400 w-16' 
                  : 'bg-white/20 w-8'
              }`}
            />
          ))}
        </div>

        {/* Modern Status indicator */}
        <div className="fixed top-8 right-8 backdrop-blur-sm bg-black/30 rounded-xl px-4 py-2 text-white/70 text-lg font-medium">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isDemoMode ? 'bg-yellow-400' : 'bg-green-400'}`} />
            <span>{isDemoMode ? 'DEMO' : 'LIVE'}</span>
            <span className="text-white/50">•</span>
            <span>{trendsData.trends.length} trends</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;