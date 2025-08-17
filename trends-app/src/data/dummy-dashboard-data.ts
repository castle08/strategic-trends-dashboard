export interface TrendItem {
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

export const dummyTrends: TrendItem[] = [
  {
    id: "1",
    title: "AI-Powered Personalization at Scale",
    summary: "Brands are leveraging AI to create hyper-personalized experiences that adapt in real-time to individual consumer behavior patterns.",
    category: "Technology",
    confidence: 92,
    signals: [
      "Netflix's new AI recommendation engine shows 40% higher engagement",
      "Spotify's personalized playlists now use real-time mood detection",
      "Amazon's dynamic pricing algorithm adjusts prices 2.4 million times per day"
    ],
    generatedAt: "2025-01-15T10:30:00Z",
    takeaway: "Personalization is no longer a nice-to-have, it's the new baseline for consumer engagement.",
    drivers: [
      "Rising consumer expectations for relevant experiences",
      "Advancements in real-time data processing",
      "Competitive pressure to differentiate"
    ],
    tensions: [
      "Privacy concerns vs. personalization benefits",
      "Cost of implementation vs. ROI expectations",
      "Technical complexity vs. user experience simplicity"
    ],
    behaviors: [
      "Consumers expect brands to 'know' them instantly",
      "Abandonment rates drop 60% with personalized experiences",
      "Brand loyalty increases when personalization feels authentic"
    ],
    aiInsights: [
      "Companies implementing AI personalization see 25% higher customer lifetime value",
      "Real-time personalization reduces cart abandonment by 40%",
      "Brands using predictive personalization outperform competitors by 30%"
    ],
    audienceImpact: [
      "Gen Z expects instant personalization across all touchpoints",
      "Millennials value privacy but still want relevant experiences",
      "Gen X shows highest engagement with personalized recommendations"
    ],
    industryImpact: [
      "Retail: Dynamic pricing and inventory optimization",
      "Entertainment: Content curation and discovery",
      "Finance: Personalized financial advice and products"
    ]
  },
  {
    id: "2",
    title: "Sustainable Consumption Revolution",
    summary: "Consumers are fundamentally changing their relationship with consumption, prioritizing sustainability over convenience and price.",
    category: "Sustainability",
    confidence: 88,
    signals: [
      "Patagonia's 'Don't Buy This Jacket' campaign increased sales by 30%",
      "Second-hand fashion market growing 3x faster than traditional retail",
      "Plant-based meat alternatives now 15% of total meat market"
    ],
    generatedAt: "2025-01-15T10:30:00Z",
    takeaway: "Sustainability is becoming the primary driver of consumer choice, not just a nice-to-have.",
    drivers: [
      "Climate change awareness and urgency",
      "Social media amplifying sustainable choices",
      "Regulatory pressure on businesses"
    ],
    tensions: [
      "Sustainable options often cost more",
      "Convenience vs. environmental impact",
      "Greenwashing concerns vs. genuine sustainability"
    ],
    behaviors: [
      "Consumers research brand sustainability before purchasing",
      "Circular economy participation increasing rapidly",
      "Willingness to pay premium for sustainable products"
    ],
    aiInsights: [
      "Brands with strong sustainability credentials see 20% higher brand loyalty",
      "Sustainable products command 15% price premium on average",
      "Companies with circular business models outperform traditional models"
    ],
    audienceImpact: [
      "Gen Z leads sustainable consumption adoption",
      "Millennials prioritize sustainable brands in purchasing decisions",
      "Gen X shows growing interest in sustainable investing"
    ],
    industryImpact: [
      "Fashion: Circular economy and rental models",
      "Food: Plant-based alternatives and local sourcing",
      "Transportation: Electric vehicles and shared mobility"
    ]
  },
  {
    id: "3",
    title: "Digital Wellness Integration",
    summary: "Technology companies are building wellness features directly into their products, creating a new category of 'wellness-first' digital experiences.",
    category: "Health",
    confidence: 85,
    signals: [
      "Apple's Screen Time feature used by 80% of iPhone users",
      "Instagram's 'Take a Break' reminders reduce usage by 25%",
      "Google's Digital Wellbeing tools now standard on Android"
    ],
    generatedAt: "2025-01-15T10:30:00Z",
    takeaway: "Digital wellness is becoming a core feature, not an afterthought, in product design.",
    drivers: [
      "Growing awareness of tech addiction",
      "Mental health crisis among young people",
      "Regulatory pressure on tech companies"
    ],
    tensions: [
      "Engagement metrics vs. user wellbeing",
      "Addictive design vs. healthy usage patterns",
      "Business model vs. user benefit"
    ],
    behaviors: [
      "Users actively seek out wellness features",
      "Digital detox practices becoming mainstream",
      "Mindful technology use on the rise"
    ],
    aiInsights: [
      "Apps with wellness features see 30% higher user retention",
      "Digital wellness tools reduce user churn by 40%",
      "Companies prioritizing user wellbeing outperform competitors"
    ],
    audienceImpact: [
      "Gen Z most receptive to wellness features",
      "Parents increasingly monitor children's digital usage",
      "Workplace wellness programs include digital components"
    ],
    industryImpact: [
      "Social Media: Built-in wellness tools and features",
      "Gaming: Mindful gaming and break reminders",
      "Productivity: Focus modes and distraction blocking"
    ]
  },
  {
    id: "4",
    title: "Creator Economy Maturation",
    summary: "The creator economy is evolving from individual creators to creator collectives and studios, professionalizing content creation at scale.",
    category: "Creativity",
    confidence: 90,
    signals: [
      "MrBeast's studio employs 250+ people across multiple channels",
      "Creator collectives like OTK Network generate $50M+ annually",
      "Brands now prefer working with creator studios over individuals"
    ],
    generatedAt: "2025-01-15T10:30:00Z",
    takeaway: "Individual creators are becoming media companies, professionalizing the creator economy.",
    drivers: [
      "Scale requirements for brand partnerships",
      "Content quality expectations rising",
      "Revenue diversification needs"
    ],
    tensions: [
      "Authenticity vs. professionalization",
      "Individual voice vs. collective output",
      "Creative control vs. business growth"
    ],
    behaviors: [
      "Creators forming partnerships and collectives",
      "Brands seeking long-term studio relationships",
      "Audiences following creator networks, not just individuals"
    ],
    aiInsights: [
      "Creator studios outperform individual creators by 40%",
      "Brand partnerships with studios have 60% higher ROI",
      "Collective creators see 3x higher audience retention"
    ],
    audienceImpact: [
      "Audiences engage more with creator networks",
      "Cross-pollination between creator audiences",
      "Higher expectations for content quality and consistency"
    ],
    industryImpact: [
      "Entertainment: Creator studios competing with traditional media",
      "Marketing: Shift from influencer to studio partnerships",
      "Technology: Tools for creator collaboration and management"
    ]
  },
  {
    id: "5",
    title: "Voice-First Commerce",
    summary: "Voice shopping is moving beyond simple commands to conversational commerce, with AI assistants becoming personal shopping advisors.",
    category: "Technology",
    confidence: 87,
    signals: [
      "Amazon's Alexa shopping commands up 300% year-over-year",
      "Google Assistant now handles complex shopping queries",
      "Voice commerce expected to reach $40B by 2025"
    ],
    generatedAt: "2025-01-15T10:30:00Z",
    takeaway: "Voice is becoming the primary interface for shopping, not just a novelty feature.",
    drivers: [
      "Hands-free convenience during busy lifestyles",
      "AI improvements in natural language understanding",
      "Smart speaker adoption reaching critical mass"
    ],
    tensions: [
      "Voice discovery vs. visual product browsing",
      "Privacy concerns vs. personalized recommendations",
      "Accuracy vs. conversational experience"
    ],
    behaviors: [
      "Users prefer voice for routine purchases",
      "Voice shopping increases impulse buying",
      "Brand recognition crucial for voice commerce success"
    ],
    aiInsights: [
      "Voice commerce has 30% higher conversion rates than mobile",
      "Brands with voice-optimized content see 50% more voice interactions",
      "Conversational commerce increases average order value by 25%"
    ],
    audienceImpact: [
      "Busy professionals prefer voice for routine shopping",
      "Families use voice for household supplies and groceries",
      "Older adults find voice shopping more accessible"
    ],
    industryImpact: [
      "Retail: Voice-optimized product catalogs and descriptions",
      "Technology: Natural language processing and voice recognition",
      "Marketing: Voice-first brand strategies and content"
    ]
  },
  {
    id: "6",
    title: "Micro-Moments of Connection",
    summary: "Brands are creating smaller, more frequent touchpoints with consumers through micro-interactions and bite-sized content experiences.",
    category: "Marketing",
    confidence: 83,
    signals: [
      "TikTok's 15-second format drives 3x higher engagement than longer content",
      "Instagram Stories used by 500M+ users daily",
      "Brands sending 5x more micro-messages than traditional campaigns"
    ],
    generatedAt: "2025-01-15T10:30:00Z",
    takeaway: "Small, frequent interactions build stronger relationships than occasional big campaigns.",
    drivers: [
      "Shrinking attention spans",
      "Mobile-first content consumption",
      "Need for authentic, ongoing relationships"
    ],
    tensions: [
      "Frequency vs. relevance",
      "Authenticity vs. automation",
      "Scale vs. personalization"
    ],
    behaviors: [
      "Consumers prefer frequent, small interactions",
      "Micro-moments drive higher engagement rates",
      "Brands that stay top-of-mind through micro-interactions win"
    ],
    aiInsights: [
      "Micro-moments increase brand recall by 40%",
      "Frequent small interactions build 3x stronger brand relationships",
      "Bite-sized content has 60% higher completion rates"
    ],
    audienceImpact: [
      "Gen Z expects constant micro-interactions",
      "Millennials value authentic, ongoing brand relationships",
      "All generations prefer digestible content formats"
    ],
    industryImpact: [
      "Social Media: Platform optimization for micro-content",
      "Advertising: Shift from campaigns to ongoing conversations",
      "Technology: Tools for micro-interaction automation and personalization"
    ]
  }
];

