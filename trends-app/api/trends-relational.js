import { put } from '@vercel/blob';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Map JSON trend data to relational tables
async function saveTrendsToRelationalTables(trendsData) {
  try {
    console.log('📊 Saving trends to relational tables...');
    
    const { trends, generatedAt } = trendsData;
    
    for (const trend of trends) {
      console.log(`📝 Processing trend: ${trend.title}`);
      
      // 1. Insert main trend record
      const { data: trendRecord, error: trendError } = await supabase
        .from('trends')
        .insert([{
          title: trend.title,
          summary: trend.summary,
          category: trend.category,
          generated_at: generatedAt,
          last_updated: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (trendError) {
        console.error('❌ Error inserting trend:', trendError);
        continue;
      }
      
      const trendId = trendRecord.id;
      console.log(`✅ Inserted trend with ID: ${trendId}`);
      
      // 2. Insert scores
      if (trend.scores) {
        await supabase
          .from('trend_scores')
          .insert([{
            trend_id: trendId,
            novelty: trend.scores.novelty,
            velocity: trend.scores.velocity,
            relevance: trend.scores.relevance,
            confidence: trend.scores.confidence,
            total: trend.scores.total
          }]);
      }
      
      // 3. Insert creative content
      if (trend.creative) {
        await supabase
          .from('trend_creative')
          .insert([{
            trend_id: trendId,
            short_card_copy: trend.creative.shortCardCopy,
            image_prompt: trend.creative.imagePrompt,
            alt_text: trend.creative.altText,
            podcast_snippet: trend.creative.podcastSnippet,
            image_url: trend.creative.imageUrl,
            blob_filename: trend.creative.blobFilename
          }]);
      }
      
      // 4. Insert tags
      if (trend.tags && Array.isArray(trend.tags)) {
        const tagRecords = trend.tags.map(tag => ({
          trend_id: trendId,
          tag: tag
        }));
        await supabase.from('trend_tags').insert(tagRecords);
      }
      
      // 5. Insert brand angles
      if (trend.brandAngles && Array.isArray(trend.brandAngles)) {
        const angleRecords = trend.brandAngles.map(angle => ({
          trend_id: trendId,
          angle: angle
        }));
        await supabase.from('trend_brand_angles').insert(angleRecords);
      }
      
      // 6. Insert use cases
      if (trend.exampleUseCases && Array.isArray(trend.exampleUseCases)) {
        const useCaseRecords = trend.exampleUseCases.map(useCase => ({
          trend_id: trendId,
          use_case: useCase
        }));
        await supabase.from('trend_use_cases').insert(useCaseRecords);
      }
    }
    
    console.log(`✅ Successfully saved ${trends.length} trends to relational tables`);
    return true;
    
  } catch (error) {
    console.error('❌ Error saving to relational tables:', error);
    return false;
  }
}

// Read trends from relational tables
async function readTrendsFromRelationalTables() {
  try {
    console.log('📖 Reading trends from relational tables...');
    
    // Get all trends with their related data
    const { data: trends, error } = await supabase
      .from('trends')
      .select(`
        *,
        trend_scores (*),
        trend_creative (*),
        trend_tags (*),
        trend_brand_angles (*),
        trend_use_cases (*)
      `)
      .order('generated_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error reading trends:', error);
      return null;
    }
    
    // Transform back to the expected JSON format
    const transformedTrends = trends.map(trend => ({
      id: trend.id,
      title: trend.title,
      summary: trend.summary,
      category: trend.category,
      scores: trend.trend_scores?.[0] || {},
      creative: trend.trend_creative?.[0] || {},
      tags: trend.trend_tags?.map(t => t.tag) || [],
      brandAngles: trend.trend_brand_angles?.map(b => b.angle) || [],
      exampleUseCases: trend.trend_use_cases?.map(u => u.use_case) || [],
      viz: {
        size: 15,
        intensity: 1.5,
        colorHint: '#3b82f6'
      }
    }));
    
    return {
      trends: transformedTrends,
      generatedAt: trends[0]?.generated_at || new Date().toISOString(),
      sourceSummary: {
        totalFetched: trends.length,
        afterCluster: trends.length,
        sources: ['Strategic Market Intelligence']
      }
    };
    
  } catch (error) {
    console.error('❌ Error reading from relational tables:', error);
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      console.log('📥 Received POST data for relational storage');
      
      const success = await saveTrendsToRelationalTables(req.body);
      
      if (success) {
        return res.status(200).json({ 
          success: true, 
          message: 'Trends saved to relational tables',
          trendsCount: req.body?.trends?.length || 0
        });
      } else {
        return res.status(500).json({ 
          error: 'Failed to save trends to relational tables' 
        });
      }
      
    } catch (error) {
      console.error('❌ Error in POST handler:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    }
  }

  if (req.method === 'GET') {
    try {
      const data = await readTrendsFromRelationalTables();
      
      if (data) {
        return res.status(200).json(data);
      } else {
        return res.status(404).json({ 
          error: 'No trends found in relational tables' 
        });
      }
      
    } catch (error) {
      console.error('❌ Error in GET handler:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

