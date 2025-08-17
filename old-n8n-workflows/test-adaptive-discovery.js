#!/usr/bin/env node

/**
 * Test Script for Adaptive Feed Discovery System
 * This script simulates the discovery process without affecting the main workflow
 */

const fs = require('fs');
const path = require('path');

// Load current sources configuration
const sourcesPath = path.join(__dirname, 'config/sources.json');
let sourcesConfig;

try {
  sourcesConfig = JSON.parse(fs.readFileSync(sourcesPath, 'utf8'));
  console.log('✅ Loaded sources configuration');
} catch (error) {
  console.error('❌ Failed to load sources config:', error.message);
  process.exit(1);
}

// Simulate performance data for existing feeds
const simulatePerformanceData = () => {
  const performanceData = {};
  
  sourcesConfig.sources.forEach(source => {
    if (source.enabled) {
      // Simulate realistic performance data
      performanceData[source.name] = {
        successRate: Math.random() * 0.4 + 0.6, // 60-100% success rate
        trendContribution: Math.floor(Math.random() * 10) + 1, // 1-10 trends
        avgArticleQuality: Math.random() * 0.5 + 0.5, // 50-100% quality
        responseTime: Math.random() * 2000 + 500, // 500-2500ms
        failureCount: Math.floor(Math.random() * 5), // 0-4 failures
        totalFetches: Math.floor(Math.random() * 50) + 10 // 10-60 fetches
      };
    }
  });
  
  return performanceData;
};

// Analyze current feed performance
const analyzeCurrentFeeds = (performanceData) => {
  console.log('\n📊 === CURRENT FEED ANALYSIS ===');
  
  const analysis = {
    totalFeeds: sourcesConfig.sources.length,
    enabledFeeds: sourcesConfig.sources.filter(s => s.enabled).length,
    categoryBreakdown: {},
    underperformingFeeds: [],
    topPerformingFeeds: [],
    discoveryNeeded: false
  };
  
  // Group feeds by category and analyze performance
  sourcesConfig.sources.forEach(source => {
    const category = source.metadata?.category || 'Unknown';
    if (!analysis.categoryBreakdown[category]) {
      analysis.categoryBreakdown[category] = {
        count: 0,
        enabled: 0,
        avgSuccessRate: 0,
        totalTrendContribution: 0
      };
    }
    
    analysis.categoryBreakdown[category].count++;
    if (source.enabled) {
      analysis.categoryBreakdown[category].enabled++;
    }
    
    // Analyze performance
    const perf = performanceData[source.name] || {};
    const successRate = perf.successRate || 0;
    const trendContribution = perf.trendContribution || 0;
    
    analysis.categoryBreakdown[category].avgSuccessRate += successRate;
    analysis.categoryBreakdown[category].totalTrendContribution += trendContribution;
    
    // Identify underperforming feeds
    if (source.enabled && (successRate < 0.6 || trendContribution < 1)) {
      analysis.underperformingFeeds.push({
        name: source.name,
        category: category,
        successRate: successRate,
        trendContribution: trendContribution,
        url: source.url
      });
    }
    
    // Identify top performing feeds
    if (source.enabled && successRate > 0.8 && trendContribution > 3) {
      analysis.topPerformingFeeds.push({
        name: source.name,
        category: category,
        successRate: successRate,
        trendContribution: trendContribution,
        url: source.url
      });
    }
  });
  
  // Calculate averages
  Object.keys(analysis.categoryBreakdown).forEach(category => {
    const cat = analysis.categoryBreakdown[category];
    if (cat.enabled > 0) {
      cat.avgSuccessRate = cat.avgSuccessRate / cat.enabled;
    }
  });
  
  // Determine if discovery is needed
  const thresholds = sourcesConfig.performanceThresholds || {};
  const maxFeedsPerCategory = thresholds.maxFeedsPerCategory || 8;
  
  Object.keys(analysis.categoryBreakdown).forEach(category => {
    const cat = analysis.categoryBreakdown[category];
    if (cat.enabled < Math.min(3, maxFeedsPerCategory) || cat.avgSuccessRate < 0.7) {
      analysis.discoveryNeeded = true;
    }
  });
  
  // Print analysis results
  console.log(`📈 Total Feeds: ${analysis.totalFeeds} (${analysis.enabledFeeds} enabled)`);
  console.log(`🚫 Underperforming: ${analysis.underperformingFeeds.length}`);
  console.log(`⭐ Top Performers: ${analysis.topPerformingFeeds.length}`);
  console.log(`🔍 Discovery Needed: ${analysis.discoveryNeeded ? 'YES' : 'NO'}`);
  
  console.log('\n📋 Category Breakdown:');
  Object.entries(analysis.categoryBreakdown).forEach(([category, stats]) => {
    console.log(`  ${category}: ${stats.enabled}/${stats.count} feeds, ${(stats.avgSuccessRate * 100).toFixed(1)}% success, ${stats.totalTrendContribution} trends`);
  });
  
  if (analysis.underperformingFeeds.length > 0) {
    console.log('\n⚠️ Underperforming Feeds:');
    analysis.underperformingFeeds.forEach(feed => {
      console.log(`  ${feed.name}: ${(feed.successRate * 100).toFixed(1)}% success, ${feed.trendContribution} trends`);
    });
  }
  
  if (analysis.topPerformingFeeds.length > 0) {
    console.log('\n🏆 Top Performing Feeds:');
    analysis.topPerformingFeeds.forEach(feed => {
      console.log(`  ${feed.name}: ${(feed.successRate * 100).toFixed(1)}% success, ${feed.trendContribution} trends`);
    });
  }
  
  return analysis;
};

// Simulate feed discovery process
const simulateDiscovery = (analysis) => {
  if (!analysis.discoveryNeeded) {
    console.log('\n✅ No discovery needed - current feeds performing well');
    return;
  }
  
  console.log('\n🔍 === SIMULATING FEED DISCOVERY ===');
  
  // Simulate discovered feeds
  const discoveredFeeds = [
    {
      name: "Harvard Business Review",
      url: "https://hbr.org/feed",
      domain: "hbr.org",
      category: "Business",
      quality: 0.9,
      isValid: true
    },
    {
      name: "MIT Technology Review",
      url: "https://www.technologyreview.com/feed/",
      domain: "technologyreview.com",
      category: "Technology",
      quality: 0.85,
      isValid: true
    },
    {
      name: "Marketing Land",
      url: "https://marketingland.com/feed",
      domain: "marketingland.com",
      category: "Marketing",
      quality: 0.8,
      isValid: true
    },
    {
      name: "Broken Feed Example",
      url: "https://broken-feed.com/rss",
      domain: "broken-feed.com",
      category: "Technology",
      quality: 0.3,
      isValid: false
    }
  ];
  
  console.log(`🔍 Discovered ${discoveredFeeds.length} candidate feeds`);
  
  // Filter valid feeds
  const validFeeds = discoveredFeeds.filter(feed => feed.isValid);
  console.log(`✅ ${validFeeds.length} feeds passed validation`);
  
  // Simulate adding new feeds
  const newFeeds = validFeeds.slice(0, 2); // Add top 2
  console.log(`➕ Would add ${newFeeds.length} new feeds:`);
  newFeeds.forEach(feed => {
    console.log(`  ${feed.name} (${feed.category}) - Quality: ${feed.quality}`);
  });
  
  return {
    discoveredFeeds,
    validFeeds,
    newFeeds
  };
};

// Generate recommendations
const generateRecommendations = (analysis, discoveryResults) => {
  console.log('\n💡 === RECOMMENDATIONS ===');
  
  const recommendations = [];
  
  if (analysis.underperformingFeeds.length > 0) {
    recommendations.push(`Monitor ${analysis.underperformingFeeds.length} underperforming feeds`);
  }
  
  if (discoveryResults && discoveryResults.newFeeds.length > 0) {
    recommendations.push(`Add ${discoveryResults.newFeeds.length} new high-quality feeds`);
  }
  
  Object.entries(analysis.categoryBreakdown).forEach(([category, stats]) => {
    if (stats.enabled < 3) {
      recommendations.push(`Add more feeds to ${category} category (currently ${stats.enabled} feeds)`);
    }
    if (stats.avgSuccessRate < 0.7) {
      recommendations.push(`Improve feed quality in ${category} category (${(stats.avgSuccessRate * 100).toFixed(1)}% success rate)`);
    }
  });
  
  if (recommendations.length === 0) {
    recommendations.push('All feeds performing well - no action needed');
  }
  
  recommendations.forEach((rec, index) => {
    console.log(`  ${index + 1}. ${rec}`);
  });
  
  return recommendations;
};

// Main test function
const runTest = () => {
  console.log('🚀 === ADAPTIVE FEED DISCOVERY TEST ===\n');
  
  // Step 1: Simulate performance data
  console.log('📊 Step 1: Simulating performance data...');
  const performanceData = simulatePerformanceData();
  
  // Step 2: Analyze current feeds
  console.log('📈 Step 2: Analyzing current feed performance...');
  const analysis = analyzeCurrentFeeds(performanceData);
  
  // Step 3: Simulate discovery
  console.log('🔍 Step 3: Simulating feed discovery...');
  const discoveryResults = simulateDiscovery(analysis);
  
  // Step 4: Generate recommendations
  console.log('💡 Step 4: Generating recommendations...');
  const recommendations = generateRecommendations(analysis, discoveryResults);
  
  // Summary
  console.log('\n📋 === TEST SUMMARY ===');
  console.log(`✅ Test completed successfully`);
  console.log(`📊 Analyzed ${analysis.totalFeeds} feeds`);
  console.log(`🔍 Discovery needed: ${analysis.discoveryNeeded ? 'YES' : 'NO'}`);
  console.log(`💡 Generated ${recommendations.length} recommendations`);
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Review the analysis above');
  console.log('2. Test with real RSS feeds');
  console.log('3. Integrate with main workflow');
  console.log('4. Set up automated discovery schedule');
};

// Run the test
runTest();
