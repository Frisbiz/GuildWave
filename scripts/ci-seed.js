/**
 * CI-safe seed script for GuildWave.
 *
 * Designed to run inside GitHub Actions (or any CI) where secrets are provided
 * via environment variables (GitHub Secrets). This script:
 *  - Creates a demo user using the Supabase Admin REST endpoint (needs service role key)
 *  - Creates a server, channel, and invite using the service role key
 *
 * Required environment variables (set as GitHub Secrets in your repo):
 *  - SUPABASE_URL (e.g. https://xyz.supabase.co)
 *  - SUPABASE_SERVICE_ROLE_KEY
 *  - DEMO_SEED_EMAIL
 *  - DEMO_SEED_PASSWORD
 *
 * Usage (locally, for testing, set these env vars):
 *  SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... DEMO_SEED_EMAIL=... DEMO_SEED_PASSWORD=... node scripts/ci-seed.js
 *
 * The GitHub Actions workflow will pass values from repository secrets into the job env.
 */

const { createClient } = require('@supabase/supabase-js');
const fetch = global.fetch || require('node-fetch');

function randomCode(length = 8) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

async function createAdminUser(supabaseUrl, serviceKey, email, password) {
  const url = `${supabaseUrl.replace(/\/$/, '')}/auth/v1/admin/users`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
    }),
  });

  const json = await res.json();
  if (!res.ok) {
    // If user already exists, the API may return 400. Try to fetch the user by listing users (best-effort).
    throw new Error(`Failed to create admin user: ${res.status} ${JSON.stringify(json)}`);
  }
  return json;
}

async function main() {
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const DEMO_EMAIL = process.env.DEMO_SEED_EMAIL;
    const DEMO_PASSWORD = process.env.DEMO_SEED_PASSWORD;

    if (!SUPABASE_URL || !SERVICE_KEY || !DEMO_EMAIL || !DEMO_PASSWORD) {
      console.error('Missing required env vars. Please set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DEMO_SEED_EMAIL, DEMO_SEED_PASSWORD');
      process.exit(1);
    }

    console.log('Creating demo user (admin)...');
    let user;
    try {
      user = await createAdminUser(SUPABASE_URL, SERVICE_KEY, DEMO_EMAIL, DEMO_PASSWORD);
      console.log('User created:', user.id || user);
    } catch (err) {
      // If creation fails (e.g., user exists), attempt to find the user via the admin users list endpoint.
      console.warn('Create user failed, attempting to find existing user by email:', err.message);
      const listUrl = `${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/admin/users?search=${encodeURIComponent(DEMO_EMAIL)}`;
      const res = await fetch(listUrl, {
        headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
      });
      const listJson = await res.json();
      if (!res.ok) {
        console.error('Failed to list users to find existing user:', res.status, listJson);
        process.exit(1);
      }
      // Try to locate exact email match
      const found = (listJson?.users || []).find((u) => u.email === DEMO_EMAIL) || listJson[0];
      if (!found) {
        console.error('User not found after failed creation attempt:', listJson);
        process.exit(1);
      }
      user = found;
      console.log('Found existing user:', user.id);
    }

    const demoOwnerId = user.id;
    // Create Supabase client with service role key
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

    console.log('Creating demo server...');
    const serverName = 'Demo Server';
    const { data: serverData, error: serverError } = await supabase
      .from('servers')
      .insert([{ owner_id: demoOwnerId, name: serverName }])
      .select('*')
      .single();

    if (serverError) throw serverError;
    const serverId = serverData.id;
    console.log('Server created:', serverId);

    console.log('Adding owner as server member...');
    const { data: memberData, error: memberError } = await supabase
      .from('server_members')
      .insert([{ server_id: serverId, user_id: demoOwnerId, role: 'owner' }])
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
        created_by: demoOwnerId,
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
    process.exit(0);
  } catch (err) {
    console.error('SEED FAILED:', err);
    process.exit(1);
  }
}

main();
