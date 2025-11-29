-- Localization CMS Migration
-- This migration creates tables for app localization management

-- Languages Table
CREATE TABLE IF NOT EXISTS languages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(5) NOT NULL UNIQUE, -- e.g., 'en', 'es', 'fr-CA'
    name VARCHAR(100) NOT NULL, -- e.g., 'English', 'Spanish', 'French (Canada)'
    native_name VARCHAR(100) NOT NULL, -- e.g., 'English', 'Español', 'Français'
    direction VARCHAR(3) DEFAULT 'ltr' CHECK (direction IN ('ltr', 'rtl')),
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    flag_emoji VARCHAR(10), -- e.g., '🇺🇸', '🇪🇸', '🇨🇦'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Translation Keys Table
CREATE TABLE IF NOT EXISTS translation_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) NOT NULL UNIQUE, -- e.g., 'welcome.title', 'button.save'
    category VARCHAR(100) NOT NULL, -- e.g., 'ui', 'marketing', 'errors'
    description TEXT,
    context TEXT, -- usage context and notes
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Translations Table
CREATE TABLE IF NOT EXISTS translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_id UUID REFERENCES translation_keys(id) ON DELETE CASCADE,
    language_id UUID REFERENCES languages(id) ON DELETE CASCADE,
    value TEXT NOT NULL,
    plural_forms JSONB, -- for languages with plural forms
    variables JSONB, -- for dynamic content variables
    is_approved BOOLEAN DEFAULT false,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(key_id, language_id)
);

-- Localization Projects Table
CREATE TABLE IF NOT EXISTS localization_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    default_language_id UUID REFERENCES languages(id) ON DELETE SET NULL,
    target_languages UUID[] DEFAULT '{}', -- array of language IDs
    completion_percentage JSONB DEFAULT '{}', -- per language completion
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Translation Comments Table
CREATE TABLE IF NOT EXISTS translation_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    translation_id UUID REFERENCES translations(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    comment_type VARCHAR(50) DEFAULT 'note' CHECK (comment_type IN ('note', 'suggestion', 'question', 'issue')),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Translation History Table
CREATE TABLE IF NOT EXISTS translation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    translation_id UUID REFERENCES translations(id) ON DELETE CASCADE,
    old_value TEXT,
    new_value TEXT,
    change_type VARCHAR(50) NOT NULL CHECK (change_type IN ('create', 'update', 'delete', 'approve')),
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default languages
INSERT INTO languages (code, name, native_name, direction, is_active, is_default, flag_emoji) VALUES
('en', 'English', 'English', 'ltr', true, true, '🇺🇸'),
('es', 'Spanish', 'Español', 'ltr', true, false, '🇪🇸'),
('fr', 'French', 'Français', 'ltr', true, false, '🇫🇷'),
('de', 'German', 'Deutsch', 'ltr', true, false, '🇩🇪'),
('it', 'Italian', 'Italiano', 'ltr', true, false, '🇮🇹'),
('pt', 'Portuguese', 'Português', 'ltr', true, false, '🇵🇹'),
('ru', 'Russian', 'Русский', 'ltr', true, false, '🇷🇺'),
('zh', 'Chinese', '中文', 'ltr', true, false, '🇨🇳'),
('ja', 'Japanese', '日本語', 'ltr', true, false, '🇯🇵'),
('ko', 'Korean', '한국어', 'ltr', true, false, '🇰🇷'),
('ar', 'Arabic', 'العربية', 'rtl', true, false, '🇸🇦'),
('hi', 'Hindi', 'हिन्दी', 'ltr', true, false, '🇮🇳')
ON CONFLICT (code) DO NOTHING;

-- Insert default translation keys
INSERT INTO translation_keys (key, category, description, context) VALUES
-- UI Elements
('ui.welcome.title', 'ui', 'Welcome screen title', 'Main welcome screen heading'),
('ui.welcome.subtitle', 'ui', 'Welcome screen subtitle', 'Main welcome screen subheading'),
('ui.button.save', 'ui', 'Save button text', 'Generic save button'),
('ui.button.cancel', 'ui', 'Cancel button text', 'Generic cancel button'),
('ui.button.submit', 'ui', 'Submit button text', 'Generic submit button'),
('ui.button.delete', 'ui', 'Delete button text', 'Generic delete button'),
('ui.button.edit', 'ui', 'Edit button text', 'Generic edit button'),
('ui.button.add', 'ui', 'Add button text', 'Generic add button'),
('ui.button.close', 'ui', 'Close button text', 'Generic close button'),
('ui.button.back', 'ui', 'Back button text', 'Generic back button'),
('ui.button.next', 'ui', 'Next button text', 'Generic next button'),
('ui.button.previous', 'ui', 'Previous button text', 'Generic previous button'),

-- Marketing Content
('marketing.slide1.title', 'marketing', 'First marketing slide title', 'Onboarding slide 1 title'),
('marketing.slide1.subtitle', 'marketing', 'First marketing slide subtitle', 'Onboarding slide 1 subtitle'),
('marketing.slide1.description', 'marketing', 'First marketing slide description', 'Onboarding slide 1 description'),
('marketing.slide1.feature1', 'marketing', 'First marketing slide feature 1', 'Onboarding slide 1 feature 1'),
('marketing.slide1.feature2', 'marketing', 'First marketing slide feature 2', 'Onboarding slide 1 feature 2'),
('marketing.slide1.feature3', 'marketing', 'First marketing slide feature 3', 'Onboarding slide 1 feature 3'),

-- Error Messages
('error.network.title', 'errors', 'Network error title', 'Network connectivity error'),
('error.network.message', 'errors', 'Network error message', 'Network connectivity error description'),
('error.auth.title', 'errors', 'Authentication error title', 'Authentication error'),
('error.auth.message', 'errors', 'Authentication error message', 'Authentication error description'),
('error.validation.title', 'errors', 'Validation error title', 'Form validation error'),
('error.validation.message', 'errors', 'Validation error message', 'Form validation error description'),

-- Success Messages
('success.save.title', 'success', 'Save success title', 'Successful save operation'),
('success.save.message', 'success', 'Save success message', 'Successful save operation description'),
('success.delete.title', 'success', 'Delete success title', 'Successful delete operation'),
('success.delete.message', 'success', 'Delete success message', 'Successful delete operation description'),

-- Navigation
('nav.home', 'navigation', 'Home navigation item', 'Main navigation home link'),
('nav.profile', 'navigation', 'Profile navigation item', 'Main navigation profile link'),
('nav.settings', 'navigation', 'Settings navigation item', 'Main navigation settings link'),
('nav.family', 'navigation', 'Family navigation item', 'Main navigation family link'),
('nav.safety', 'navigation', 'Safety navigation item', 'Main navigation safety link'),

-- Modal Content
('modal.welcome.title', 'modal', 'Welcome modal title', 'Welcome popup modal title'),
('modal.welcome.message', 'modal', 'Welcome modal message', 'Welcome popup modal message'),
('modal.welcome.button', 'modal', 'Welcome modal button', 'Welcome popup modal button text'),
('modal.feature.title', 'modal', 'Feature modal title', 'Feature announcement modal title'),
('modal.feature.message', 'modal', 'Feature modal message', 'Feature announcement modal message')
ON CONFLICT (key) DO NOTHING;

-- Insert default translations for English
INSERT INTO translations (key_id, language_id, value, is_approved, approved_at)
SELECT 
    tk.id,
    l.id,
    CASE tk.key
        WHEN 'ui.welcome.title' THEN 'Welcome to Bondarys'
        WHEN 'ui.welcome.subtitle' THEN 'Connect with your family safely'
        WHEN 'ui.button.save' THEN 'Save'
        WHEN 'ui.button.cancel' THEN 'Cancel'
        WHEN 'ui.button.submit' THEN 'Submit'
        WHEN 'ui.button.delete' THEN 'Delete'
        WHEN 'ui.button.edit' THEN 'Edit'
        WHEN 'ui.button.add' THEN 'Add'
        WHEN 'ui.button.close' THEN 'Close'
        WHEN 'ui.button.back' THEN 'Back'
        WHEN 'ui.button.next' THEN 'Next'
        WHEN 'ui.button.previous' THEN 'Previous'
        WHEN 'marketing.slide1.title' THEN 'Stay Connected'
        WHEN 'marketing.slide1.subtitle' THEN 'With Your Family'
        WHEN 'marketing.slide1.description' THEN 'Keep your loved ones close with real-time location sharing, instant messaging, and family updates.'
        WHEN 'marketing.slide1.feature1' THEN 'Real-time location tracking'
        WHEN 'marketing.slide1.feature2' THEN 'Instant family messaging'
        WHEN 'marketing.slide1.feature3' THEN 'Safety alerts & notifications'
        WHEN 'error.network.title' THEN 'Connection Error'
        WHEN 'error.network.message' THEN 'Please check your internet connection and try again.'
        WHEN 'error.auth.title' THEN 'Authentication Error'
        WHEN 'error.auth.message' THEN 'Please log in again to continue.'
        WHEN 'error.validation.title' THEN 'Validation Error'
        WHEN 'error.validation.message' THEN 'Please check your input and try again.'
        WHEN 'success.save.title' THEN 'Saved Successfully'
        WHEN 'success.save.message' THEN 'Your changes have been saved.'
        WHEN 'success.delete.title' THEN 'Deleted Successfully'
        WHEN 'success.delete.message' THEN 'The item has been deleted.'
        WHEN 'nav.home' THEN 'Home'
        WHEN 'nav.profile' THEN 'Profile'
        WHEN 'nav.settings' THEN 'Settings'
        WHEN 'nav.family' THEN 'Family'
        WHEN 'nav.safety' THEN 'Safety'
        WHEN 'modal.welcome.title' THEN 'Welcome to Bondarys!'
        WHEN 'modal.welcome.message' THEN 'Get started with your family safety network.'
        WHEN 'modal.welcome.button' THEN 'Get Started'
        WHEN 'modal.feature.title' THEN 'New Feature Available'
        WHEN 'modal.feature.message' THEN 'Check out our latest safety features!'
        ELSE 'No translation found'
    END,
    true,
    NOW()
FROM translation_keys tk, languages l
WHERE l.code = 'en';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_translations_key_language ON translations(key_id, language_id);
CREATE INDEX IF NOT EXISTS idx_translations_language ON translations(language_id);
CREATE INDEX IF NOT EXISTS idx_translation_keys_category ON translation_keys(category);
CREATE INDEX IF NOT EXISTS idx_languages_active ON languages(is_active, is_default);
CREATE INDEX IF NOT EXISTS idx_translation_history_translation ON translation_history(translation_id);
CREATE INDEX IF NOT EXISTS idx_translation_comments_translation ON translation_comments(translation_id);

-- Create function to get translations for a language
CREATE OR REPLACE FUNCTION get_translations_for_language(lang_code VARCHAR(5))
RETURNS TABLE(key VARCHAR, value TEXT, category VARCHAR) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tk.key,
        t.value,
        tk.category
    FROM translation_keys tk
    LEFT JOIN translations t ON tk.id = t.key_id
    LEFT JOIN languages l ON t.language_id = l.id
    WHERE l.code = lang_code 
    AND tk.is_active = true
    AND (t.is_approved = true OR t.is_approved IS NULL)
    ORDER BY tk.category, tk.key;
END;
$$ LANGUAGE plpgsql;

-- Create function to get translation completion percentage
CREATE OR REPLACE FUNCTION get_translation_completion()
RETURNS TABLE(language_code VARCHAR, language_name VARCHAR, total_keys BIGINT, translated_keys BIGINT, completion_percentage NUMERIC) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.code,
        l.name,
        COUNT(tk.id) as total_keys,
        COUNT(t.id) as translated_keys,
        CASE 
            WHEN COUNT(tk.id) > 0 THEN ROUND((COUNT(t.id)::NUMERIC / COUNT(tk.id)::NUMERIC) * 100, 2)
            ELSE 0
        END as completion_percentage
    FROM languages l
    CROSS JOIN translation_keys tk
    LEFT JOIN translations t ON tk.id = t.key_id AND t.language_id = l.id AND t.is_approved = true
    WHERE l.is_active = true AND tk.is_active = true
    GROUP BY l.id, l.code, l.name
    ORDER BY completion_percentage DESC;
END;
$$ LANGUAGE plpgsql;
