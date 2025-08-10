This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

---

## Build scripts (local)

- Development (web): `npm run dev`
- Production build & static export: `npm run build`
- Build Tauri desktop bundles (runs `build` then `tauri build`): `npm run build:tauri`

Notes:
- `npm run build` runs `next build && next export` and places the exported assets into the out directory that Tauri picks up when bundling.
- `npm run build:tauri` will produce platform-specific installer bundles using Tauri; on local machines you need the appropriate toolchain (Rust, platform SDKs).

---

## Distribution & Releases (Tauri + GitHub Releases) — quick overview

Goal: let your friend download and install a desktop build (Windows, macOS, Linux) and auto-update from releases — while keeping costs at $0 for a small personal project.

What I've added in this repository:
- Tauri configuration (see `src-tauri/tauri.conf.json`) with the updater enabled. You must replace a few placeholders there before publishing:
  - `https://api.github.com/repos/REPO_OWNER/REPO_NAME/releases` → replace `REPO_OWNER/REPO_NAME` with your GitHub repo path.
  - `REPLACE_WITH_PEM_PUBLIC_KEY` → replace with the PEM public key that corresponds to your updater signing private key.
- A GitHub Actions workflow at `.github/workflows/release.yml` that builds bundles for Linux/macOS/Windows when you push a Git tag matching `v*.*.*` and uploads produced bundles to the GitHub Release.

How publishing works (manual steps you will do):
1. Tag a release version in Git locally, e.g.:
   git tag v1.0.0
   git push origin v1.0.0
   The workflow will run and publish the artifacts to a GitHub Release.
2. The app's updater reads GitHub Releases (configured as the endpoint in `tauri.conf.json`) and your users will be able to auto-update when you publish a newer tagged release.

Important placeholders and configuration items:
- Replace `REPO_OWNER/REPO_NAME` in `src-tauri/tauri.conf.json` with your actual GitHub repo.
- Replace `REPLACE_WITH_PEM_PUBLIC_KEY` with the PEM-format public key you use for Tauri updater verification.
- Keep the updater private key secret — if you plan to sign update manifests in CI, store the private key in GitHub Secrets (e.g., `TAURI_UPDATER_PRIVATE_KEY`) and add a signing step to the Actions workflow. I can add an automated signing step for you if you want.

Notes on code signing (optional):
- This project *does not* automatically code-sign installers. Code signing certificates (Windows Authenticode, Apple Developer ID) cost money and are optional for a portfolio project. Unsigned installers will run but users may see SmartScreen / Gatekeeper warnings; include install instructions in README to guide them.

---

## CI / Release workflow (what the repository includes)

- Workflow: `.github/workflows/release.yml`
  - Trigger: `push` of a tag `v*.*.*` (example `v1.0.0`).
  - Matrix: builds on `ubuntu-latest`, `macos-latest`, `windows-latest`.
  - Steps: checkout → install Node & Rust → `npm ci` → `npm run build:tauri` → upload bundles to the release.
  - The workflow uses `GITHUB_TOKEN` so it can attach artifacts to the Release automatically.

If you want the Actions job to also:
- Sign installers (Windows Authenticode / macOS notarization) — you need to provide appropriate certs and additional steps (these are paid/complex).
- Sign update manifests for Tauri automatically — add a step to run the signer using the private key stored in a repo secret. I can add the signing command and secret wiring.

---

## Supabase (backend) — quick setup

This project was planned to use Supabase for Auth / Postgres / Realtime / Storage.

I added a SQL migration file: `supabase/migrations/001_init.sql`. Apply this migration in your Supabase project to create the core tables and Row Level Security (RLS) policies (servers, server_members, invites, channels, messages, attachments, moderation_events).

Steps to get started with Supabase:
1. Create a free Supabase project at https://app.supabase.com.
2. In the Supabase dashboard:
   - Go to SQL Editor → run the contents of `supabase/migrations/001_init.sql`.
   - Open the "Storage" section and create a bucket for attachments (e.g., `attachments`).
3. Obtain your Supabase URL and anon public key and add them to the client configuration (in your frontend env).
4. Configure Realtime and Storage settings (buckets and CORS if needed).

Notes about RLS:
- The provided migration turns on RLS and includes policies that rely on `auth.uid()` so the client (Supabase JS SDK) must be used for authenticated access.
- Test RLS with multiple test accounts to ensure permissions behave as expected.

---

## Installing the app (for your friend)

After you publish a release on GitHub:
- Windows:
  - Download the `.exe` or `.msi` from the Release.
  - Run the installer. If Windows shows SmartScreen warnings, the user can click "More info" → "Run anyway".
- macOS:
  - Download the `.dmg` or `.app` from the Release.
  - Drag to Applications. On first run, if Gatekeeper warns, use right-click → Open to bypass (this is expected with unsigned apps).
- Linux:
  - Download `.AppImage` or `.deb` and run according to distribution steps.

Document these steps in the Release notes for first-time users; I added a short note earlier in the Tauri config as a reminder.

### Install Troubleshooting (common OS warnings and how to handle them)

Because this project is a personal/portfolio build and installers are not code-signed/notarized by default, your users may encounter OS warnings. Add this troubleshooting block to your Release notes so non-technical friends can install safely.

- Windows (SmartScreen / "Windows protected your PC"):
  1. When installer is blocked, click "More info".
  2. Click "Run anyway".
  3. For safer sharing, publish the SHA-256 checksum of the installer next to the Release and verify before running (see checksums section below).

- macOS (Gatekeeper / "App cannot be opened because it is from an unidentified developer"):
  1. Download the `.dmg` or `.app` and mount/open it.
  2. If macOS blocks opening, right-click (or control-click) the app in Finder → choose "Open".
  3. Confirm the dialog to open the unsigned app.
  4. To avoid confusion, include these steps in the release notes and in the README.

- Linux:
  - Most distros do not show the same warnings. For `.AppImage` make it executable:
    - chmod +x YourApp.AppImage
    - ./YourApp.AppImage
  - For `.deb` install with:
    - sudo dpkg -i your-package.deb && sudo apt -f install

- If a user is uncomfortable running unsigned software:
  - Tell them to verify the SHA-256 checksum (see below).
  - Provide a demo account or screenshots/video of the app so they can evaluate without installing.

### Checksums & verifying downloads

Provide SHA-256 checksums for every release artifact and include a small "checksums.txt" file with the Release. This helps users verify integrity and increases trust.

- How to generate checksums locally (or in CI):
  - macOS / Linux:
    - shasum -a 256 path/to/YourApp.dmg > checksums.txt
    - shasum -a 256 path/to/YourApp.AppImage >> checksums.txt
  - Windows (PowerShell):
    - Get-FileHash .\YourApp-Setup.exe -Algorithm SHA256 | ForEach-Object { $_.Hash } > checksums.txt
  - In CI: run the equivalent command for each produced artifact and upload checksums.txt to the Release.

- How to verify checksums as a user:
  - macOS / Linux:
    - shasum -a 256 YourApp.dmg
    - Compare the printed hash to the hash in checksums.txt
  - Windows (PowerShell):
    - Get-FileHash .\YourApp-Setup.exe -Algorithm SHA256

Optional extra verification (recommended if you want stronger trust):
- GPG-sign the checksums.txt and publish the public key in the repo so advanced users can verify the provenance.
  - Generate a GPG key locally, sign with:
    - gpg --armor --output checksums.txt.sig --detach-sign checksums.txt
  - Upload checksums.txt and checksums.txt.sig to the Release.
  - Publish the public key in README and the repo so users can verify the signature.

### What to include in each Release
- The platform-specific installer bundles (exe/msi, dmg, appimage/deb).
- checksums.txt containing SHA-256 for each artifact.
- Optional: checksums.txt.sig (GPG detached signature) and the public GPG key.
- Short "Installation Troubleshooting" note repeating the important bypass steps.

---

## Updater configuration (Tauri)

## Updater configuration (Tauri)

- Tauri's updater is enabled in `src-tauri/tauri.conf.json`. It points to GitHub Releases endpoints by default in this repo.
- To secure updates:
  - Generate an Ed25519 or RSA key pair suitable for Tauri update signing.
  - Put the PEM public key (PEM format) in `src-tauri/tauri.conf.json` under `tauri.updater.pubkey`.
  - Keep the private key secure — it must be used when generating signed update manifests or for any automated signing step in CI.
- The updater will check the configured endpoint and verify signatures using the stored public key before applying updates.

If you want, I will add an Actions step which:
- Loads the private key from a GitHub Secret,
- Invokes a signer (or a small script) that signs the release/update manifest before attaching artifacts to the Release.

---

## Costs & free-tier guidance

- Supabase (Free tier): suitable for personal projects and prototypes; includes Postgres DB, Realtime, and small storage. Good enough for a demo with a few users.
- GitHub Actions & Releases: free for public repos; Actions minutes are free for public repositories.
- Domain: optional (you can use GitHub Pages free URL).
- Code signing / Apple Developer Program / Windows code signing: optional and cost money; skip these for a portfolio project and document expected warnings for users.

---

## Next steps I can implement for you (pick any)

- Wire Supabase environment variables into the client (and a small .env.example).
- Add a seed script that creates a demo server, channels, and a test user.
- Add automated Tauri update signing to the GitHub Actions workflow (requires adding a repo secret with the private key).
- Add instructions or helper scripts for generating the updater key pair.

---

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
