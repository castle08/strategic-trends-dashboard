-- New Trends Database Schema
-- Replaces the current JSONB blob approach with individual trend rows

-- Drop existing table (backup first!)
-- DROP TABLE IF EXISTS public.trends_old;
-- ALTER TABLE public.trends RENAME TO trends_old;

-- Create new individual trends table
CREATE TABLE IF NOT EXISTS public.trends_individual (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    tags TEXT[], -- Array of tags
    scores JSONB, -- Store scores as JSON: {"total": 90, "novelty": 85, ...}
    why_it_matters TEXT,
    brand_angles TEXT[], -- Array of brand angles
    example_use_cases TEXT[], -- Array of use cases
    
    -- Visual properties
    viz_size INTEGER,
    viz_color_hint VARCHAR(50),
    viz_intensity DECIMAL(3,2),
    
    -- Creative assets
    image_url VARCHAR(500),
    image_prompt TEXT,
    alt_text VARCHAR(255),
    short_card_copy VARCHAR(255),
    podcast_snippet TEXT,
    blob_filename VARCHAR(255), -- Vercel blob filename
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    source VARCHAR(50) DEFAULT 'n8n-workflow',
    version VARCHAR(10) DEFAULT '2.0'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trends_category ON public.trends_individual(category);
CREATE INDEX IF NOT EXISTS idx_trends_created_at ON public.trends_individual(created_at);
CREATE INDEX IF NOT EXISTS idx_trends_active ON public.trends_individual(is_active);
CREATE INDEX IF NOT EXISTS idx_trends_scores_total ON public.trends_individual USING GIN(scores);

-- Create a view for the latest trends (for backward compatibility)
CREATE OR REPLACE VIEW public.latest_trends AS
SELECT 
    json_agg(
        json_build_object(
            'id', id,
            'title', title,
            'summary', summary,
            'category', category,
            'tags', tags,
            'scores', scores,
            'whyItMatters', why_it_matters,
            'brandAngles', brand_angles,
            'exampleUseCases', example_use_cases,
            'viz', json_build_object(
                'size', viz_size,
                'colorHint', viz_color_hint,
                'intensity', viz_intensity
            ),
            'creative', json_build_object(
                'imageUrl', image_url,
                'imagePrompt', image_prompt,
                'altText', alt_text,
                'shortCardCopy', short_card_copy,
                'podcastSnippet', podcast_snippet,
                'blobFilename', blob_filename
            )
        ) ORDER BY created_at DESC
    ) as trends,
    NOW() as generatedat,
    NOW() as lastupdated,
    'supabase-blob' as storagetype,
    '2.0' as version
FROM public.trends_individual 
WHERE is_active = TRUE;

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_trends_individual_updated_at 
    BEFORE UPDATE ON public.trends_individual 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust as needed)
GRANT ALL ON public.trends_individual TO postgres;
GRANT SELECT ON public.latest_trends TO postgres;
