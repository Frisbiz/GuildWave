-- Supabase initialization migration for GuildWave (MVP)
-- Creates core tables and Row Level Security (RLS) policies.
-- Apply this in your Supabase SQL editor or via psql connected to your Supabase Postgres DB.

-- Enable pgcrypto for UUIDs if not enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------- Servers ----------
CREATE TABLE IF NOT EXISTS servers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL, -- references auth.uid()
  name text NOT NULL,
  icon_url text,
  created_at timestamptz DEFAULT now()
);

-- ---------- Server Members ----------
CREATE TABLE IF NOT EXISTS server_members (
  server_id uuid NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL, -- corresponds to auth.uid()
  role text NOT NULL DEFAULT 'member', -- owner | admin | member
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (server_id, user_id)
);

-- ---------- Invites ----------
CREATE TABLE IF NOT EXISTS invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id uuid NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  created_by uuid NOT NULL,
  expires_at timestamptz,
  max_uses integer DEFAULT 0, -- 0 = unlimited
  uses integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ---------- Channels ----------
CREATE TABLE IF NOT EXISTS channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id uuid NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'text', -- text (MVP)
  position integer DEFAULT 0,
  is_private boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Optional per-channel membership for private channels
CREATE TABLE IF NOT EXISTS channel_members (
  channel_id uuid NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member',
  PRIMARY KEY (channel_id, user_id)
);

-- ---------- Messages ----------
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  author_id uuid NOT NULL,
  body text,
  edited_at timestamptz,
  created_at timestamptz DEFAULT now(),
  deleted_at timestamptz -- soft delete
);

-- ---------- Attachments ----------
CREATE TABLE IF NOT EXISTS attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES messages(id) ON DELETE SET NULL,
  uploader_id uuid NOT NULL,
  bucket_path text NOT NULL, -- path in Supabase Storage
  mime text,
  size bigint,
  width int,
  height int,
  created_at timestamptz DEFAULT now()
);

-- ---------- Moderation Events ----------
CREATE TABLE IF NOT EXISTS moderation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id uuid REFERENCES servers(id) ON DELETE SET NULL,
  actor_id uuid NOT NULL,
  target_user_id uuid,
  type text NOT NULL, -- kick | ban | delete_message | warn
  reason text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_messages_channel_created_at ON messages(channel_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_server_members_user ON server_members(user_id);
CREATE INDEX IF NOT EXISTS idx_channels_server ON channels(server_id);

-- ---------- Row Level Security (RLS) ----------
-- By default deny all access, then add policies.

-- Enable RLS on tables
ALTER TABLE servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_events ENABLE ROW LEVEL SECURITY;

-- Helper: users are identified by auth.uid()

-- servers policies
-- Owner can select their servers; members can select servers they are part of
CREATE POLICY "select_servers_for_member_or_owner" ON servers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM server_members sm WHERE sm.server_id = servers.id AND sm.user_id = auth.uid()
    ) OR servers.owner_id = auth.uid()
  );

-- Allow owners to insert servers (when creating a server)
CREATE POLICY "insert_servers_owner" ON servers
  FOR INSERT WITH CHECK ( owner_id = auth.uid() );

-- Allow owners to update/delete their server
CREATE POLICY "modify_own_servers" ON servers
  FOR UPDATE, DELETE USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- server_members policies
-- Allow users to view their membership rows
CREATE POLICY "select_own_server_members" ON server_members
  FOR SELECT USING (user_id = auth.uid());

-- Allow inserting membership only via server invite flow (server owner or admin can add)
CREATE POLICY "insert_server_members_by_admin_or_owner" ON server_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM server_members sm WHERE sm.server_id = server_members.server_id AND sm.user_id = auth.uid() AND sm.role IN ('owner','admin')
    ) OR (SELECT owner_id FROM servers WHERE id = server_members.server_id) = auth.uid()
  );

-- Allow server members to delete themselves (leave server) or admins/owners to remove members
CREATE POLICY "delete_server_members_self_or_admin" ON server_members
  FOR DELETE USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM server_members sm WHERE sm.server_id = server_members.server_id AND sm.user_id = auth.uid() AND sm.role IN ('owner','admin'))
  );

-- invites policies
-- Allow members of a server to create invites
CREATE POLICY "create_invites_if_admin_or_owner" ON invites
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM server_members sm WHERE sm.server_id = invites.server_id AND sm.user_id = auth.uid() AND sm.role IN ('owner','admin'))
    OR (SELECT owner_id FROM servers WHERE id = invites.server_id) = auth.uid()
  );

-- Selecting invites only allowed to server admins/owner
CREATE POLICY "select_invites_admins" ON invites
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM server_members sm WHERE sm.server_id = invites.server_id AND sm.user_id = auth.uid() AND sm.role IN ('owner','admin'))
    OR (SELECT owner_id FROM servers WHERE id = invites.server_id) = auth.uid()
  );

-- channels policies
-- Allow server members to read channels of their server (and owners)
CREATE POLICY "select_channels_for_members" ON channels
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM server_members sm WHERE sm.server_id = channels.server_id AND sm.user_id = auth.uid())
    OR (SELECT owner_id FROM servers WHERE id = channels.server_id) = auth.uid()
  );

-- Allow creating channels by owner/admin
CREATE POLICY "insert_channel_by_admin_or_owner" ON channels
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM server_members sm WHERE sm.server_id = channels.server_id AND sm.user_id = auth.uid() AND sm.role IN ('owner','admin'))
    OR (SELECT owner_id FROM servers WHERE id = channels.server_id) = auth.uid()
  );

-- channel_members policies (private channels)
CREATE POLICY "select_channel_members_self" ON channel_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "insert_channel_members_by_admin" ON channel_members
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM server_members sm WHERE sm.user_id = auth.uid() AND sm.server_id = (SELECT server_id FROM channels WHERE id = channel_members.channel_id) AND sm.role IN ('owner','admin'))
  );

-- messages policies
-- Select messages if user is member of the message's server
CREATE POLICY "select_messages_if_server_member" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM server_members sm
      JOIN channels c ON c.server_id = sm.server_id
      WHERE sm.user_id = auth.uid() AND c.id = messages.channel_id
    ) OR messages.author_id = auth.uid()
  );

-- Insert messages if user is a member of the channel/server and message constraints (length)
CREATE POLICY "insert_messages_if_member" ON messages
  FOR INSERT WITH CHECK (
    (char_length(coalesce(body, '')) <= 4000)
    AND EXISTS (
      SELECT 1 FROM server_members sm
      JOIN channels c ON c.server_id = sm.server_id
      WHERE sm.user_id = auth.uid() AND c.id = messages.channel_id
    )
  );

-- Update messages only by author (allow editing)
CREATE POLICY "update_messages_by_author" ON messages
  FOR UPDATE USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());

-- Delete messages: allow authors and server admins/owners
CREATE POLICY "delete_messages_author_or_admin" ON messages
  FOR DELETE USING (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM server_members sm
      JOIN channels c ON c.server_id = sm.server_id
      WHERE sm.user_id = auth.uid() AND c.id = messages.channel_id AND sm.role IN ('owner','admin')
    )
  );

-- attachments policies
-- Select attachments if the user can select the corresponding message / is uploader
CREATE POLICY "select_attachments_if_message_member_or_uploader" ON attachments
  FOR SELECT USING (
    uploader_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM messages m
      JOIN server_members sm ON sm.server_id = (SELECT server_id FROM channels WHERE id = m.channel_id)
      WHERE m.id = attachments.message_id AND sm.user_id = auth.uid()
    )
  );

-- Insert attachments only if uploader is auth uid (client should enforce limits)
CREATE POLICY "insert_attachments_uploader_check" ON attachments
  FOR INSERT WITH CHECK (uploader_id = auth.uid());

-- moderation_events policies
-- Only server admins/owners can insert moderation events for their server
CREATE POLICY "insert_moderation_by_admin" ON moderation_events
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM server_members sm WHERE sm.server_id = moderation_events.server_id AND sm.user_id = auth.uid() AND sm.role IN ('owner','admin'))
    OR (SELECT owner_id FROM servers WHERE id = moderation_events.server_id) = auth.uid()
  );

-- Allow admins to select moderation events in their server
CREATE POLICY "select_moderation_by_admin" ON moderation_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM server_members sm WHERE sm.server_id = moderation_events.server_id AND sm.user_id = auth.uid() AND sm.role IN ('owner','admin'))
  );

-- ---------- Utility: demo data insertion (optional) ----------
-- Insert a sample server and channel is left to the client or a seed script.
-- Example usage (manual):
-- INSERT INTO servers (owner_id, name) VALUES ('{YOUR_UUID}', 'Demo Server') RETURNING id;

-- End of migration
