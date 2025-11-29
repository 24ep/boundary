#!/usr/bin/env node

// Simple localization server to serve data to admin console
require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Languages endpoint
app.get('/api/cms/localization/languages', async (req, res) => {
  try {
    console.log('🌍 Fetching languages...');
    const { data, error } = await supabase
      .from('languages')
      .select('id, code, name, native_name, direction, is_active, is_default, flag_emoji')
      .order('is_default', { ascending: false })
      .order('code', { ascending: true });

    if (error) {
      console.error('❌ Languages error:', error.message);
      return res.status(500).json({ error: error.message });
    }

    console.log(`✅ Found ${data?.length || 0} languages`);
    res.json({ languages: data || [] });
  } catch (error) {
    console.error('❌ Languages error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Categories endpoint
app.get('/api/cms/localization/categories', async (req, res) => {
  try {
    console.log('📁 Fetching categories...');
    const { data, error } = await supabase
      .from('translation_keys')
      .select('category')
      .not('category', 'is', null);

    if (error) {
      console.error('❌ Categories error:', error.message);
      return res.status(500).json({ error: error.message });
    }

    // Get unique categories
    const categories = [...new Set(data?.map(item => item.category).filter(Boolean))].map(cat => ({
      id: cat,
      name: cat,
      description: `${cat} translations`,
      color: '#6B7280'
    }));

    console.log(`✅ Found ${categories.length} categories`);
    res.json(categories);
  } catch (error) {
    console.error('❌ Categories error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Translations endpoint
app.get('/api/cms/localization/translations', async (req, res) => {
  try {
    console.log('🔤 Fetching translations...');
    const { data, error } = await supabase
      .from('translations')
      .select(`
        id, value, is_approved, approved_at, created_at, updated_at,
        translation_keys!inner(id, key, category, description, context, is_active),
        languages!inner(id, code)
      `)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('❌ Translations error:', error.message);
      return res.status(500).json({ error: error.message });
    }

    console.log(`✅ Found ${data?.length || 0} translations`);
    res.json({ translations: data || [] });
  } catch (error) {
    console.error('❌ Translations error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Translation keys endpoint
app.get('/api/cms/localization/keys', async (req, res) => {
  try {
    console.log('🔑 Fetching translation keys...');
    const { data, error } = await supabase
      .from('translation_keys')
      .select('*')
      .order('category', { ascending: true });

    if (error) {
      console.error('❌ Translation keys error:', error.message);
      return res.status(500).json({ error: error.message });
    }

    console.log(`✅ Found ${data?.length || 0} translation keys`);
    res.json({ keys: data || [] });
  } catch (error) {
    console.error('❌ Translation keys error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/cms/localization/languages - Create new language
app.post('/api/cms/localization/languages', async (req, res) => {
  try {
    console.log('➕ Creating new language...');
    const { code, name, native_name, direction, flag_emoji, is_active, is_default } = req.body;

    // Validate required fields
    if (!code || !name) {
      return res.status(400).json({ error: 'Code and name are required' });
    }

    // If setting as default, unset other defaults first
    if (is_default) {
      await supabase
        .from('languages')
        .update({ is_default: false })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all except current
    }

    const { data, error } = await supabase
      .from('languages')
      .insert({
        code: code.toLowerCase(),
        name,
        native_name: native_name || name,
        direction: direction || 'ltr',
        flag_emoji: flag_emoji || '🌐',
        is_active: is_active !== false,
        is_default: is_default || false
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Create language error:', error.message);
      return res.status(500).json({ error: error.message });
    }

    console.log(`✅ Created language: ${data.name} (${data.code})`);
    res.json({ language: data });
  } catch (error) {
    console.error('❌ Create language error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/cms/localization/languages/:id - Update language
app.put('/api/cms/localization/languages/:id', async (req, res) => {
  try {
    console.log('✏️ Updating language...');
    const { id } = req.params;
    const { code, name, native_name, direction, flag_emoji, is_active, is_default } = req.body;

    // If setting as default, unset other defaults first
    if (is_default) {
      await supabase
        .from('languages')
        .update({ is_default: false })
        .neq('id', id);
    }

    const updateData = {};
    if (code) updateData.code = code.toLowerCase();
    if (name) updateData.name = name;
    if (native_name) updateData.native_name = native_name;
    if (direction) updateData.direction = direction;
    if (flag_emoji) updateData.flag_emoji = flag_emoji;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (is_default !== undefined) updateData.is_default = is_default;

    const { data, error } = await supabase
      .from('languages')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Update language error:', error.message);
      return res.status(500).json({ error: error.message });
    }

    console.log(`✅ Updated language: ${data.name} (${data.code})`);
    res.json({ language: data });
  } catch (error) {
    console.error('❌ Update language error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/cms/localization/languages/:id - Delete language
app.delete('/api/cms/localization/languages/:id', async (req, res) => {
  try {
    console.log('🗑️ Deleting language...');
    const { id } = req.params;

    // Check if language is default
    const { data: language } = await supabase
      .from('languages')
      .select('is_default')
      .eq('id', id)
      .single();

    if (language?.is_default) {
      return res.status(400).json({ error: 'Cannot delete default language' });
    }

    const { error } = await supabase
      .from('languages')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Delete language error:', error.message);
      return res.status(500).json({ error: error.message });
    }

    console.log(`✅ Deleted language with ID: ${id}`);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Delete language error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Timezone management endpoints
app.get('/api/cms/timezones', async (req, res) => {
  try {
    console.log('🌍 Fetching timezones...');
    // Return common timezones - in a real app, you might store these in a database
    const timezones = [
      { id: 'UTC', name: 'UTC', offset: '+00:00', region: 'Global' },
      { id: 'America/New_York', name: 'Eastern Time', offset: '-05:00', region: 'North America' },
      { id: 'America/Chicago', name: 'Central Time', offset: '-06:00', region: 'North America' },
      { id: 'America/Denver', name: 'Mountain Time', offset: '-07:00', region: 'North America' },
      { id: 'America/Los_Angeles', name: 'Pacific Time', offset: '-08:00', region: 'North America' },
      { id: 'Europe/London', name: 'GMT', offset: '+00:00', region: 'Europe' },
      { id: 'Europe/Paris', name: 'CET', offset: '+01:00', region: 'Europe' },
      { id: 'Europe/Berlin', name: 'CET', offset: '+01:00', region: 'Europe' },
      { id: 'Asia/Tokyo', name: 'JST', offset: '+09:00', region: 'Asia' },
      { id: 'Asia/Shanghai', name: 'CST', offset: '+08:00', region: 'Asia' },
      { id: 'Asia/Kolkata', name: 'IST', offset: '+05:30', region: 'Asia' },
      { id: 'Australia/Sydney', name: 'AEST', offset: '+10:00', region: 'Australia' }
    ];

    console.log(`✅ Found ${timezones.length} timezones`);
    res.json({ timezones });
  } catch (error) {
    console.error('❌ Timezones error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/cms/localization/translations - Create new translation
app.post('/api/cms/localization/translations', async (req, res) => {
  try {
    console.log('➕ Creating new translation...');
    const { key, value, language, category, description, isActive } = req.body;

    // Validate required fields
    if (!key || !value || !language) {
      return res.status(400).json({ error: 'Key, value, and language are required' });
    }

    // Get language ID
    const { data: langData } = await supabase
      .from('languages')
      .select('id')
      .eq('code', language)
      .single();

    if (!langData) {
      return res.status(400).json({ error: 'Invalid language code' });
    }

    // Get or create translation key
    let { data: keyData } = await supabase
      .from('translation_keys')
      .select('id')
      .eq('key', key)
      .single();

    if (!keyData) {
      const { data: newKeyData, error: keyError } = await supabase
        .from('translation_keys')
        .insert({
          key,
          category: category || 'general',
          description: description || '',
          context: 'mobile_app',
          is_active: true
        })
        .select()
        .single();

      if (keyError) {
        console.error('❌ Create key error:', keyError.message);
        return res.status(500).json({ error: keyError.message });
      }
      keyData = newKeyData;
    }

    // Create translation
    const { data, error } = await supabase
      .from('translations')
      .insert({
        key_id: keyData.id,
        language_id: langData.id,
        value,
        is_approved: true,
        approved_at: new Date().toISOString()
      })
      .select(`
        id, value, is_approved, approved_at, created_at, updated_at,
        translation_keys!inner(id, key, category, description, context, is_active),
        languages!inner(id, code)
      `)
      .single();

    if (error) {
      console.error('❌ Create translation error:', error.message);
      return res.status(500).json({ error: error.message });
    }

    console.log(`✅ Created translation: ${key} -> ${value}`);
    res.json({ translation: data });
  } catch (error) {
    console.error('❌ Create translation error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/cms/localization/translations/:id - Update translation
app.put('/api/cms/localization/translations/:id', async (req, res) => {
  try {
    console.log('✏️ Updating translation...');
    const { id } = req.params;
    const { value, isActive } = req.body;

    const updateData = {};
    if (value !== undefined) updateData.value = value;
    if (isActive !== undefined) updateData.is_approved = isActive;

    const { data, error } = await supabase
      .from('translations')
      .update(updateData)
      .eq('id', id)
      .select(`
        id, value, is_approved, approved_at, created_at, updated_at,
        translation_keys!inner(id, key, category, description, context, is_active),
        languages!inner(id, code)
      `)
      .single();

    if (error) {
      console.error('❌ Update translation error:', error.message);
      return res.status(500).json({ error: error.message });
    }

    console.log(`✅ Updated translation with ID: ${id}`);
    res.json({ translation: data });
  } catch (error) {
    console.error('❌ Update translation error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/cms/localization/translations/:id - Delete translation
app.delete('/api/cms/localization/translations/:id', async (req, res) => {
  try {
    console.log('🗑️ Deleting translation...');
    const { id } = req.params;

    const { error } = await supabase
      .from('translations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Delete translation error:', error.message);
      return res.status(500).json({ error: error.message });
    }

    console.log(`✅ Deleted translation with ID: ${id}`);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Delete translation error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Simple localization server running on http://localhost:${PORT}`);
  console.log(`📊 Available endpoints:`);
  console.log(`   GET /api/cms/localization/languages`);
  console.log(`   POST /api/cms/localization/languages`);
  console.log(`   PUT /api/cms/localization/languages/:id`);
  console.log(`   DELETE /api/cms/localization/languages/:id`);
  console.log(`   GET /api/cms/localization/categories`);
  console.log(`   GET /api/cms/localization/translations`);
  console.log(`   POST /api/cms/localization/translations`);
  console.log(`   PUT /api/cms/localization/translations/:id`);
  console.log(`   DELETE /api/cms/localization/translations/:id`);
  console.log(`   GET /api/cms/localization/keys`);
  console.log(`   GET /api/cms/timezones`);
  console.log(`   GET /health`);
});
