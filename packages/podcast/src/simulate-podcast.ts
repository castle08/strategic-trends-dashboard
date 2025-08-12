#!/usr/bin/env node

import { readFile } from 'fs/promises';
import { join } from 'path';
import { config } from 'dotenv';
import { PodcastBuilder } from './podcast-builder.js';
import { TrendsData } from './types';

config();

async function simulate() {
  console.log('Simulating weekly podcast generation...');
  
  try {
    // Read the latest trends data
    const trendsPath = join(process.cwd(), 'public', 'trends', 'latest.json');
    const trendsContent = await readFile(trendsPath, 'utf-8');
    const trendsData: TrendsData = JSON.parse(trendsContent);
    
    if (!trendsData.trends.length) {
      throw new Error('No trends found in latest.json');
    }
    
    const builder = new PodcastBuilder();
    const episode = await builder.generateWeeklyPodcast(
      trendsData.trends,
      parseInt(process.env.WEEKLY_PODCAST_TRENDS || '6')
    );
    
    console.log(`✅ Generated podcast episode:`);
    console.log(`   Title: ${episode.title}`);
    console.log(`   Duration: ${episode.duration}s`);
    console.log(`   Trends: ${episode.trends.length}`);
    console.log(`   URL: ${episode.url}`);
    
  } catch (error) {
    console.error('Failed to generate podcast:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  simulate().catch(console.error);
}