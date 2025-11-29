-- Dynamic Content Management System Schema
-- This schema supports drag-and-drop content creation similar to Adobe Experience Manager

-- Content Pages Table
CREATE TABLE IF NOT EXISTS content_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('marketing', 'news', 'inspiration', 'popup')),
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    components JSONB NOT NULL DEFAULT '[]'::jsonb,
    mobile_display JSONB NOT NULL DEFAULT '{
        "showOnLogin": false,
        "showOnHome": false,
        "showOnNews": false,
        "showAsPopup": false,
        "popupTrigger": "immediate",
        "popupDelay": 0
    }'::jsonb,
    seo_meta JSONB DEFAULT '{
        "title": "",
        "description": "",
        "keywords": [],
        "og_image": ""
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Content Analytics Table
CREATE TABLE IF NOT EXISTS content_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES content_pages(id) ON DELETE CASCADE,
    views INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    last_viewed TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(page_id)
);

-- Content Templates Table
CREATE TABLE IF NOT EXISTS content_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('marketing', 'news', 'inspiration', 'popup')),
    components JSONB NOT NULL DEFAULT '[]'::jsonb,
    mobile_display JSONB NOT NULL DEFAULT '{
        "showOnLogin": false,
        "showOnHome": false,
        "showOnNews": false,
        "showAsPopup": false,
        "popupTrigger": "immediate",
        "popupDelay": 0
    }'::jsonb,
    preview_image VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Content Views Tracking Table
CREATE TABLE IF NOT EXISTS content_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES content_pages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content Interactions Table (clicks, conversions, etc.)
CREATE TABLE IF NOT EXISTS content_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES content_pages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    interaction_type VARCHAR(50) NOT NULL CHECK (interaction_type IN ('click', 'conversion', 'share', 'like')),
    component_id VARCHAR(255),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mobile App Content Display Rules
CREATE TABLE IF NOT EXISTS mobile_display_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES content_pages(id) ON DELETE CASCADE,
    rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN ('user_segment', 'time_based', 'location_based', 'behavior_based')),
    conditions JSONB NOT NULL DEFAULT '{}'::jsonb,
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_content_pages_type ON content_pages(type);
CREATE INDEX IF NOT EXISTS idx_content_pages_status ON content_pages(status);
CREATE INDEX IF NOT EXISTS idx_content_pages_slug ON content_pages(slug);
CREATE INDEX IF NOT EXISTS idx_content_pages_created_at ON content_pages(created_at);
CREATE INDEX IF NOT EXISTS idx_content_pages_mobile_display ON content_pages USING GIN (mobile_display);

CREATE INDEX IF NOT EXISTS idx_content_analytics_page_id ON content_analytics(page_id);
CREATE INDEX IF NOT EXISTS idx_content_views_page_id ON content_views(page_id);
CREATE INDEX IF NOT EXISTS idx_content_views_viewed_at ON content_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_content_interactions_page_id ON content_interactions(page_id);
CREATE INDEX IF NOT EXISTS idx_content_interactions_type ON content_interactions(interaction_type);

CREATE INDEX IF NOT EXISTS idx_content_templates_type ON content_templates(type);
CREATE INDEX IF NOT EXISTS idx_content_templates_active ON content_templates(is_active);

-- Functions for analytics
CREATE OR REPLACE FUNCTION increment_content_views(page_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO content_analytics (page_id, views, last_viewed)
    VALUES (page_id, 1, NOW())
    ON CONFLICT (page_id)
    DO UPDATE SET
        views = content_analytics.views + 1,
        last_viewed = NOW(),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_content_clicks(page_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO content_analytics (page_id, clicks)
    VALUES (page_id, 1)
    ON CONFLICT (page_id)
    DO UPDATE SET
        clicks = content_analytics.clicks + 1,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_content_conversions(page_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO content_analytics (page_id, conversions)
    VALUES (page_id, 1)
    ON CONFLICT (page_id)
    DO UPDATE SET
        conversions = content_analytics.conversions + 1,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_content_pages_updated_at
    BEFORE UPDATE ON content_pages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_analytics_updated_at
    BEFORE UPDATE ON content_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_templates_updated_at
    BEFORE UPDATE ON content_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mobile_display_rules_updated_at
    BEFORE UPDATE ON mobile_display_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default templates
INSERT INTO content_templates (name, description, type, components, mobile_display) VALUES
(
    'Marketing Hero Section',
    'A compelling hero section for marketing pages with headline, subtext, and CTA button',
    'marketing',
    '[
        {
            "id": "hero_text",
            "type": "text",
            "props": {
                "content": "Welcome to Bondarys - Connect Your Family",
                "fontSize": 32,
                "color": "#1f2937",
                "alignment": "center"
            },
            "order": 0
        },
        {
            "id": "hero_subtext",
            "type": "text",
            "props": {
                "content": "Stay connected with your loved ones through our secure family platform",
                "fontSize": 18,
                "color": "#6b7280",
                "alignment": "center"
            },
            "order": 1
        },
        {
            "id": "cta_button",
            "type": "button",
            "props": {
                "text": "Get Started",
                "action": "/signup",
                "style": "primary",
                "size": "large"
            },
            "order": 2
        }
    ]'::jsonb,
    '{
        "showOnLogin": true,
        "showOnHome": false,
        "showOnNews": false,
        "showAsPopup": false,
        "popupTrigger": "immediate"
    }'::jsonb
),
(
    'News Article Template',
    'A clean template for news and inspiration articles',
    'news',
    '[
        {
            "id": "article_title",
            "type": "text",
            "props": {
                "content": "Article Title",
                "fontSize": 24,
                "color": "#1f2937",
                "alignment": "left"
            },
            "order": 0
        },
        {
            "id": "article_image",
            "type": "image",
            "props": {
                "src": "",
                "alt": "Article image",
                "caption": "",
                "width": 100
            },
            "order": 1
        },
        {
            "id": "article_content",
            "type": "text",
            "props": {
                "content": "Article content goes here...",
                "fontSize": 16,
                "color": "#374151",
                "alignment": "left"
            },
            "order": 2
        }
    ]'::jsonb,
    '{
        "showOnLogin": false,
        "showOnHome": false,
        "showOnNews": true,
        "showAsPopup": false,
        "popupTrigger": "immediate"
    }'::jsonb
),
(
    'Promotional Popup',
    'A popup modal for promotions and announcements',
    'popup',
    '[
        {
            "id": "popup_title",
            "type": "text",
            "props": {
                "content": "Special Offer!",
                "fontSize": 20,
                "color": "#dc2626",
                "alignment": "center"
            },
            "order": 0
        },
        {
            "id": "popup_message",
            "type": "text",
            "props": {
                "content": "Get 50% off your first month subscription!",
                "fontSize": 16,
                "color": "#374151",
                "alignment": "center"
            },
            "order": 1
        },
        {
            "id": "popup_button",
            "type": "button",
            "props": {
                "text": "Claim Offer",
                "action": "/promo",
                "style": "primary",
                "size": "medium"
            },
            "order": 2
        }
    ]'::jsonb,
    '{
        "showOnLogin": false,
        "showOnHome": true,
        "showOnNews": false,
        "showAsPopup": true,
        "popupTrigger": "after_delay",
        "popupDelay": 5000
    }'::jsonb
)
ON CONFLICT DO NOTHING;

-- Row Level Security (RLS) policies
ALTER TABLE content_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mobile_display_rules ENABLE ROW LEVEL SECURITY;

-- Policies for content_pages
CREATE POLICY "Allow public read access to published content" ON content_pages
    FOR SELECT USING (status = 'published');

CREATE POLICY "Allow authenticated users to manage content" ON content_pages
    FOR ALL USING (auth.role() = 'authenticated');

-- Policies for content_analytics
CREATE POLICY "Allow public read access to analytics" ON content_analytics
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to update analytics" ON content_analytics
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Policies for content_templates
CREATE POLICY "Allow public read access to active templates" ON content_templates
    FOR SELECT USING (is_active = true);

CREATE POLICY "Allow authenticated users to manage templates" ON content_templates
    FOR ALL USING (auth.role() = 'authenticated');

-- Policies for content_views
CREATE POLICY "Allow public insert access to views" ON content_views
    FOR INSERT WITH CHECK (true);

-- Policies for content_interactions
CREATE POLICY "Allow public insert access to interactions" ON content_interactions
    FOR INSERT WITH CHECK (true);

-- Policies for mobile_display_rules
CREATE POLICY "Allow public read access to active rules" ON mobile_display_rules
    FOR SELECT USING (is_active = true);

CREATE POLICY "Allow authenticated users to manage rules" ON mobile_display_rules
    FOR ALL USING (auth.role() = 'authenticated');
