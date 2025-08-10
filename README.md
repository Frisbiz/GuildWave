<a href="https://github.com/Frisbiz/GuildWave">
  <img src="public/logo.png" alt="GuildWave logo" width="150"/># GuildWave
</a>

# GuildWave
A polished, educational desktop/web chat client inspired by modern collaboration apps. GuildWave is a portfolio project demonstrating a full-stack architecture using Next.js + Tauri (desktop), Supabase (Auth, Postgres, Realtime, Storage), and GitHub Actions for CI and releases.

This repository contains:
- A Next.js frontend (app dir) that can be bundled for desktop with Tauri.
- Tauri configuration and native icon placeholders (src-tauri/).
- Supabase schema and Row Level Security (RLS) migrations for a minimal chat domain model.
- GitHub Actions workflows to build desktop bundles and safely seed demo data using repository secrets.

Badges
- (Add CI / release badges here once your workflows run)

---

## Quick summary

- Tech: Next.js, React, Tauri, Supabase (Auth / Postgres / Realtime / Storage), GitHub Actions
- Goals: Small-scale, production-shaped demo you can share with friends or recruiters
- Focus: Text chat, servers/channels, secure RLS-backed data model, installation via desktop bundles, zero-cost hosting options for small demos

---

## Demo / Local development

Requirements (local)
- Node 20+, npm
- Rust (for Tauri desktop builds) — only needed for `npm run build:tauri`
- A Supabase project (for backend features)

Run locally (web):
1. Install dependencies:
   npm ci
2. Create a local .env file (copy from `.env.example`) and set:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   (Service role key only required for seed operations, see Notes)
3. Start dev server:
   npm run dev
4. Open http://localhost:3001 (dev server may pick a different port if 3000 is in use)

Notes:
- The repository contains `public/logo.png` and `public/favicon.ico`. Those are used by the site and metadata.
- If you want the desktop application, run `npm run build:tauri` on a machine with Rust and the required platform SDKs.

---

## Features implemented (MVP)
- Email/password authentication via Supabase
- Servers (communities) and channels model
- Server membership, roles (owner/admin/member)
- Text messaging with attachments placeholder
- Realtime messages using Supabase Realtime (postgres_changes / Realtime channels)
- Client-side UI (Next.js) and Tauri-ready packaging
- CI workflow to produce platform bundles and a CI-safe seeding workflow

---

## Architecture & data model (brief)

Backend (Supabase)
- Postgres tables: users (managed by Supabase Auth), servers, server_members, channels, messages, attachments, moderation_events
- Row Level Security (RLS) enabled — policies provided in `supabase/migrations/001_init.sql`
- Storage: Supabase Storage for attachments (signed URL approach)

Client
- Next.js UI bundled into Tauri for desktop
- Supabase JS client for auth, DB, storage, and realtime
- Updater: Tauri updater configured to read GitHub Releases (placeholder in `src-tauri/tauri.conf.json`)

---

## CI & Releases

- `.github/workflows/release.yml`
  - Trigger: push a Git tag matching `v*.*.*`
  - Builds Tauri bundles on ubuntu/macOS/windows matrix and uploads artifacts to a GitHub Release
  - For automated update signing, supply a signer private key as a GitHub secret (advanced)

- `.github/workflows/ci-seed.yml`
  - Manual dispatch workflow to seed demo data securely using GitHub Secrets (keeps service_role key out of the repo)
  - Requires the following repository secrets:
    - `SUPABASE_URL` (your Supabase project URL)
    - `SUPABASE_SERVICE_ROLE_KEY` (service_role key — treat as secret)
    - `DEMO_SEED_EMAIL`
    - `DEMO_SEED_PASSWORD`

---

## Supabase setup & seeding (recommended flow)

1. Create project at https://app.supabase.com.
2. In SQL Editor, run `supabase/migrations/001_init.sql` to create the needed tables and RLS policies.
3. Create a bucket named `attachments` (optional).
4. Add public keys to your local `.env.local`:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
5. Add secrets in GitHub (for CI seeding): `SUPABASE_SERVICE_ROLE_KEY`, `DEMO_SEED_EMAIL`, `DEMO_SEED_PASSWORD`, `SUPABASE_URL`.
6. Run the CI seeding workflow manually (Actions → CI — Seed Demo Data → Run workflow). The job log prints an invite code you can use to join the seeded server.

Local seeding (not recommended for shared repos):
- `scripts/seed.js` can be run locally if you set `SUPABASE_SERVICE_ROLE_KEY` and `DEMO_OWNER_ID` in your `.env.local`. Keep the service role key private.

---

## Developer notes & security

- RLS is enabled and intentionally strict. Ensure you test with multiple accounts to verify policy behavior.
- Never commit service role keys, private keys, or secrets to source control.
- For a public portfolio demo, you may accept the browser/OS warnings (unsigned installers). For professional distribution, add code signing/notarization (costs apply).

---

## Using the logo & branding in repo

- The repository includes `public/logo.png`. This image is used as the site header/home icon and browser favicon metadata.
- If you replace these images, add appropriately sized favicons:
  - `public/favicon.ico` (multi-size)
  - `public/favicon-32x32.png`
  - `public/apple-touch-icon.png`

---

## Contributing & license

- This project is intended as a personal/educational demo.
- License: MIT (see LICENSE file)

---

## Legal / Attribution (required)

This project is an independent, personal recreation inspired by Discord.  
It is **not affiliated with, endorsed by, or connected to Discord Inc.** in any way.  

All trademarks, service marks, trade names, logos, and images referenced belong to their respective owners.  
This project is intended for educational purposes only.

---
