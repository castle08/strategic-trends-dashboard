-- Feed Performance Tracking Schema
-- This table tracks the performance of RSS feeds over time

CREATE TABLE IF NOT EXISTS feed_performance (
    id SERIAL PRIMARY KEY,
    feed_name VARCHAR(255) NOT NULL UNIQUE,
    last_checked TIMESTAMP WITH TIME ZONE,
    success_rate DECIMAL(3,2) DEFAULT 0.0,
    trend_contribution INTEGER DEFAULT 0,
    avg_article_quality DECIMAL(3,2) DEFAULT 0.0,
    last_successful_fetch TIMESTAMP WITH TIME ZONE,
    failure_count INTEGER DEFAULT 0,
    total_fetches INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance queries
CREATE INDEX IF NOT EXISTS idx_feed_performance_name ON feed_performance(feed_name);
CREATE INDEX IF NOT EXISTS idx_feed_performance_success_rate ON feed_performance(success_rate);
CREATE INDEX IF NOT EXISTS idx_feed_performance_trend_contribution ON feed_performance(trend_contribution);
CREATE INDEX IF NOT EXISTS idx_feed_performance_last_checked ON feed_performance(last_checked);

-- Feed Discovery History
-- This table tracks discovered RSS feeds and their testing results

CREATE TABLE IF NOT EXISTS feed_discovery_history (
    id SERIAL PRIMARY KEY,
    feed_name VARCHAR(255) NOT NULL,
    feed_url TEXT NOT NULL,
    domain VARCHAR(255),
    discovered_from VARCHAR(255),
    category VARCHAR(100),
    initial_quality DECIMAL(3,2),
    is_valid BOOLEAN DEFAULT false,
    response_time_ms INTEGER,
    article_count INTEGER,
    last_updated TIMESTAMP WITH TIME ZONE,
    discovery_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    added_to_sources BOOLEAN DEFAULT false,
    notes TEXT
);

-- Index for discovery queries
CREATE INDEX IF NOT EXISTS idx_feed_discovery_domain ON feed_discovery_history(domain);
CREATE INDEX IF NOT EXISTS idx_feed_discovery_category ON feed_discovery_history(category);
CREATE INDEX IF NOT EXISTS idx_feed_discovery_date ON feed_discovery_history(discovery_date);
CREATE INDEX IF NOT EXISTS idx_feed_discovery_valid ON feed_discovery_history(is_valid);

-- Feed Categories
-- This table defines the categories and their performance targets

CREATE TABLE IF NOT EXISTS feed_categories (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    target_feed_count INTEGER DEFAULT 5,
    min_success_rate DECIMAL(3,2) DEFAULT 0.7,
    min_trend_contribution INTEGER DEFAULT 2,
    priority INTEGER DEFAULT 5,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO feed_categories (category_name, target_feed_count, min_success_rate, min_trend_contribution, priority) VALUES
    ('Technology', 6, 0.75, 3, 1),
    ('Business', 5, 0.7, 2, 2),
    ('Marketing', 5, 0.7, 2, 2),
    ('Creative', 4, 0.65, 1, 3),
    ('Advertising', 4, 0.65, 1, 3),
    ('Healthcare', 3, 0.7, 2, 4),
    ('Finance', 3, 0.7, 2, 4),
    ('Retail', 3, 0.65, 1, 4),
    ('Automotive', 3, 0.65, 1, 5),
    ('Gaming', 3, 0.65, 1, 5)
ON CONFLICT (category_name) DO NOTHING;

-- Views for easy querying

-- View: Feed Performance Summary
CREATE OR REPLACE VIEW feed_performance_summary AS
SELECT 
    fp.feed_name,
    fp.success_rate,
    fp.trend_contribution,
    fp.avg_article_quality,
    fp.total_fetches,
    fp.failure_count,
    fp.last_checked,
    fp.last_successful_fetch,
    CASE 
        WHEN fp.success_rate >= 0.8 AND fp.trend_contribution >= 3 THEN 'Top Performer'
        WHEN fp.success_rate >= 0.7 AND fp.trend_contribution >= 2 THEN 'Good Performer'
        WHEN fp.success_rate >= 0.6 AND fp.trend_contribution >= 1 THEN 'Average Performer'
        WHEN fp.success_rate < 0.6 OR fp.trend_contribution < 1 THEN 'Underperforming'
        ELSE 'Unknown'
    END as performance_status
FROM feed_performance fp
ORDER BY fp.trend_contribution DESC, fp.success_rate DESC;

-- View: Category Performance Summary
CREATE OR REPLACE VIEW category_performance_summary AS
SELECT 
    fc.category_name,
    fc.target_feed_count,
    COUNT(fp.id) as current_feed_count,
    AVG(fp.success_rate) as avg_success_rate,
    SUM(fp.trend_contribution) as total_trend_contribution,
    COUNT(CASE WHEN fp.success_rate >= fc.min_success_rate THEN 1 END) as feeds_meeting_success_target,
    COUNT(CASE WHEN fp.trend_contribution >= fc.min_trend_contribution THEN 1 END) as feeds_meeting_trend_target,
    CASE 
        WHEN COUNT(fp.id) < fc.target_feed_count THEN 'Needs More Feeds'
        WHEN AVG(fp.success_rate) < fc.min_success_rate THEN 'Needs Better Quality'
        ELSE 'Performing Well'
    END as category_status
FROM feed_categories fc
LEFT JOIN feed_performance fp ON fp.feed_name LIKE '%' || fc.category_name || '%'
GROUP BY fc.category_name, fc.target_feed_count, fc.min_success_rate, fc.min_trend_contribution
ORDER BY fc.priority, fc.category_name;

-- Function: Update feed performance
CREATE OR REPLACE FUNCTION update_feed_performance(
    p_feed_name VARCHAR(255),
    p_success BOOLEAN,
    p_article_count INTEGER DEFAULT NULL,
    p_quality DECIMAL(3,2) DEFAULT NULL,
    p_trend_contribution INTEGER DEFAULT NULL
) RETURNS feed_performance AS $$
DECLARE
    v_record feed_performance;
    v_now TIMESTAMP WITH TIME ZONE := NOW();
BEGIN
    -- Try to get existing record
    SELECT * INTO v_record FROM feed_performance WHERE feed_name = p_feed_name;
    
    IF v_record IS NULL THEN
        -- Create new record
        INSERT INTO feed_performance (
            feed_name, last_checked, success_rate, trend_contribution, 
            avg_article_quality, last_successful_fetch, failure_count, total_fetches
        ) VALUES (
            p_feed_name, v_now, 
            CASE WHEN p_success THEN 1.0 ELSE 0.0 END,
            COALESCE(p_trend_contribution, 0),
            COALESCE(p_quality, 0.5),
            CASE WHEN p_success THEN v_now ELSE NULL END,
            CASE WHEN p_success THEN 0 ELSE 1 END,
            1
        ) RETURNING * INTO v_record;
    ELSE
        -- Update existing record
        UPDATE feed_performance SET
            last_checked = v_now,
            success_rate = (total_fetches - failure_count + (CASE WHEN p_success THEN 0 ELSE 1 END))::DECIMAL / (total_fetches + 1),
            trend_contribution = trend_contribution + COALESCE(p_trend_contribution, 0),
            avg_article_quality = (avg_article_quality * total_fetches + COALESCE(p_quality, 0)) / (total_fetches + 1),
            last_successful_fetch = CASE WHEN p_success THEN v_now ELSE last_successful_fetch END,
            failure_count = failure_count + (CASE WHEN p_success THEN 0 ELSE 1 END),
            total_fetches = total_fetches + 1,
            updated_at = v_now
        WHERE feed_name = p_feed_name
        RETURNING * INTO v_record;
    END IF;
    
    RETURN v_record;
END;
$$ LANGUAGE plpgsql;

-- Function: Get feeds needing discovery
CREATE OR REPLACE FUNCTION get_feeds_needing_discovery() 
RETURNS TABLE(category_name VARCHAR(100), current_count BIGINT, target_count INTEGER, avg_success_rate DECIMAL(3,2), needs_discovery BOOLEAN) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        fc.category_name,
        COUNT(fp.id)::BIGINT as current_count,
        fc.target_feed_count,
        AVG(fp.success_rate) as avg_success_rate,
        (COUNT(fp.id) < fc.target_feed_count OR AVG(fp.success_rate) < fc.min_success_rate) as needs_discovery
    FROM feed_categories fc
    LEFT JOIN feed_performance fp ON fp.feed_name LIKE '%' || fc.category_name || '%'
    WHERE fc.enabled = true
    GROUP BY fc.category_name, fc.target_feed_count, fc.min_success_rate
    HAVING COUNT(fp.id) < fc.target_feed_count OR AVG(fp.success_rate) < fc.min_success_rate
    ORDER BY fc.priority, fc.category_name;
END;
$$ LANGUAGE plpgsql;
