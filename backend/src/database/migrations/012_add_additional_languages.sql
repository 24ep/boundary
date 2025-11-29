-- Add additional languages for mobile localization and seed placeholder translations

-- Insert languages if they don't already exist
INSERT INTO languages (code, name, native_name, direction, is_active, is_default, flag_emoji)
VALUES
  ('th', 'Thai', 'ไทย', 'ltr', true, false, '🇹🇭'),
  ('vi', 'Vietnamese', 'Tiếng Việt', 'ltr', true, false, '🇻🇳'),
  ('id', 'Indonesian', 'Bahasa Indonesia', 'ltr', true, false, '🇮🇩'),
  ('lo', 'Lao', 'ລາວ', 'ltr', true, false, '🇱🇦'),
  ('my', 'Burmese', 'မြန်မာ', 'ltr', true, false, '🇲🇲')
ON CONFLICT (code) DO NOTHING;

-- Seed translations for the new languages by copying English values where missing
-- This ensures the app shows content immediately; translators can update later
INSERT INTO translations (key_id, language_id, value, plural_forms, variables, is_approved, created_at, updated_at)
SELECT
  t_en.key_id,
  l_new.id AS language_id,
  t_en.value,
  t_en.plural_forms,
  t_en.variables,
  false AS is_approved,
  NOW(),
  NOW()
FROM translations t_en
JOIN languages l_en ON l_en.id = t_en.language_id AND l_en.code = 'en'
JOIN languages l_new ON l_new.code IN ('th','vi','id','lo','my')
LEFT JOIN translations t_existing ON t_existing.key_id = t_en.key_id AND t_existing.language_id = l_new.id
WHERE t_existing.id IS NULL;


