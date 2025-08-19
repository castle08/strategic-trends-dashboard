import { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { TrendsData, TrendItem } from './types';
import Scene from './components/Scene';
import UI from './components/UI';
import LoadingScreen from './components/LoadingScreen';
import ErrorBoundary from './components/ErrorBoundary';
import TrendCard from './components/TrendCard';
import ErrorScreen from './components/ErrorScreen';
import SimpleTrendTest from './components/SimpleTrendTest';
import Dashboard from './components/Dashboard';
import TrendsWallV2 from './components/TrendsWallV2';
import ImprovedGestureController from './components/ImprovedGestureController';
import GestureTestEnvironment from './components/GestureTestEnvironment';
import { TrendItem as DashboardTrendItem } from './data/dummy-dashboard-data';

const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

// Transform API trends to Dashboard format
const transformTrendsForDashboard = (apiTrends: TrendItem[]): DashboardTrendItem[] => {
  return apiTrends.map(trend => ({
    id: trend.id,
    title: trend.title,
    summary: trend.summary,
    category: trend.category,
    confidence: trend.scores?.confidence || 85,
    signals: trend.tags || [],
    generatedAt: trend.publishedAt || new Date().toISOString(),
    takeaway: trend.whyItMatters,
    drivers: trend.brandAngles,
    tensions: [], // Not available in API data
    behaviors: trend.exampleUseCases,
    aiInsights: [trend.whyItMatters], // Use whyItMatters as AI insight
    audienceImpact: [], // Not available in API data
    industryImpact: [] // Not available in API data
  }));
};

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
      title: "Sustainable Packaging Revolution",
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
    },
    {
      id: "demo-3",
      title: "Voice Commerce Integration Surges",
      url: "https://example.com/voice-commerce",
      source: "Adweek",
      publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      summary: "Voice-activated shopping experiences become mainstream with 40% increase in smart speaker sales.",
      category: "E-commerce",
      tags: ["voice", "commerce", "ai", "speakers"],
      scores: { novelty: 70, velocity: 88, relevance: 85, confidence: 82, total: 81.3 },
      whyItMatters: "Voice interfaces create frictionless shopping experiences, transforming how consumers discover and buy products.",
      brandAngles: ["Voice SEO optimization", "Conversational commerce", "Smart home integration"],
      exampleUseCases: ["Voice-activated reordering", "Audio product discovery", "Smart speaker integration"],
      creative: {
        shortCardCopy: "Voice Commerce Revolution",
        imagePrompt: "Modern smart speaker with voice waveforms and shopping cart icons floating around it",
        altText: "Voice commerce technology visualization",
        podcastSnippet: "Voice commerce is reshaping retail - consumers can now shop hands-free, creating new opportunities for brand engagement."
      },
      viz: { size: 6, intensity: 1.7, colorHint: "hsl(280, 65%, 55%)" }
    },
    {
      id: "demo-4",
      title: "Gen Z Micro-Influencer Trust",
      url: "https://example.com/gen-z-micro-influencers",
      source: "Campaign Live",
      publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      summary: "Young consumers increasingly trust smaller, niche content creators over celebrity endorsements.",
      category: "Social Media",
      tags: ["genz", "influencers", "trust", "authenticity"],
      scores: { novelty: 65, velocity: 75, relevance: 90, confidence: 88, total: 79.5 },
      whyItMatters: "Authenticity trumps reach as Gen Z values genuine recommendations from relatable creators.",
      brandAngles: ["Authentic partnerships", "Niche community building", "Cost-effective campaigns"],
      exampleUseCases: ["Micro-influencer campaigns", "Community-driven content", "Authentic product reviews"],
      creative: {
        shortCardCopy: "Micro-Influencer Trust Factor",
        imagePrompt: "Diverse group of young content creators authentically engaging with products in natural settings",
        altText: "Authentic micro-influencer content creation",
        podcastSnippet: "Gen Z is changing influencer marketing - they're looking for authenticity over celebrity status, creating opportunities for smaller creators."
      },
      viz: { size: 5, intensity: 1.2, colorHint: "hsl(340, 70%, 60%)" }
    },
    {
      id: "demo-5",
      title: "AR Try-On Technology Impact",
      url: "https://example.com/ar-try-on",
      source: "Marketing Brew",
      publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
      summary: "Augmented reality fitting solutions reduce return rates by 35% in fashion and beauty.",
      category: "Technology",
      tags: ["AR", "ecommerce", "fashion", "beauty"],
      scores: { novelty: 80, velocity: 72, relevance: 86, confidence: 85, total: 80.8 },
      whyItMatters: "AR technology solves the fit problem in online shopping, improving customer satisfaction and reducing costs.",
      brandAngles: ["Reduced returns", "Enhanced experience", "Technology leadership"],
      exampleUseCases: ["Virtual try-on apps", "AR mirrors", "Size recommendation systems"],
      creative: {
        shortCardCopy: "AR Try-On Transformation",
        imagePrompt: "Person using smartphone AR to try on virtual sunglasses with digital fitting overlay",
        altText: "Augmented reality try-on technology in use",
        podcastSnippet: "AR try-on technology is solving one of e-commerce's biggest problems - customers can now see how products look before buying."
      },
      viz: { size: 7, intensity: 1.4, colorHint: "hsl(180, 80%, 50%)" }
    },
    {
      id: "demo-6", 
      title: "Data Privacy UX Evolution",
      url: "https://example.com/privacy-ux",
      source: "Creative Review",
      publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      summary: "Designers create transparent, user-friendly data consent experiences, turning compliance into advantage.",
      category: "Design",
      tags: ["privacy", "ux", "compliance", "transparency"],
      scores: { novelty: 68, velocity: 70, relevance: 82, confidence: 80, total: 75.0 },
      whyItMatters: "Privacy-first design builds trust while meeting regulatory requirements, creating competitive differentiation.",
      brandAngles: ["Trust building", "Compliance advantage", "User empowerment"],
      exampleUseCases: ["Consent management platforms", "Privacy-focused onboarding", "Transparent data usage"],
      creative: {
        shortCardCopy: "Privacy UX Revolution",
        imagePrompt: "Clean, transparent interface showing data privacy controls with clear, friendly iconography",
        altText: "User-friendly privacy control interface",
        podcastSnippet: "Privacy UX is evolving - brands are turning regulatory compliance into a competitive advantage through better design."
      },
      viz: { size: 4, intensity: 1.1, colorHint: "hsl(45, 75%, 55%)" }
    }
  ]
};

function App() {
  const [trendsData, setTrendsData] = useState<TrendsData | null>(null);
  const [selectedTrend, setSelectedTrend] = useState<TrendItem | null>(null);
  const [handPosition, setHandPosition] = useState<{ x: number; y: number; z: number } | null>(null);
  const [controlsActive, setControlsActive] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiveData, setIsLiveData] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const isDemoMode = urlParams.has('demo');
  const isScreensMode = urlParams.has('screens') || urlParams.get('view') === 'screens';
  const isTestMode = urlParams.has('test');
  const isGestureTest = urlParams.has('gesture-test');
  const gestureTestMode = urlParams.get('gesture-mode') as 'hand-presence' | 'fist-activation' | 'keyboard-mouse' | 'voice' || 'hand-presence';

  useEffect(() => {
    const fetchTrends = async () => {
      setLoading(true);
      setError(null);
      try {
        // Always use the live API endpoint since CORS is now fixed
        const apiUrl = 'https://trends-dashboard-six.vercel.app/api/trends-individual';
        console.log('🔄 Fetching trends from:', apiUrl);
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Debug: Log the received data
        console.log('🔍 Received trends data:', data);
        console.log('📊 Number of trends:', data.trends?.length || 0);
        if (data.trends && data.trends.length > 0) {
          console.log('🔍 First trend creative object:', data.trends[0].creative);
          console.log('🔍 Has imageUrl in first trend:', !!data.trends[0].creative?.imageUrl);
          console.log('🔍 First trend whyItMatters:', data.trends[0].whyItMatters);
          console.log('🔍 First trend scores:', data.trends[0].scores);
          
          // Compare trends with and without images
          const trendsWithImages = data.trends.filter((t: TrendItem) => t.creative?.imageUrl);
          const trendsWithoutImages = data.trends.filter((t: TrendItem) => !t.creative?.imageUrl);
          
          console.log('🔍 Trends WITH images:', trendsWithImages.length);
          if (trendsWithImages.length > 0) {
            console.log('🔍 Sample trend WITH image:', trendsWithImages[0]);
          }
          
          console.log('🔍 Trends WITHOUT images:', trendsWithoutImages.length);
          if (trendsWithoutImages.length > 0) {
            console.log('🔍 Sample trend WITHOUT image:', trendsWithoutImages[0]);
          }
        }
        
        setTrendsData(data);
        setIsLiveData(true);
      } catch (err) {
        console.error('❌ Error fetching trends:', err);
        console.log('🔄 Falling back to demo data');
        setError('not-live'); // Use a simple flag instead of error message
        setTrendsData(DEMO_DATA);
        setIsLiveData(false);
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
    // Removed automatic refresh for now - uncomment below to re-enable
    // const interval = setInterval(fetchTrends, 30000); // Refresh every 30 seconds
    // return () => clearInterval(interval);
  }, []);

  // Card rotation for screens mode
  useEffect(() => {
    if (!isScreensMode || !trendsData?.trends.length) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % trendsData.trends.length);
    }, 15 * 1000); // 15 seconds per card
    
    return () => clearInterval(interval);
  }, [trendsData, isScreensMode]);

  if (loading) return <LoadingScreen />;
  if (error && error !== 'not-live' && !trendsData) return <ErrorScreen message={error} />;
  if (!trendsData?.trends.length) return <ErrorScreen message="No trends available" />;

  // Gesture Test Mode - Dedicated gesture testing environment
  if (isGestureTest) {
    return <GestureTestEnvironment controlMode={gestureTestMode} />;
  }

  // Test Mode - Simple 3D Test
  if (isTestMode) {
    return <SimpleTrendTest trendsData={trendsData} />;
  }

  // Screens Mode - TV Display
  if (isScreensMode) {
    const currentTrend = trendsData.trends[currentIndex];
    
    return (
      <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden relative">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
          style={{ backgroundImage: 'url(/video-mask.svg)' }}
        />
        <div className="w-full max-w-[95vw] relative z-10">
          <TrendCard 
            trend={currentTrend} 
            index={currentIndex}
            total={trendsData.trends.length}
            generatedAt={trendsData.generatedAt}
          />
          
          {/* Progress indicators */}
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

          {/* Status indicator */}
          <div className="fixed top-8 right-8 backdrop-blur-sm bg-black/30 rounded-xl px-4 py-2 text-white/70 text-lg font-medium">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${error === 'not-live' ? 'bg-orange-400' : isDemoMode ? 'bg-yellow-400' : 'bg-green-400'}`} />
              <span>{error === 'not-live' ? 'NOT LIVE' : isDemoMode ? 'DEMO' : 'LIVE'}</span>
              <span className="text-white/50">•</span>
              <span>{trendsData.trends.length} trends</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main App with Routing
  return (
    <Router>
      <Routes>
        {/* Dashboard Route */}
        <Route 
          path="/dash" 
          element={
            <div className="min-h-screen bg-white">
              <div className={`fixed top-4 right-4 z-50 px-3 py-1 rounded-full text-sm font-medium ${isLiveData ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {isLiveData ? '🟢 LIVE DATA' : '🔴 DEMO DATA'}
              </div>
              <Dashboard trends={transformTrendsForDashboard(trendsData.trends)} isLoading={loading} />
            </div>
          } 
        />
        
        {/* Dashboard V2 Route */}
        <Route 
          path="/dash-v2" 
          element={
            <div className="min-h-screen bg-white">
              <div className={`fixed top-4 right-4 z-50 px-3 py-1 rounded-full text-sm font-medium ${isLiveData ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {isLiveData ? '🟢 LIVE DATA' : '🔴 DEMO DATA'}
              </div>
              <TrendsWallV2 />
            </div>
          } 
        />
        
        {/* Default 3D Dashboard Route */}
        <Route 
          path="/" 
          element={
            <ErrorBoundary>
              <div className="w-screen h-screen bg-gradient-to-b from-gray-900 via-slate-800 to-black relative">
                <Canvas
                  camera={{ position: [0, 0, 60], fov: 60 }}
                  gl={{ antialias: true, alpha: false }}
                  style={{ zIndex: 1 }}
                >
                  <Suspense fallback={null}>
                    <Scene
                      trends={trendsData?.trends || []}
                      onTrendSelect={setSelectedTrend}
                      selectedTrend={selectedTrend}
                      handPosition={handPosition}
                      controlsActive={controlsActive}
                    />
                  </Suspense>
                </Canvas>
                
                <UI
                  trendsData={trendsData}
                  selectedTrend={selectedTrend}
                  onTrendSelect={setSelectedTrend}
                  error={error}
                  isDemoMode={isDemoMode}
                />
                
                <ImprovedGestureController
                  onHandMove={(x, y, z) => {
                    if (x === 0 && y === 0 && z === 0) {
                      // Reset hand position when no hand detected
                      setHandPosition(null);
                    } else {
                      setHandPosition({ x, y, z });
                    }
                  }}
                  onGestureDetected={(gesture) => {
                    console.log('👆 Gesture detected:', gesture);
                  }}
                  onControlActivated={(activated) => {
                    console.log('🎯 Controls activated:', activated);
                    setControlsActive(activated);
                  }}
                  mode="hand-presence"
                />
              </div>
            </ErrorBoundary>
          } 
        />
        
        {/* Catch all other routes and redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;