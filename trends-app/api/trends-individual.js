import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📊 Fetching individual trends from database...');
    
    // Get query parameters
    const { 
      limit = 10, 
      category, 
      sort = 'created_at', 
      order = 'desc',
      active = true 
    } = req.query;
    
    // Build query
    let query = supabase
      .from('trends_individual')
      .select('*');
    
    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }
    
    if (active === 'true') {
      query = query.eq('is_active', true);
    }
    
    // Apply sorting and limit
    query = query
      .order(sort, { ascending: order === 'asc' })
      .limit(parseInt(limit));
    
    const { data: trends, error } = await query;
    
    if (error) {
      console.error('❌ Database error:', error);
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Transform to frontend format
    const transformedTrends = trends.map(trend => ({
      id: trend.id, // Use database auto-incrementing ID
      title: trend.title,
      summary: trend.summary,
      category: trend.category,
      tags: trend.tags,
      scores: trend.scores,
      whyItMatters: trend.why_it_matters,
      brandAngles: trend.brand_angles,
      exampleUseCases: trend.example_use_cases,
      viz: {
        size: trend.viz_size,
        colorHint: trend.viz_color_hint,
        intensity: trend.viz_intensity
      },
      creative: {
        imageUrl: trend.image_url,
        imagePrompt: trend.image_prompt,
        altText: trend.alt_text,
        shortCardCopy: trend.short_card_copy,
        podcastSnippet: trend.podcast_snippet,
        blobFilename: trend.blob_filename
      }
    }));
    
    console.log(`✅ Retrieved ${transformedTrends.length} trends`);
    
    res.status(200).json({
      trends: transformedTrends,
      count: transformedTrends.length,
      generatedAt: new Date().toISOString(),
      source: 'individual-trends-db'
    });
    
  } catch (error) {
    console.error('❌ API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
