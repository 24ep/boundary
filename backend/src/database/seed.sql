-- 30-seed.sql
-- This script replaces all mockup data with real database entries

-- Clear existing data (in development only)
TRUNCATE TABLE 
  family_members,
  families,
  users,
  chat_rooms,
  messages,
  user_locations,
  geofences,
  safety_alerts,
  files,
  events,
  tasks,
  notes,
  notifications
CASCADE;

-- Insert sample users
INSERT INTO users (id, email, password_hash, first_name, last_name, phone, avatar_url, is_verified, created_at, updated_at) VALUES
('user-1', 'john.doe@example.com', '$2b$10$example_hash_1', 'John', 'Doe', '+1234567890', 'https://via.placeholder.com/150/4F46E5/FFFFFF?text=JD', true, NOW(), NOW()),
('user-2', 'jane.doe@example.com', '$2b$10$example_hash_2', 'Jane', 'Doe', '+1234567891', 'https://via.placeholder.com/150/10B981/FFFFFF?text=JD', true, NOW(), NOW()),
('user-3', 'mike.smith@example.com', '$2b$10$example_hash_3', 'Mike', 'Smith', '+1234567892', 'https://via.placeholder.com/150/F59E0B/FFFFFF?text=MS', true, NOW(), NOW()),
('user-4', 'sarah.johnson@example.com', '$2b$10$example_hash_4', 'Sarah', 'Johnson', '+1234567893', 'https://via.placeholder.com/150/EF4444/FFFFFF?text=SJ', true, NOW(), NOW()),
('user-5', 'david.wilson@example.com', '$2b$10$example_hash_5', 'David', 'Wilson', '+1234567894', 'https://via.placeholder.com/150/8B5CF6/FFFFFF?text=DW', true, NOW(), NOW());

-- Insert sample families
INSERT INTO families (id, name, description, created_by, created_at, updated_at) VALUES
('hourse-1', 'Doe hourse', 'The main Doe hourse household', 'user-1', NOW(), NOW()),
('hourse-2', 'Smith hourse', 'The Smith hourse household', 'user-3', NOW(), NOW()),
('hourse-3', 'Johnson hourse', 'The Johnson hourse household', 'user-4', NOW(), NOW());

-- Insert hourse members
INSERT INTO family_members (id, family_id, user_id, role, status, joined_at, created_at, updated_at) VALUES
('fm-1', 'hourse-1', 'user-1', 'admin', 'active', NOW(), NOW(), NOW()),
('fm-2', 'hourse-1', 'user-2', 'member', 'active', NOW(), NOW(), NOW()),
('fm-3', 'hourse-2', 'user-3', 'admin', 'active', NOW(), NOW(), NOW()),
('fm-4', 'hourse-2', 'user-4', 'member', 'active', NOW(), NOW(), NOW()),
('fm-5', 'hourse-3', 'user-5', 'admin', 'active', NOW(), NOW(), NOW());

-- Insert chat rooms
INSERT INTO chat_rooms (id, family_id, name, description, type, created_by, created_at, updated_at) VALUES
('chat-1', 'hourse-1', 'Doe hourse Chat', 'Main hourse group chat', 'hourse', 'user-1', NOW(), NOW()),
('chat-2', 'hourse-2', 'Smith hourse Chat', 'Main hourse group chat', 'hourse', 'user-3', NOW(), NOW()),
('chat-3', 'hourse-3', 'Johnson hourse Chat', 'Main hourse group chat', 'hourse', 'user-5', NOW(), NOW());

-- Insert chat participants
INSERT INTO chat_participants (id, chat_room_id, user_id, role, joined_at, created_at, updated_at) VALUES
('cp-1', 'chat-1', 'user-1', 'admin', NOW(), NOW(), NOW()),
('cp-2', 'chat-1', 'user-2', 'member', NOW(), NOW(), NOW()),
('cp-3', 'chat-2', 'user-3', 'admin', NOW(), NOW(), NOW()),
('cp-4', 'chat-2', 'user-4', 'member', NOW(), NOW(), NOW()),
('cp-5', 'chat-3', 'user-5', 'admin', NOW(), NOW(), NOW());

-- Insert sample messages
INSERT INTO messages (id, chat_room_id, user_id, content, message_type, created_at, updated_at) VALUES
('msg-1', 'chat-1', 'user-1', 'Welcome to our hourse chat!', 'text', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
('msg-2', 'chat-1', 'user-2', 'Thanks for setting this up!', 'text', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour'),
('msg-3', 'chat-1', 'user-1', 'How is everyone doing today?', 'text', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes'),
('msg-4', 'chat-2', 'user-3', 'hourse dinner at 6 PM tonight', 'text', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour'),
('msg-5', 'chat-2', 'user-4', 'I will be there!', 'text', NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '45 minutes');

-- Insert user locations
INSERT INTO user_locations (id, user_id, latitude, longitude, address, accuracy, created_at, updated_at) VALUES
('loc-1', 'user-1', 37.7749, -122.4194, '123 Main St, San Francisco, CA', 10.5, NOW() - INTERVAL '5 minutes', NOW() - INTERVAL '5 minutes'),
('loc-2', 'user-2', 37.7849, -122.4094, '456 Office Blvd, San Francisco, CA', 8.2, NOW() - INTERVAL '10 minutes', NOW() - INTERVAL '10 minutes'),
('loc-3', 'user-3', 37.7649, -122.4294, '789 School Ave, San Francisco, CA', 12.1, NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '15 minutes'),
('loc-4', 'user-4', 37.7549, -122.4394, '321 Park St, San Francisco, CA', 9.8, NOW() - INTERVAL '20 minutes', NOW() - INTERVAL '20 minutes'),
('loc-5', 'user-5', 37.7449, -122.4494, '654 Market St, San Francisco, CA', 11.3, NOW() - INTERVAL '25 minutes', NOW() - INTERVAL '25 minutes');

-- Insert geofences
INSERT INTO geofences (id, family_id, name, latitude, longitude, radius, type, is_active, created_at, updated_at) VALUES
('geo-1', 'hourse-1', 'Home', 37.7749, -122.4194, 100, 'home', true, NOW(), NOW()),
('geo-2', 'hourse-1', 'School', 37.7849, -122.4094, 50, 'school', true, NOW(), NOW()),
('geo-3', 'hourse-2', 'Office', 37.7649, -122.4294, 75, 'work', true, NOW(), NOW()),
('geo-4', 'hourse-3', 'Park', 37.7549, -122.4394, 200, 'recreation', true, NOW(), NOW());

-- Insert safety alerts
INSERT INTO safety_alerts (id, user_id, family_id, type, severity, message, location, is_resolved, created_at, updated_at) VALUES
('alert-1', 'user-3', 'hourse-2', 'panic', 'high', 'Emergency situation at school', '789 School Ave, San Francisco, CA', false, NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes'),
('alert-2', 'user-1', 'hourse-1', 'inactivity', 'medium', 'No activity detected for 2 hours', '123 Main St, San Francisco, CA', true, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '30 minutes'),
('alert-3', 'user-4', 'hourse-2', 'geofence_exit', 'low', 'Left designated area', '321 Park St, San Francisco, CA', false, NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '45 minutes');

-- Insert sample files
INSERT INTO files (id, user_id, family_id, filename, original_name, file_type, file_size, file_path, is_public, created_at, updated_at) VALUES
('file-1', 'user-1', 'hourse-1', 'family_photo_1.jpg', 'family_photo_1.jpg', 'image/jpeg', 2048576, '/uploads/family_photo_1.jpg', true, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
('file-2', 'user-2', 'hourse-1', 'document_1.pdf', 'important_document.pdf', 'application/pdf', 1024768, '/uploads/document_1.pdf', false, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('file-3', 'user-3', 'hourse-2', 'video_1.mp4', 'family_video.mp4', 'video/mp4', 10485760, '/uploads/video_1.mp4', true, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days');

-- Insert sample events
INSERT INTO events (id, family_id, title, description, start_time, end_time, location, type, created_by, created_at, updated_at) VALUES
('event-1', 'hourse-1', 'hourse Dinner', 'Weekly hourse dinner', NOW() + INTERVAL '2 hours', NOW() + INTERVAL '4 hours', 'Home', 'hourse', 'user-1', NOW(), NOW()),
('event-2', 'hourse-2', 'Doctor Appointment', 'Annual checkup', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day' + INTERVAL '1 hour', 'City Medical Center', 'medical', 'user-3', NOW(), NOW()),
('event-3', 'hourse-1', 'School Play', 'Kids school performance', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days' + INTERVAL '2 hours', 'Lincoln Elementary', 'education', 'user-2', NOW(), NOW());

-- Insert event attendees
INSERT INTO event_attendees (id, event_id, user_id, status, created_at, updated_at) VALUES
('ea-1', 'event-1', 'user-1', 'confirmed', NOW(), NOW()),
('ea-2', 'event-1', 'user-2', 'confirmed', NOW(), NOW()),
('ea-3', 'event-2', 'user-3', 'confirmed', NOW(), NOW()),
('ea-4', 'event-3', 'user-1', 'confirmed', NOW(), NOW()),
('ea-5', 'event-3', 'user-2', 'confirmed', NOW(), NOW());

-- Insert sample tasks
INSERT INTO tasks (id, family_id, title, description, priority, status, assigned_to, due_date, created_by, created_at, updated_at) VALUES
('task-1', 'hourse-1', 'Buy groceries', 'Weekly grocery shopping', 'medium', 'pending', 'user-1', NOW() + INTERVAL '1 day', 'user-2', NOW(), NOW()),
('task-2', 'hourse-1', 'Pick up kids', 'Pick up kids from school', 'high', 'in_progress', 'user-2', NOW() + INTERVAL '2 hours', 'user-1', NOW(), NOW()),
('task-3', 'hourse-2', 'Pay bills', 'Monthly utility bills', 'high', 'completed', 'user-3', NOW() - INTERVAL '1 day', 'user-4', NOW(), NOW()),
('task-4', 'hourse-3', 'Plan vacation', 'Summer vacation planning', 'low', 'pending', 'user-5', NOW() + INTERVAL '1 week', 'user-5', NOW(), NOW());

-- Insert sample notes
INSERT INTO notes (id, user_id, family_id, title, content, is_public, created_at, updated_at) VALUES
('note-1', 'user-1', 'hourse-1', 'hourse Meeting Notes', 'Discussed vacation plans and budget for next month', true, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
('note-2', 'user-2', 'hourse-1', 'Shopping List', 'Milk, bread, eggs, chicken, vegetables', true, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
('note-3', 'user-3', 'hourse-2', 'Work Schedule', 'Monday: 9-5, Tuesday: 10-6, Wednesday: 8-4', false, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours'),
('note-4', 'user-4', 'hourse-2', 'Recipe Ideas', 'Pasta carbonara, grilled chicken, vegetable stir-fry', true, NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours');

-- Insert sample notifications
INSERT INTO notifications (id, user_id, family_id, type, title, message, is_read, created_at, updated_at) VALUES
('notif-1', 'user-1', 'hourse-1', 'hourse', 'New hourse Member', 'Jane Doe joined the hourse', false, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour'),
('notif-2', 'user-2', 'hourse-1', 'safety', 'Safety Alert', 'Emergency alert from Mike Smith', false, NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes'),
('notif-3', 'user-3', 'hourse-2', 'task', 'Task Assigned', 'You have been assigned a new task', true, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
('notif-4', 'user-4', 'hourse-2', 'event', 'Upcoming Event', 'hourse dinner in 2 hours', false, NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '15 minutes'),
('notif-5', 'user-5', 'hourse-3', 'message', 'New Message', 'New message in hourse chat', false, NOW() - INTERVAL '5 minutes', NOW() - INTERVAL '5 minutes');

-- Update sequences to avoid conflicts
SELECT setval('users_id_seq', (SELECT MAX(CAST(SUBSTRING(id FROM '[0-9]+') AS INTEGER)) FROM users WHERE id ~ '^user-[0-9]+$'));
SELECT setval('families_id_seq', (SELECT MAX(CAST(SUBSTRING(id FROM '[0-9]+') AS INTEGER)) FROM families WHERE id ~ '^hourse-[0-9]+$'));
SELECT setval('chat_rooms_id_seq', (SELECT MAX(CAST(SUBSTRING(id FROM '[0-9]+') AS INTEGER)) FROM chat_rooms WHERE id ~ '^chat-[0-9]+$'));
SELECT setval('messages_id_seq', (SELECT MAX(CAST(SUBSTRING(id FROM '[0-9]+') AS INTEGER)) FROM messages WHERE id ~ '^msg-[0-9]+$'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_family_members_family_id ON family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat_room_id ON messages(chat_room_id);
CREATE INDEX IF NOT EXISTS idx_user_locations_user_id ON user_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_safety_alerts_user_id ON safety_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_files_family_id ON files(family_id);
CREATE INDEX IF NOT EXISTS idx_events_family_id ON events(family_id);
CREATE INDEX IF NOT EXISTS idx_tasks_family_id ON tasks(family_id);
CREATE INDEX IF NOT EXISTS idx_notes_family_id ON notes(family_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- Insert sample gallery albums
INSERT INTO gallery_albums (id, family_id, name, description, created_by, created_at, updated_at) VALUES
('album-1', 'hourse-1', 'hourse Photos', 'Our hourse memories', 'user-1', NOW(), NOW()),
('album-2', 'hourse-1', 'Vacation 2024', 'Summer vacation photos', 'user-2', NOW(), NOW()),
('album-3', 'hourse-2', 'Birthday Party', 'Mike birthday celebration', 'user-3', NOW(), NOW());

-- Insert sample gallery items
INSERT INTO gallery_items (id, album_id, file_id, title, description, created_by, created_at, updated_at) VALUES
('item-1', 'album-1', 'file-1', 'hourse Portrait', 'Our annual hourse photo', 'user-1', NOW(), NOW()),
('item-2', 'album-2', 'file-3', 'Beach Day', 'Fun day at the beach', 'user-2', NOW(), NOW()),
('item-3', 'album-3', 'file-1', 'Birthday Cake', 'Delicious birthday cake', 'user-3', NOW(), NOW());

-- ============================================
-- Mobile App Localization Seeding (mobile_app)
-- ============================================

-- Ensure core languages exist
INSERT INTO languages (code, name, native_name, direction, is_active, is_default, flag_emoji)
VALUES
('en','English','English','ltr',true,true,'🇺🇸'),
('th','Thai','ไทย','ltr',true,false,'🇹🇭'),
('vi','Vietnamese','Tiếng Việt','ltr',true,false,'🇻🇳'),
('id','Indonesian','Bahasa Indonesia','ltr',true,false,'🇮🇩'),
('lo','Lao','ລາວ','ltr',true,false,'🇱🇦'),
('my','Burmese','မြန်မာ','ltr',true,false,'🇲🇲')
ON CONFLICT (code) DO NOTHING;

-- Upsert mobile_app translation keys
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

-- Seed English translations (approved) for these keys if missing
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

-- Extend: Upsert additional mobile_app keys across app modules
INSERT INTO translation_keys (key, category, description, context, is_active)
VALUES
-- auth
('auth.login','auth','Login button label','mobile_app',true),
('auth.logout','auth','Logout button label','mobile_app',true),
('auth.register','auth','Register button label','mobile_app',true),
('auth.email','auth','Email field label','mobile_app',true),
('auth.password','auth','Password field label','mobile_app',true),
('auth.forgot_password','auth','Forgot password link','mobile_app',true),
-- navigation
('nav.home','navigation','Home tab','mobile_app',true),
('nav.chat','navigation','Chat tab','mobile_app',true),
('nav.calendar','navigation','Calendar tab','mobile_app',true),
('nav.tasks','navigation','Tasks tab','mobile_app',true),
('nav.family','navigation','Family tab','mobile_app',true),
('nav.settings','navigation','Settings tab','mobile_app',true),
('nav.safety','navigation','Safety tab','mobile_app',true),
-- settings
('settings.title','settings','Settings screen title','mobile_app',true),
('settings.language','settings','Language setting label','mobile_app',true),
('settings.notifications','settings','Notifications setting label','mobile_app',true),
('settings.privacy','settings','Privacy setting label','mobile_app',true),
('settings.account','settings','Account setting label','mobile_app',true),
('settings.save_success','settings','Settings saved confirmation','mobile_app',true),
-- chat
('chat.new_message','chat','New message placeholder','mobile_app',true),
('chat.typing','chat','Typing indicator','mobile_app',true),
('chat.send','chat','Send button','mobile_app',true),
('chat.attach','chat','Attach button','mobile_app',true),
('chat.read_by','chat','Read by label','mobile_app',true),
('chat.you','chat','"You" label','mobile_app',true),
('chat.search','chat','Search messages label','mobile_app',true),
-- safety
('safety.alert','safety','Safety alert label','mobile_app',true),
('safety.panic','safety','Panic button','mobile_app',true),
('safety.share_location','safety','Share location action','mobile_app',true),
('safety.request_location','safety','Request location action','mobile_app',true),
('safety.geofence_enter','safety','Geofence entered label','mobile_app',true),
('safety.geofence_exit','safety','Geofence exited label','mobile_app',true),
-- calendar
('calendar.add_event','calendar','Add event action','mobile_app',true),
('calendar.edit_event','calendar','Edit event action','mobile_app',true),
('calendar.delete_event','calendar','Delete event action','mobile_app',true),
('calendar.today','calendar','Today label','mobile_app',true),
('calendar.all_day','calendar','All-day label','mobile_app',true),
-- tasks
('tasks.add','tasks','Add task action','mobile_app',true),
('tasks.edit','tasks','Edit task action','mobile_app',true),
('tasks.delete','tasks','Delete task action','mobile_app',true),
('tasks.complete','tasks','Complete task action','mobile_app',true),
('tasks.priority_low','tasks','Low priority label','mobile_app',true),
('tasks.priority_medium','tasks','Medium priority label','mobile_app',true),
('tasks.priority_high','tasks','High priority label','mobile_app',true),
-- notifications
('notifications.title','notifications','Notifications screen title','mobile_app',true),
('notifications.mark_read','notifications','Mark as read action','mobile_app',true),
('notifications.clear_all','notifications','Clear all notifications','mobile_app',true),
-- common additions
('common.search','common','Search label','mobile_app',true),
('common.filter','common','Filter label','mobile_app',true),
('common.enable','common','Enable label','mobile_app',true),
('common.disable','common','Disable label','mobile_app',true)
ON CONFLICT (key) DO UPDATE SET context='mobile_app', is_active=true;

-- Seed English values for added keys
INSERT INTO translations (key_id, language_id, value, is_approved, approved_at)
SELECT tk.id, l.id,
  CASE tk.key
    -- auth
    WHEN 'auth.login' THEN 'Login'
    WHEN 'auth.logout' THEN 'Logout'
    WHEN 'auth.register' THEN 'Register'
    WHEN 'auth.email' THEN 'Email'
    WHEN 'auth.password' THEN 'Password'
    WHEN 'auth.forgot_password' THEN 'Forgot Password?'
    -- navigation
    WHEN 'nav.home' THEN 'Home'
    WHEN 'nav.chat' THEN 'Chat'
    WHEN 'nav.calendar' THEN 'Calendar'
    WHEN 'nav.tasks' THEN 'Tasks'
    WHEN 'nav.family' THEN 'Family'
    WHEN 'nav.settings' THEN 'Settings'
    WHEN 'nav.safety' THEN 'Safety'
    -- settings
    WHEN 'settings.title' THEN 'Settings'
    WHEN 'settings.language' THEN 'Language'
    WHEN 'settings.notifications' THEN 'Notifications'
    WHEN 'settings.privacy' THEN 'Privacy'
    WHEN 'settings.account' THEN 'Account'
    WHEN 'settings.save_success' THEN 'Settings saved successfully'
    -- chat
    WHEN 'chat.new_message' THEN 'New message'
    WHEN 'chat.typing' THEN 'Typing…'
    WHEN 'chat.send' THEN 'Send'
    WHEN 'chat.attach' THEN 'Attach'
    WHEN 'chat.read_by' THEN 'Read by'
    WHEN 'chat.you' THEN 'You'
    WHEN 'chat.search' THEN 'Search messages'
    -- safety
    WHEN 'safety.alert' THEN 'Safety Alert'
    WHEN 'safety.panic' THEN 'Panic'
    WHEN 'safety.share_location' THEN 'Share Location'
    WHEN 'safety.request_location' THEN 'Request Location'
    WHEN 'safety.geofence_enter' THEN 'Entered area'
    WHEN 'safety.geofence_exit' THEN 'Exited area'
    -- calendar
    WHEN 'calendar.add_event' THEN 'Add Event'
    WHEN 'calendar.edit_event' THEN 'Edit Event'
    WHEN 'calendar.delete_event' THEN 'Delete Event'
    WHEN 'calendar.today' THEN 'Today'
    WHEN 'calendar.all_day' THEN 'All day'
    -- tasks
    WHEN 'tasks.add' THEN 'Add Task'
    WHEN 'tasks.edit' THEN 'Edit Task'
    WHEN 'tasks.delete' THEN 'Delete Task'
    WHEN 'tasks.complete' THEN 'Complete'
    WHEN 'tasks.priority_low' THEN 'Low'
    WHEN 'tasks.priority_medium' THEN 'Medium'
    WHEN 'tasks.priority_high' THEN 'High'
    -- notifications
    WHEN 'notifications.title' THEN 'Notifications'
    WHEN 'notifications.mark_read' THEN 'Mark as read'
    WHEN 'notifications.clear_all' THEN 'Clear all'
    -- common
    WHEN 'common.search' THEN 'Search'
    WHEN 'common.filter' THEN 'Filter'
    WHEN 'common.enable' THEN 'Enable'
    WHEN 'common.disable' THEN 'Disable'
  END,
  true, NOW()
FROM translation_keys tk
JOIN languages l ON l.code='en'
LEFT JOIN translations t ON t.key_id=tk.id AND t.language_id=l.id
WHERE tk.context='mobile_app' AND t.id IS NULL;

-- Copy English values to other target languages where missing (unapproved)
INSERT INTO translations (key_id, language_id, value, is_approved, created_at, updated_at)
SELECT t_en.key_id, l_new.id, t_en.value, false, NOW(), NOW()
FROM translations t_en
JOIN languages l_en ON l_en.id=t_en.language_id AND l_en.code='en'
JOIN languages l_new ON l_new.code IN ('th','vi','id','lo','my')
LEFT JOIN translations t_existing ON t_existing.key_id=t_en.key_id AND t_existing.language_id=l_new.id
WHERE t_existing.id IS NULL;

COMMIT;

-- ============================================
-- Admin bootstrap (merged from seed_admin.sql)
-- ============================================

-- Ensure admin user exists
INSERT INTO users (id, email, password_hash, first_name, last_name, phone, avatar_url, is_verified, created_at, updated_at)
SELECT 'admin-user', 'admin@bondary.com', '$2b$10$example_hash_admin', 'Admin', 'User', NULL, NULL, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@bondary.com');

-- Ensure demo family exists linked to admin user
INSERT INTO families (id, name, description, created_by, created_at, updated_at)
SELECT 'demo-family', 'Demo Family', 'Seeded family', u.id, NOW(), NOW()
FROM users u
WHERE u.email = 'admin@bondary.com'
ON CONFLICT (id) DO NOTHING;

-- Link admin as family admin member
INSERT INTO family_members (id, family_id, user_id, role, status, joined_at, created_at, updated_at)
SELECT 'fm-admin-1', 'demo-family', u.id, 'admin', 'active', NOW(), NOW(), NOW()
FROM users u
WHERE u.email = 'admin@bondary.com'
ON CONFLICT (id) DO NOTHING;