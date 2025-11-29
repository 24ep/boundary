-- Version Control System Schema
-- This schema supports content versioning with auto-save functionality

-- Content Versions Table
CREATE TABLE IF NOT EXISTS content_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES content_pages(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    content JSONB NOT NULL,
    change_description TEXT,
    is_auto_save BOOLEAN DEFAULT false,
    size_bytes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    
    -- Ensure unique version numbers per page
    UNIQUE(page_id, version_number)
);

-- Version Comparison Table (for tracking differences)
CREATE TABLE IF NOT EXISTS version_comparisons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES content_pages(id) ON DELETE CASCADE,
    version1_id UUID NOT NULL REFERENCES content_versions(id) ON DELETE CASCADE,
    version2_id UUID NOT NULL REFERENCES content_versions(id) ON DELETE CASCADE,
    diff_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Version Tags Table (for marking important versions)
CREATE TABLE IF NOT EXISTS version_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version_id UUID NOT NULL REFERENCES content_versions(id) ON DELETE CASCADE,
    tag_name VARCHAR(100) NOT NULL,
    tag_color VARCHAR(7) DEFAULT '#3b82f6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    
    UNIQUE(version_id, tag_name)
);

-- Version Comments Table (for collaboration)
CREATE TABLE IF NOT EXISTS version_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version_id UUID NOT NULL REFERENCES content_versions(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_content_versions_page_id ON content_versions(page_id);
CREATE INDEX IF NOT EXISTS idx_content_versions_version_number ON content_versions(page_id, version_number);
CREATE INDEX IF NOT EXISTS idx_content_versions_created_at ON content_versions(created_at);
CREATE INDEX IF NOT EXISTS idx_content_versions_is_auto_save ON content_versions(is_auto_save);
CREATE INDEX IF NOT EXISTS idx_content_versions_created_by ON content_versions(created_by);

CREATE INDEX IF NOT EXISTS idx_version_comparisons_page_id ON version_comparisons(page_id);
CREATE INDEX IF NOT EXISTS idx_version_tags_version_id ON version_tags(version_id);
CREATE INDEX IF NOT EXISTS idx_version_comments_version_id ON version_comments(version_id);

-- Functions for version management
CREATE OR REPLACE FUNCTION get_next_version_number(page_id UUID)
RETURNS INTEGER AS $$
DECLARE
    next_version INTEGER;
BEGIN
    SELECT COALESCE(MAX(version_number), 0) + 1
    INTO next_version
    FROM content_versions
    WHERE content_versions.page_id = get_next_version_number.page_id;
    
    RETURN next_version;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION cleanup_old_auto_saves()
RETURNS VOID AS $$
BEGIN
    -- Delete auto-save versions older than 30 days, keeping only the latest 10 per page
    DELETE FROM content_versions
    WHERE is_auto_save = true
    AND created_at < NOW() - INTERVAL '30 days'
    AND id NOT IN (
        SELECT id FROM (
            SELECT id, ROW_NUMBER() OVER (PARTITION BY page_id ORDER BY created_at DESC) as rn
            FROM content_versions
            WHERE is_auto_save = true
            AND created_at < NOW() - INTERVAL '30 days'
        ) ranked
        WHERE rn <= 10
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_content_size(content_data JSONB)
RETURNS INTEGER AS $$
BEGIN
    RETURN LENGTH(content_data::text);
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_content_versions_updated_at
    BEFORE UPDATE ON content_versions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_version_comments_updated_at
    BEFORE UPDATE ON version_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to automatically calculate content size
CREATE OR REPLACE FUNCTION update_content_size()
RETURNS TRIGGER AS $$
BEGIN
    NEW.size_bytes = calculate_content_size(NEW.content);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_content_versions_size
    BEFORE INSERT OR UPDATE ON content_versions
    FOR EACH ROW
    EXECUTE FUNCTION update_content_size();

-- Row Level Security (RLS) policies
ALTER TABLE content_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE version_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE version_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE version_comments ENABLE ROW LEVEL SECURITY;

-- Policies for content_versions
CREATE POLICY "Allow authenticated users to view versions" ON content_versions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to create versions" ON content_versions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update their own versions" ON content_versions
    FOR UPDATE USING (auth.role() = 'authenticated' AND created_by = auth.uid());

CREATE POLICY "Allow authenticated users to delete their own versions" ON content_versions
    FOR DELETE USING (auth.role() = 'authenticated' AND created_by = auth.uid());

-- Policies for version_comparisons
CREATE POLICY "Allow authenticated users to view comparisons" ON version_comparisons
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to create comparisons" ON version_comparisons
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policies for version_tags
CREATE POLICY "Allow authenticated users to manage tags" ON version_tags
    FOR ALL USING (auth.role() = 'authenticated');

-- Policies for version_comments
CREATE POLICY "Allow authenticated users to view comments" ON version_comments
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to create comments" ON version_comments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update their own comments" ON version_comments
    FOR UPDATE USING (auth.role() = 'authenticated' AND created_by = auth.uid());

-- Create a scheduled job to cleanup old auto-saves (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-auto-saves', '0 2 * * *', 'SELECT cleanup_old_auto_saves();');

-- Insert some sample version data for testing
INSERT INTO content_versions (page_id, version_number, title, content, change_description, is_auto_save, created_by) 
SELECT 
    cp.id,
    1,
    'Initial Version',
    cp.components,
    'Initial content creation',
    false,
    cp.created_by
FROM content_pages cp
WHERE NOT EXISTS (
    SELECT 1 FROM content_versions cv 
    WHERE cv.page_id = cp.id
)
ON CONFLICT (page_id, version_number) DO NOTHING;
