import { Router } from 'express';
import { getSupabaseClient } from '../services/supabaseService';

// Demo fallback data for environments without DB configured
const demoLanguages = [
  { id: 'en', code: 'en', name: 'English', native_name: 'English', direction: 'ltr', is_active: true, is_default: true, flag_emoji: '🇺🇸' },
  { id: 'es', code: 'es', name: 'Spanish', native_name: 'Español', direction: 'ltr', is_active: true, is_default: false, flag_emoji: '🇪🇸' },
  { id: 'fr', code: 'fr', name: 'French', native_name: 'Français', direction: 'ltr', is_active: true, is_default: false, flag_emoji: '🇫🇷' },
  { id: 'de', code: 'de', name: 'German', native_name: 'Deutsch', direction: 'ltr', is_active: true, is_default: false, flag_emoji: '🇩🇪' },
  { id: 'it', code: 'it', name: 'Italian', native_name: 'Italiano', direction: 'ltr', is_active: true, is_default: false, flag_emoji: '🇮🇹' },
  { id: 'pt', code: 'pt', name: 'Portuguese', native_name: 'Português', direction: 'ltr', is_active: true, is_default: false, flag_emoji: '🇵🇹' },
  { id: 'ru', code: 'ru', name: 'Russian', native_name: 'Русский', direction: 'ltr', is_active: true, is_default: false, flag_emoji: '🇷🇺' },
  { id: 'zh', code: 'zh', name: 'Chinese', native_name: '中文', direction: 'ltr', is_active: true, is_default: false, flag_emoji: '🇨🇳' },
  { id: 'ja', code: 'ja', name: 'Japanese', native_name: '日本語', direction: 'ltr', is_active: true, is_default: false, flag_emoji: '🇯🇵' },
  { id: 'ko', code: 'ko', name: 'Korean', native_name: '한국어', direction: 'ltr', is_active: true, is_default: false, flag_emoji: '🇰🇷' },
  { id: 'ar', code: 'ar', name: 'Arabic', native_name: 'العربية', direction: 'rtl', is_active: true, is_default: false, flag_emoji: '🇸🇦' },
  { id: 'hi', code: 'hi', name: 'Hindi', native_name: 'हिन्दी', direction: 'ltr', is_active: true, is_default: false, flag_emoji: '🇮🇳' },
  { id: 'th', code: 'th', name: 'Thai', native_name: 'ไทย', direction: 'ltr', is_active: true, is_default: false, flag_emoji: '🇹🇭' },
  { id: 'vi', code: 'vi', name: 'Vietnamese', native_name: 'Tiếng Việt', direction: 'ltr', is_active: true, is_default: false, flag_emoji: '🇻🇳' },
  { id: 'id', code: 'id', name: 'Indonesian', native_name: 'Bahasa Indonesia', direction: 'ltr', is_active: true, is_default: false, flag_emoji: '🇮🇩' },
  { id: 'lo', code: 'lo', name: 'Lao', native_name: 'ລາວ', direction: 'ltr', is_active: true, is_default: false, flag_emoji: '🇱🇦' },
  { id: 'my', code: 'my', name: 'Burmese', native_name: 'မြန်မာ', direction: 'ltr', is_active: true, is_default: false, flag_emoji: '🇲🇲' },
];

const demoKeys = [
  { key: 'ui.welcome.title', category: 'ui', description: 'Welcome screen title' },
  { key: 'ui.welcome.subtitle', category: 'ui', description: 'Welcome screen subtitle' },
  { key: 'ui.button.save', category: 'ui', description: 'Save button text' },
  { key: 'ui.button.cancel', category: 'ui', description: 'Cancel button text' },
  { key: 'nav.home', category: 'navigation', description: 'Home' },
  { key: 'nav.settings', category: 'navigation', description: 'Settings' },
  { key: 'auth.login', category: 'auth', description: 'Login' },
  { key: 'auth.register', category: 'auth', description: 'Register' },
  { key: 'error.network.message', category: 'errors', description: 'Network error message' },
  { key: 'success.save.message', category: 'success', description: 'Save success message' },
];

const demoEnMap: Record<string, string> = {
  'ui.welcome.title': 'Welcome to Bondarys',
  'ui.welcome.subtitle': 'Connect with your family safely',
  'ui.button.save': 'Save',
  'ui.button.cancel': 'Cancel',
  'nav.home': 'Home',
  'nav.settings': 'Settings',
  'auth.login': 'Login',
  'auth.register': 'Register',
  'error.network.message': 'Please check your internet connection and try again.',
  'success.save.message': 'Your changes have been saved.',
};

function getClientOrNull() {
  try {
    return getSupabaseClient();
  } catch {
    return null;
  }
}

const router = Router();

// GET /cms/localization/languages
router.get('/languages', async (_req, res) => {
  try {
    const supabase = getClientOrNull();
    if (!supabase) {
      const sorted = [...demoLanguages].sort((a, b) => (b.is_default === true ? 1 : 0) - (a.is_default === true ? 1 : 0) || a.code.localeCompare(b.code));
      return res.json({ languages: sorted });
    }
    const { data, error } = await supabase
      .from('languages')
      .select('id, code, name, native_name, direction, is_active, is_default, flag_emoji')
      .order('is_default', { ascending: false })
      .order('code', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });

    const result = (data && data.length > 0) ? data : demoLanguages;
    return res.json({ languages: result });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to load languages' });
  }
});

// POST /cms/localization/languages
router.post('/languages', async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { code, name, native_name, direction = 'ltr', is_active = true, is_default = false, flag_emoji } = req.body || {};

    if (!code || !name) return res.status(400).json({ error: 'code and name are required' });

    // Ensure only one default language
    if (is_default) {
      await supabase.from('languages').update({ is_default: false }).neq('code', code);
    }

    const { data, error } = await supabase
      .from('languages')
      .upsert({ code, name, native_name: native_name || name, direction, is_active, is_default, flag_emoji }, { onConflict: 'code' })
      .select('id, code, name, native_name, direction, is_active, is_default, flag_emoji')
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ language: data });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to create language' });
  }
});

// PUT /cms/localization/languages/:id
router.put('/languages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseClient();
    const updates = req.body || {};

    if (updates.is_default === true) {
      await supabase.from('languages').update({ is_default: false }).neq('id', id);
    }

    const { data, error } = await supabase
      .from('languages')
      .update(updates)
      .eq('id', id)
      .select('id, code, name, native_name, direction, is_active, is_default, flag_emoji')
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ language: data });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to update language' });
  }
});

// DELETE /cms/localization/languages/:id
router.delete('/languages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('languages').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to delete language' });
  }
});

// GET /cms/localization/categories
router.get('/categories', async (_req, res) => {
  try {
    const supabase = getClientOrNull();
    if (!supabase) {
      const unique = Array.from(new Set(demoKeys.map(k => k.category)));
      const categories = unique.map((name: string) => ({ id: name, name, description: '', color: '#6B7280' }));
      return res.json(categories);
    }
    const { data, error } = await supabase
      .from('translation_keys')
      .select('category')
      .eq('is_active', true);

    if (error) return res.status(500).json({ error: error.message });

    const unique = Array.from(new Set((data || []).map((r: any) => r.category))).filter(Boolean);
    const categories = unique.map((name: string) => ({ id: name, name, description: '', color: '#6B7280' }));
    return res.json(categories);
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to load categories' });
  }
});

// GET /cms/localization/keys
router.get('/keys', async (req, res) => {
  try {
    const supabase = getClientOrNull();
    const { category, search, active_only } = req.query as any;

    if (!supabase) {
      const base = demoKeys;
      const filtered = base
        .filter(k => !category || k.category === category)
        .filter(k => !search || k.key.toLowerCase().includes(String(search).toLowerCase()));
      return res.json({ keys: filtered });
    }

    let query = supabase.from('translation_keys').select('id, key, category, description, context, is_active');
    if (category) query = query.eq('category', category);
    if (active_only === 'true') query = query.eq('is_active', true);
    if (search) query = query.ilike('key', `%${search}%`);
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ keys: data || [] });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to load translation keys' });
  }
});

// GET /cms/timezones
router.get('/timezones', async (_req, res) => {
  // Static canonical list sufficient for clients; store in DB later if needed
  const timezones = [
    { id: 'America/New_York', name: 'Eastern Time', offset: 'UTC-05:00', region: 'North America' },
    { id: 'America/Chicago', name: 'Central Time', offset: 'UTC-06:00', region: 'North America' },
    { id: 'America/Denver', name: 'Mountain Time', offset: 'UTC-07:00', region: 'North America' },
    { id: 'America/Los_Angeles', name: 'Pacific Time', offset: 'UTC-08:00', region: 'North America' },
    { id: 'Europe/London', name: 'Greenwich Mean Time', offset: 'UTC+00:00', region: 'Europe' },
    { id: 'Europe/Paris', name: 'Central European Time', offset: 'UTC+01:00', region: 'Europe' },
    { id: 'Asia/Tokyo', name: 'Japan Standard Time', offset: 'UTC+09:00', region: 'Asia' },
    { id: 'Asia/Shanghai', name: 'China Standard Time', offset: 'UTC+08:00', region: 'Asia' },
    { id: 'Australia/Sydney', name: 'Australian Eastern Time', offset: 'UTC+10:00', region: 'Australia' },
  ];
  return res.json({ timezones });
});

// GET /cms/localization/translations
router.get('/translations', async (req, res) => {
  try {
    const supabase = getClientOrNull();
    const {
      language_id: languageId,
      category,
      approved_only: approvedOnly,
      page = '1',
      page_size = '50',
      search,
      sort = 'updated_at',
      direction = 'desc'
    } = req.query as Record<string, string>;

    const pageNum = Math.max(parseInt(String(page)) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(String(page_size)) || 50, 1), 200);
    const from = (pageNum - 1) * pageSize;
    const to = from + pageSize - 1;

    if (!supabase) {
      // Demo: return a paginated list based on demo keys and English values
      const desiredCategory = category && category !== 'all' ? String(category) : undefined;
      const filtered = demoKeys
        .filter(k => !desiredCategory || k.category === desiredCategory)
        .filter(k => !search || k.key.toLowerCase().includes(String(search).toLowerCase()));
      const slice = filtered.slice(from, to + 1);
      const translations = slice.map(k => ({
        id: `${k.key}-en`,
        value: demoEnMap[k.key] || '',
        is_approved: true,
        approved_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        translation_keys: { id: k.key, key: k.key, category: k.category, description: k.description, context: 'mobile_app', is_active: true },
        languages: { id: 'en', code: 'en' },
      }));
      return res.json({ translations });
    }

    let query = supabase
      .from('translations')
      .select('id, value, is_approved, approved_at, created_at, updated_at, translation_keys!inner(id, key, category, description, context, is_active), languages!inner(id, code)');

    if (languageId) query = query.eq('language_id', languageId);
    if (category && category !== 'all') query = query.eq('translation_keys.category', category);
    if (approvedOnly === 'true') query = query.eq('is_approved', true);
    if (search) query = query.ilike('translation_keys.key', `%${search}%`);

    // Sorting
    const validSort = ['created_at', 'updated_at', 'is_approved'];
    const sortCol = validSort.includes(sort) ? sort : 'updated_at';
    query = query.order(sortCol as any, { ascending: String(direction).toLowerCase() === 'asc' });

    // Pagination
    query = query.range(from, to);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    let translations = (data || []).map((row: any) => ({
      id: row.id,
      value: row.value,
      is_approved: row.is_approved,
      approved_at: row.approved_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
      translation_keys: row.translation_keys,
      languages: row.languages
    }));

    if (!translations || translations.length === 0) {
      const desiredCategory = category && category !== 'all' ? String(category) : undefined;
      const fallback = demoKeys
        .filter(k => !desiredCategory || k.category === desiredCategory)
        .filter(k => !search || k.key.toLowerCase().includes(String(search).toLowerCase()))
        .slice(from, to + 1)
        .map(k => ({
          id: `${k.key}-en`,
          value: demoEnMap[k.key] || '',
          is_approved: true,
          approved_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          translation_keys: { id: k.key, key: k.key, category: k.category, description: k.description, context: 'mobile_app', is_active: true },
          languages: { id: 'en', code: 'en' },
        }));
      translations = fallback;
    }

    return res.json({ translations });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to load translations' });
  }
});

// GET /cms/localization/translations/:langCode -> map of key -> value
router.get('/translations/:langCode', async (req, res) => {
  try {
    const { langCode } = req.params;
    const supabase = getClientOrNull();

    if (!supabase) {
      // Demo: return English map or empty for other codes
      return res.json({ translations: langCode === 'en' ? demoEnMap : {} });
    }

    const { data: lang } = await supabase
      .from('languages')
      .select('id, code')
      .eq('code', langCode)
      .single();

    if (!lang) return res.json({ translations: {} });

    const { data, error } = await supabase
      .from('translations')
      .select('value, translation_keys!inner(key), is_approved')
      .eq('language_id', lang.id)
      .or('is_approved.is.null,is_approved.eq.true');

    if (error) return res.status(500).json({ error: error.message });

    const map: Record<string, string> = {};
    (data || []).forEach((row: any) => {
      if (row.translation_keys?.key) map[row.translation_keys.key] = row.value;
    });

    if (Object.keys(map).length === 0 && langCode === 'en') {
      return res.json({ translations: demoEnMap });
    }

    return res.json({ translations: map });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to load translations for language' });
  }
});

// POST /cms/localization/translations
router.post('/translations', async (req, res) => {
  try {
    const { key, value, language, category, description, isActive, isApproved } = req.body || {};
    if (!key || !value || !language) {
      return res.status(400).json({ error: 'key, value, and language are required' });
    }

    const supabase = getSupabaseClient();

    // Upsert key
    const { data: upsertKey, error: keyErr } = await supabase
      .from('translation_keys')
      .upsert({ key, category: category || 'general', description: description || null, is_active: isActive !== false, context: 'mobile_app' })
      .select('id')
      .single();
    if (keyErr) return res.status(500).json({ error: keyErr.message });

    // Find language id
    const { data: lang, error: langErr } = await supabase
      .from('languages')
      .select('id, code')
      .eq('code', language)
      .single();
    if (langErr || !lang) return res.status(400).json({ error: 'Invalid language' });

    // Upsert translation
    const { data: upsertTx, error: txErr } = await supabase
      .from('translations')
      .upsert({ key_id: upsertKey.id, language_id: lang.id, value, is_approved: Boolean(isApproved) })
      .select('id, value, is_approved, key_id, language_id')
      .single();

    if (txErr) return res.status(500).json({ error: txErr.message });

    return res.status(201).json({ translation: upsertTx });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to create translation' });
  }
});

// PUT /cms/localization/translations/:id
router.put('/translations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { key, value, language, category, description, isActive, isApproved } = req.body || {};

    const supabase = getSupabaseClient();

    // Optionally update key metadata if provided
    if (key || category || description || typeof isActive === 'boolean') {
      // Need to locate key_id from translation
      const { data: existing } = await supabase
        .from('translations')
        .select('key_id')
        .eq('id', id)
        .single();

      if (existing?.key_id) {
        await supabase
          .from('translation_keys')
          .update({
            ...(key ? { key } : {}),
            ...(category ? { category } : {}),
            ...(typeof isActive === 'boolean' ? { is_active: isActive } : {}),
            ...(description ? { description } : {})
          })
          .eq('id', existing.key_id);
      }
    }

    // If language code wants to change, resolve to language_id
    let updatePayload: any = {};
    if (typeof value === 'string') updatePayload.value = value;
    if (typeof isApproved === 'boolean') updatePayload.is_approved = isApproved;
    if (language) {
      const { data: lang } = await supabase
        .from('languages')
        .select('id')
        .eq('code', language)
        .single();
      if (lang?.id) updatePayload.language_id = lang.id;
    }

    const { data, error } = await supabase
      .from('translations')
      .update(updatePayload)
      .eq('id', id)
      .select('id, value, is_approved, key_id, language_id')
      .single();

    if (error) return res.status(500).json({ error: error.message });

    return res.json({ translation: data });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to update translation' });
  }
});

// DELETE /cms/localization/translations/:id
router.delete('/translations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('translations').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to delete translation' });
  }
});

export default router;


