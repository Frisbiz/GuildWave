/*
Seed script for GuildWave demo data.

Usage:
  - Create a user via the app sign-up or Supabase Auth, then copy their user id (auth.uid).
  - Create a local .env file with:
      NEXT_PUBLIC_SUPABASE_URL=...
      SUPABASE_SERVICE_ROLE_KEY=...
      DEMO_OWNER_ID=...
  - Run: node scripts/seed.js

This script requires the service role key because the database has RLS enabled.
It will insert a demo server, a default text channel, add the owner as a member, and create an invite code.

Be careful: do NOT commit your service role key to source control.
*/

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DEMO_OWNER_ID = process.env.DEMO_OWNER_ID;

function randomCode(length = 8) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env. See .env.example');
  process.exit(1);
}

if (!DEMO_OWNER_ID) {
  console.error('Missing DEMO_OWNER_ID in env. Create a user via Supabase Auth and set DEMO_OWNER_ID to their uid.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: {
    persistSession: false
  }
});

(async () => {
  try {
    console.log('Creating demo server...');
    const serverName = 'Demo Server';
    const { data: serverData, error: serverError } = await supabase
      .from('servers')
      .insert([{ owner_id: DEMO_OWNER_ID, name: serverName }])
      .select('*')
      .single();

    if (serverError) throw serverError;
    const serverId = serverData.id;
    console.log('Server created:', serverId);

    console.log('Adding owner as server member...');
    const { data: memberData, error: memberError } = await supabase
      .from('server_members')
      .insert([{ server_id: serverId, user_id: DEMO_OWNER_ID, role: 'owner' }])
      .select('*')
      .single();

    if (memberError) throw memberError;
    console.log('Owner added as member.');

    console.log('Creating default text channel...');
    const { data: channelData, error: channelError } = await supabase
      .from('channels')
      .insert([{ server_id: serverId, name: 'general', type: 'text', position: 0 }])
      .select('*')
      .single();

    if (channelError) throw channelError;
    const channelId = channelData.id;
    console.log('Channel created:', channelId);

    console.log('Creating invite code...');
    const code = randomCode(8);
    const { data: inviteData, error: inviteError } = await supabase
      .from('invites')
      .insert([{
        server_id: serverId,
        code,
        created_by: DEMO_OWNER_ID,
        expires_at: null,
        max_uses: 0,
        uses: 0
      }])
      .select('*')
      .single();

    if (inviteError) throw inviteError;
    console.log('Invite created:', inviteData.id);
    console.log('Invite code (share this with friends):', inviteData.code);

    console.log('');
    console.log('Seed complete. Summary:');
    console.log('  Server ID:', serverId);
    console.log('  Channel ID:', channelId);
    console.log('  Invite code:', inviteData.code);
    console.log('');
    console.log('You can now sign in as the demo owner and use the app. If you want more seed data, modify scripts/seed.js to add users/messages/etc.');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
})();
