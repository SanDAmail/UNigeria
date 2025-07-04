
-- Enable Row Level Security (RLS) for tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE reputation_events ENABLE ROW LEVEL SECURITY;

-- Policies for profiles table
CREATE POLICY "Public profiles are viewable by everyone." ON profiles
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can insert their own profile." ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile." ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policies for chat_messages table
CREATE POLICY "Chat messages are viewable by authenticated users." ON chat_messages
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert their own chat messages." ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat messages." ON chat_messages
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat messages." ON chat_messages
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for forum_categories table
CREATE POLICY "Forum categories are viewable by everyone." ON forum_categories
  FOR SELECT USING (TRUE);

-- Policies for forum_topics table (Reports)
CREATE POLICY "Forum topics are viewable by everyone." ON forum_topics
  FOR SELECT USING (TRUE);

CREATE POLICY "Authenticated users can create forum topics." ON forum_topics
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own forum topics." ON forum_topics
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own forum topics." ON forum_topics
  FOR DELETE USING (auth.uid() = author_id);

-- Policies for endorsements table
CREATE POLICY "Endorsements are viewable by everyone." ON endorsements
  FOR SELECT USING (TRUE);

CREATE POLICY "Authenticated users can create endorsements." ON endorsements
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own endorsements." ON endorsements
  FOR DELETE USING (auth.uid() = endorser_id);

-- Policies for notifications table
CREATE POLICY "Notifications are viewable by the owner." ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Notifications can be inserted by authenticated users." ON notifications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Notifications can be updated by the owner." ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies for announcements table
CREATE POLICY "Announcements are viewable by everyone." ON announcements
  FOR SELECT USING (TRUE);

CREATE POLICY "Authenticated users can create announcements." ON announcements
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policies for reputation_events table
CREATE POLICY "Reputation events are viewable by the owner." ON reputation_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Reputation events can be inserted by authenticated users." ON reputation_events
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
