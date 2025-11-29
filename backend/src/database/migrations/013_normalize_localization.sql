-- Normalize translation contexts to 'mobile_app' and seed missing translations

-- 1) Ensure languages exist
INSERT INTO languages (code, name, native_name, direction, is_active, is_default, flag_emoji)
VALUES
('en','English','English','ltr',true,true,'🇺🇸'),
('th','Thai','ไทย','ltr',true,false,'🇹🇭'),
('vi','Vietnamese','Tiếng Việt','ltr',true,false,'🇻🇳'),
('id','Indonesian','Bahasa Indonesia','ltr',true,false,'🇮🇩'),
('lo','Lao','ລາວ','ltr',true,false,'🇱🇦'),
('my','Burmese','မြန်မာ','ltr',true,false,'🇲🇲')
ON CONFLICT (code) DO NOTHING;

-- 2) Normalize existing translation_keys contexts to 'mobile_app'
UPDATE translation_keys
SET context = 'mobile_app'
WHERE context IS NULL OR context <> 'mobile_app';

-- 3) Upsert expected UI keys with context='mobile_app'
INSERT INTO translation_keys (key, category, description, context, is_active)
VALUES
('ui.welcome.title','ui','Welcome screen title','mobile_app',true),
('ui.welcome.subtitle','ui','Welcome screen subtitle','mobile_app',true),
('ui.button.save','ui','Save button text','mobile_app',true),
('ui.button.cancel','ui','Cancel button text','mobile_app',true),
('ui.button.submit','ui','Submit button text','mobile_app',true),
('ui.button.delete','ui','Delete button text','mobile_app',true),
('ui.button.edit','ui','Edit button text','mobile_app',true),
('ui.button.add','ui','Add button text','mobile_app',true),
('ui.button.close','ui','Close button text','mobile_app',true),
('ui.button.back','ui','Back button text','mobile_app',true),
('ui.button.next','ui','Next button text','mobile_app',true),
('ui.button.previous','ui','Previous button text','mobile_app',true)
ON CONFLICT (key) DO UPDATE SET context='mobile_app', is_active=true;

-- 4) Seed English translations for those keys if missing (approved)
INSERT INTO translations (key_id, language_id, value, is_approved, approved_at)
SELECT tk.id, l.id,
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
  END,
  true, NOW()
FROM translation_keys tk
JOIN languages l ON l.code='en'
LEFT JOIN translations t ON t.key_id=tk.id AND t.language_id=l.id
WHERE tk.context='mobile_app' AND t.id IS NULL;

-- 5) Copy English values to target languages where missing (unapproved)
INSERT INTO translations (key_id, language_id, value, is_approved, created_at, updated_at)
SELECT t_en.key_id, l_new.id, t_en.value, false, NOW(), NOW()
FROM translations t_en
JOIN languages l_en ON l_en.id=t_en.language_id AND l_en.code='en'
JOIN languages l_new ON l_new.code IN ('th','vi','id','lo','my')
LEFT JOIN translations t_existing ON t_existing.key_id=t_en.key_id AND t_existing.language_id=l_new.id
WHERE t_existing.id IS NULL;


