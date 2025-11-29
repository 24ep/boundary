-- Seed additional common locale variants and copy English translations

-- 1) Insert additional locales if they don't exist
INSERT INTO languages (code, name, native_name, direction, is_active, is_default, flag_emoji)
VALUES
  ('es-MX','Spanish (Mexico)','Español (México)','ltr',true,false,'🇲🇽'),
  ('fr-CA','French (Canada)','Français (Canada)','ltr',true,false,'🇨🇦'),
  ('zh-TW','Chinese (Taiwan)','中文（台灣）','ltr',true,false,'🇹🇼'),
  ('pt-BR','Portuguese (Brazil)','Português (Brasil)','ltr',true,false,'🇧🇷'),
  ('en-GB','English (UK)','English (UK)','ltr',true,false,'🇬🇧'),
  ('en-AU','English (Australia)','English (Australia)','ltr',true,false,'🇦🇺'),
  ('ar-EG','Arabic (Egypt)','العربية (مصر)','rtl',true,false,'🇪🇬'),
  ('ar-SA','Arabic (Saudi Arabia)','العربية (السعودية)','rtl',true,false,'🇸🇦'),
  ('de-AT','German (Austria)','Deutsch (Österreich)','ltr',true,false,'🇦🇹'),
  ('de-CH','German (Switzerland)','Deutsch (Schweiz)','ltr',true,false,'🇨🇭')
ON CONFLICT (code) DO NOTHING;

-- 2) Copy English translations to these locales where missing (unapproved)
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
JOIN languages l_new ON l_new.code IN ('es-MX','fr-CA','zh-TW','pt-BR','en-GB','en-AU','ar-EG','ar-SA','de-AT','de-CH')
LEFT JOIN translations t_existing ON t_existing.key_id = t_en.key_id AND t_existing.language_id = l_new.id
WHERE t_existing.id IS NULL;


