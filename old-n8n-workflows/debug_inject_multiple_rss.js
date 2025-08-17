// Debug: Inject Multiple RSS Items for Testing
console.log('🚀 === INJECTING TEST RSS ITEMS ===');

const testRssItems = [
  {
    title: "AI-Powered Email Marketing Sees 45% Higher Open Rates",
    url: "https://blog.hubspot.com/marketing/ai-email-marketing-2024",
    source: "HubSpot",
    summary: "New research shows AI-driven personalization in email campaigns dramatically improves engagement metrics, with brands reporting significant ROI improvements.",
    publishedAt: "2025-08-09T12:00:00.000Z"
  },
  {
    title: "Voice Search Optimization: The Future of Local SEO",
    url: "https://searchengineland.com/voice-search-local-seo-2024-trends",
    source: "Search Engine Land", 
    summary: "With smart speakers in 50% of US homes, businesses must adapt their SEO strategies to capture voice-first search behavior.",
    publishedAt: "2025-08-09T11:30:00.000Z"
  },
  {
    title: "Social Commerce Revenue Jumps 35% Year-Over-Year",
    url: "https://www.socialmediaexaminer.com/social-commerce-growth-2024",
    source: "Social Media Examiner",
    summary: "Instagram, TikTok, and Pinterest shopping features drive massive revenue growth as social platforms become primary discovery channels.",
    publishedAt: "2025-08-09T11:00:00.000Z"
  },
  {
    title: "Customer Data Platforms: Privacy vs Personalization",
    url: "https://neilpatel.com/blog/cdp-privacy-balance",
    source: "Neil Patel",
    summary: "Marketing leaders navigate increasing privacy regulations while maintaining personalized customer experiences through CDP implementation.",
    publishedAt: "2025-08-09T10:30:00.000Z"
  },
  {
    title: "Micro-Influencer ROI Outperforms Celebrity Partnerships",
    url: "https://blog.hootsuite.com/micro-influencer-marketing-roi-2024",
    source: "Hootsuite",
    summary: "Brands achieve 3x higher engagement rates and 60% better conversion with micro-influencers compared to celebrity endorsements.",
    publishedAt: "2025-08-09T10:00:00.000Z"
  }
];

console.log(`📊 Injecting ${testRssItems.length} test RSS items`);

const outputItems = testRssItems.map(item => ({
  json: {
    title: item.title,
    url: item.url,
    source: item.source,
    publishedAt: item.publishedAt,
    summary: item.summary
  }
}));

testRssItems.forEach((item, index) => {
  console.log(`✅ Item ${index + 1}: "${item.title.substring(0, 50)}..." from ${item.source}`);
});

console.log('🚀 === TEST RSS INJECTION COMPLETE ===');

return outputItems;