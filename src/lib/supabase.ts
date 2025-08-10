/**
 * Supabase client for the GuildWave app.
 * Uses NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY from environment.
 *
 * This file is safe to import from client-side code (it's the public anon client).
 */

import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!url || !anonKey) {
  console.warn(
    '[supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
      'The Supabase client will be created but requests will fail until env vars are configured.'
  );
}

export const supabase = createClient(url, anonKey);
