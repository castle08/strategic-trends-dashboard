import { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { TrendsData, TrendItem } from './types';
import Scene from './components/Scene';
import UI from './components/UI';
import LoadingScreen from './components/LoadingScreen';
import ErrorBoundary from './components/ErrorBoundary';

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
        console.log('🔄 Fetching trends from /api/trends...');
        const response = await fetch('/api/trends');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: TrendsData = await response.json();
        console.log('✅ Successfully loaded trends data:', data);
        console.log('📊 Sources loaded:', data.sourceSummary?.sources);
        console.log('🎯 Trends count:', data.trends?.length);
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

  if (loading) return <LoadingScreen />;

  return (
    <ErrorBoundary>
      <div className="w-screen h-screen bg-gradient-to-b from-gray-900 via-slate-800 to-black">
        <Canvas
          camera={{ position: [0, 0, 50], fov: 60 }}
          gl={{ antialias: true, alpha: false }}
        >
          <Suspense fallback={null}>
            <Scene
              trends={trendsData?.trends || []}
              onTrendSelect={setSelectedTrend}
              selectedTrend={selectedTrend}
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
      </div>
    </ErrorBoundary>
  );
}

export default App;