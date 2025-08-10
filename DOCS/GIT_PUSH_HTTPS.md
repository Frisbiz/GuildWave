Steps to push this repository to GitHub (HTTPS)

1) Create a GitHub repository (web)
- Go to https://github.com/new
- Enter Repository name (e.g., guildwave or your choice), Visibility (Public or Private), then click "Create repository".
- On the new-repo page you'll see HTTPS remote URL like:
  https://github.com/yourusername/your-repo.git

(Alternative: use GitHub CLI: `gh repo create yourusername/your-repo --public --source=. --remote=origin --push`)

2) From your project root run these commands (replace the remote URL)
- If the repo is not already a git repo:
  git init
- Stage files:
  git add .
- Create an initial commit:
  git commit -m "chore: initial project import (GuildWave)"
- Set the default branch to main:
  git branch -M main
- Add the HTTPS remote (replace with the URL from step 1):
  git remote add origin https://github.com/yourusername/your-repo.git
- Push to GitHub:
  git push -u origin main

Notes / common issues
- Authentication:
  - GitHub will prompt for credentials when using HTTPS. Use a Personal Access Token (PAT) as the password if your account requires it.
  - Recommended: configure a Git credential helper so you don't retype your PAT repeatedly.
    - Windows: Git for Windows includes the credential manager; it will prompt and store credentials securely.
    - macOS: use the Keychain credential helper.
- If files you don't want tracked were already added (e.g., .env.local), remove them from the index before committing:
  git rm --cached .env.local
  git commit -m "chore: stop tracking local env"
- Confirm .gitignore ignores env files (this repo contains `.env*` in .gitignore already). Double-check with:
  git status --ignored
- If you want to push tags (used for Releases later):
  git tag v1.0.0
  git push origin --tags

Using GitHub CLI (optional, simplifies creation + push)
- If you have GitHub CLI (gh) installed and authenticated:
  gh repo create yourusername/your-repo --public --source=. --remote=origin --push
- This will create the repo remotely and push current branch as origin/main.

After pushing
- Open https://github.com/yourusername/your-repo to verify.
- Go to "Actions" tab to confirm workflows (release.yml, ci-seed.yml) are present.
- Add repository secrets (Settings → Secrets → Actions) for CI:
  - SUPABASE_URL
  - SUPABASE_SERVICE_ROLE_KEY
  - DEMO_SEED_EMAIL
  - DEMO_SEED_PASSWORD
  - (Optional) TAURI_UPDATER_PRIVATE_KEY if you add update signing later.

If you want I can:
- Add a small script to automatically create a GitHub Release from a local tag.
- Provide the exact gh CLI commands to both create the remote and push if you want to avoid manual web steps.
