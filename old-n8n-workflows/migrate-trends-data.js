// Migration Script: Convert JSONB trends to individual rows
// Run this after creating the new schema

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateTrendsData() {
  console.log('🔄 Starting trends data migration...');
  
  try {
    // 1. Get all existing trends data
    console.log('📥 Fetching existing trends data...');
    const { data: existingTrends, error: fetchError } = await supabase
      .from('trends')
      .select('*')
      .order('id', { ascending: true });
    
    if (fetchError) {
      throw new Error(`Failed to fetch existing trends: ${fetchError.message}`);
    }
    
    console.log(`✅ Found ${existingTrends.length} existing trend records`);
    
    // 2. Process each record and extract individual trends
    let totalTrendsProcessed = 0;
    let totalTrendsInserted = 0;
    
    for (const record of existingTrends) {
      console.log(`\n📊 Processing record ID ${record.id} (${record.generatedat})`);
      
      if (!record.trends || !Array.isArray(record.trends)) {
        console.log(`⚠️  Skipping record ${record.id} - no valid trends array`);
        continue;
      }
      
      console.log(`📈 Found ${record.trends.length} trends in this record`);
      
      // 3. Convert each trend to individual row format
      for (const trend of record.trends) {
        totalTrendsProcessed++;
        
        // Skip if trend already exists (check by trend_id)
        const { data: existing } = await supabase
          .from('trends_individual')
          .select('trend_id')
          .eq('trend_id', trend.id)
          .single();
        
        if (existing) {
          console.log(`⏭️  Skipping trend ${trend.id} - already exists`);
          continue;
        }
        
        // 4. Prepare trend data for insertion
        const trendData = {
          trend_id: trend.id,
          title: trend.title,
          summary: trend.summary,
          category: trend.category,
          tags: trend.tags || [],
          scores: trend.scores || {},
          why_it_matters: trend.whyItMatters,
          brand_angles: trend.brandAngles || [],
          example_use_cases: trend.exampleUseCases || [],
          
          // Visual properties
          viz_size: trend.viz?.size,
          viz_color_hint: trend.viz?.colorHint,
          viz_intensity: trend.viz?.intensity,
          
          // Creative assets
          image_url: trend.creative?.imageUrl,
          image_prompt: trend.creative?.imagePrompt,
          alt_text: trend.creative?.altText,
          short_card_copy: trend.creative?.shortCardCopy,
          podcast_snippet: trend.creative?.podcastSnippet,
          blob_filename: trend.creative?.blobFilename,
          
          // Metadata
          created_at: record.generatedat,
          source: 'migration-from-jsonb',
          version: '2.0'
        };
        
        // 5. Insert individual trend
        const { error: insertError } = await supabase
          .from('trends_individual')
          .insert(trendData);
        
        if (insertError) {
          console.error(`❌ Failed to insert trend ${trend.id}:`, insertError.message);
        } else {
          totalTrendsInserted++;
          console.log(`✅ Inserted trend: ${trend.title}`);
        }
      }
    }
    
    console.log(`\n🎉 Migration completed!`);
    console.log(`📊 Total trends processed: ${totalTrendsProcessed}`);
    console.log(`✅ Total trends inserted: ${totalTrendsInserted}`);
    
    // 6. Verify migration
    const { count } = await supabase
      .from('trends_individual')
      .select('*', { count: 'exact', head: true });
    
    console.log(`📈 Total trends in new table: ${count}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migration
migrateTrendsData();
