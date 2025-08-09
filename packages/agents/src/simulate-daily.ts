#!/usr/bin/env node

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { config } from 'dotenv';
import { TrendMaker } from './trend-maker.js';
import { TrendsData, RawTrendItem, WeightsConfig } from '@trends/shared';

config();

const sampleRawData: RawTrendItem[] = [
  {
    title: "AI-Powered Personalization Reaches New Heights in 2025 Marketing",
    url: "https://example.com/ai-personalization-2025",
    source: "Marketing Brew",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    summary: "Machine learning algorithms are now enabling hyper-personalized customer experiences across all touchpoints, with 73% improvement in conversion rates."
  },
  {
    title: "Sustainable Packaging Design Revolution Transforms E-commerce",
    url: "https://example.com/sustainable-packaging",
    source: "Creative Review", 
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    summary: "Innovative biodegradable materials and minimal design approaches are reshaping how brands think about product packaging and environmental impact."
  },
  {
    title: "Voice Commerce Integration Drives 40% Increase in Smart Speaker Sales",
    url: "https://example.com/voice-commerce",
    source: "Adweek",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    summary: "Voice-activated shopping experiences are becoming mainstream, with major brands investing heavily in conversational commerce platforms."
  },
  {
    title: "Gen Z's Social Media Habits Shift Towards Authentic Micro-Influencers",
    url: "https://example.com/gen-z-micro-influencers",
    source: "Campaign Live",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    summary: "Young consumers increasingly trust recommendations from smaller, niche content creators over celebrity endorsements, changing influencer marketing strategies."
  },
  {
    title: "Augmented Reality Try-On Technology Reduces Return Rates by 35%",
    url: "https://example.com/ar-try-on",
    source: "Marketing Brew",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    summary: "Fashion and beauty brands implementing AR fitting solutions see significant improvements in customer satisfaction and reduced logistics costs."
  },
  {
    title: "Data Privacy Regulations Drive New Customer Consent UX Patterns",
    url: "https://example.com/privacy-ux-patterns",
    source: "Creative Review",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    summary: "Designers are creating more transparent and user-friendly ways to handle data consent, turning compliance into competitive advantage."
  },
  {
    title: "Livestream Shopping Events Generate $2.3B in Q4 Sales",
    url: "https://example.com/livestream-shopping",
    source: "Adweek",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    summary: "Interactive video commerce platforms are creating new engagement models, blending entertainment with immediate purchase opportunities."
  },
  {
    title: "Brand Purpose Marketing Evolved: From Statements to Measurable Action",
    url: "https://example.com/brand-purpose-evolution",
    source: "Campaign Live",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString(),
    summary: "Companies are moving beyond purpose-driven messaging to demonstrate real impact through transparent metrics and community partnerships."
  }
];

const defaultWeights: WeightsConfig = {
  categories: {
    "AI/ML": 1.2,
    "Marketing": 1.0,
    "Design": 1.1,
    "Technology": 1.0,
    "Social Media": 0.9,
    "Advertising": 1.0,
    "Branding": 1.1,
    "Consumer Behavior": 1.0,
    "Innovation": 1.2,
    "Data/Analytics": 1.0,
    "Sustainability": 1.1,
    "E-commerce": 0.9
  },
  sources: {
    "Marketing Brew": 1.0,
    "Creative Review": 1.1,
    "Adweek": 1.0,
    "Campaign Live": 1.0
  },
  recencyBoost: 1.5,
  confidenceThreshold: 60
};

async function simulate() {
  console.log('Simulating daily trend processing...');
  
  const trendMaker = new TrendMaker(defaultWeights);
  const processedItems = await trendMaker.processItems(sampleRawData);
  
  const topItems = processedItems.slice(0, parseInt(process.env.DAILY_TOP_N || '8'));
  
  const trendsData: TrendsData = {
    generatedAt: new Date().toISOString(),
    sourceSummary: {
      totalFetched: sampleRawData.length,
      afterDedupe: sampleRawData.length,
      sources: Array.from(new Set(sampleRawData.map(item => item.source)))
    },
    trends: topItems
  };
  
  const publicDir = join(process.cwd(), 'public', 'trends');
  await mkdir(publicDir, { recursive: true });
  
  const today = new Date().toISOString().split('T')[0];
  const dailyPath = join(publicDir, `${today}.json`);
  const latestPath = join(publicDir, 'latest.json');
  
  await writeFile(dailyPath, JSON.stringify(trendsData, null, 2));
  await writeFile(latestPath, JSON.stringify(trendsData, null, 2));
  
  console.log(`✅ Generated ${topItems.length} trends`);
  console.log(`📁 Saved to: ${dailyPath}`);
  console.log(`🔄 Updated: ${latestPath}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  simulate().catch(console.error);
}