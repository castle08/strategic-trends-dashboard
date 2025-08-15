import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { feedName, success, articleCount, quality, trendContribution } = req.body;

    if (!feedName) {
      return res.status(400).json({ error: 'feedName is required' });
    }

    // Get current feed performance from database
    const { data: existingRecord, error: fetchError } = await supabase
      .from('feed_performance')
      .select('*')
      .eq('feed_name', feedName)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching feed performance:', fetchError);
      return res.status(500).json({ error: 'Database error' });
    }

    const now = new Date().toISOString();
    let updatedPerformance;

    if (existingRecord) {
      // Update existing record
      const current = existingRecord;
      const totalFetches = current.total_fetches + 1;
      const failureCount = success ? current.failure_count : current.failure_count + 1;
      const successRate = (totalFetches - failureCount) / totalFetches;
      
      // Update trend contribution
      const newTrendContribution = current.trend_contribution + (trendContribution || 0);
      
      // Update average quality (weighted average)
      const currentQualityTotal = current.avg_article_quality * current.total_fetches;
      const newQualityTotal = currentQualityTotal + (quality || 0);
      const newAvgQuality = newQualityTotal / totalFetches;

      updatedPerformance = {
        feed_name: feedName,
        last_checked: now,
        success_rate: successRate,
        trend_contribution: newTrendContribution,
        avg_article_quality: newAvgQuality,
        last_successful_fetch: success ? now : current.last_successful_fetch,
        failure_count: failureCount,
        total_fetches: totalFetches,
        updated_at: now
      };

      const { error: updateError } = await supabase
        .from('feed_performance')
        .update(updatedPerformance)
        .eq('feed_name', feedName);

      if (updateError) {
        console.error('Error updating feed performance:', updateError);
        return res.status(500).json({ error: 'Database update error' });
      }
    } else {
      // Create new record
      updatedPerformance = {
        feed_name: feedName,
        last_checked: now,
        success_rate: success ? 1.0 : 0.0,
        trend_contribution: trendContribution || 0,
        avg_article_quality: quality || 0.5,
        last_successful_fetch: success ? now : null,
        failure_count: success ? 0 : 1,
        total_fetches: 1,
        created_at: now,
        updated_at: now
      };

      const { error: insertError } = await supabase
        .from('feed_performance')
        .insert(updatedPerformance);

      if (insertError) {
        console.error('Error inserting feed performance:', insertError);
        return res.status(500).json({ error: 'Database insert error' });
      }
    }

    // Return updated performance data
    return res.status(200).json({
      success: true,
      feedName,
      performance: updatedPerformance,
      timestamp: now
    });

  } catch (error) {
    console.error('Feed performance tracking error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}
