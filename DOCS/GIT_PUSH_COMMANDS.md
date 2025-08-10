Commands to push this repo to your GitHub HTTPS remote (copy/paste into your project terminal)

Replace the remote URL below only if different from the one you gave:
  https://github.com/Frisbiz/guildwave

1) (Optional) If your repo already has origin set, remove it first:
   git remote remove origin

2) Add the HTTPS remote and push the current branch (main):
   git remote add origin https://github.com/Frisbiz/guildwave.git
   git branch -M main
   git push -u origin main

3) If your git prompts for credentials when pushing:
   - Use your GitHub username and a Personal Access Token (PAT) as the password.
   - To create a PAT: https://github.com/settings/tokens (give it repo and workflow scopes if needed).
   - On Windows, Git Credential Manager will typically prompt once and then cache the PAT securely.

4) If you have local files you must not commit (e.g., .env.local) and they were accidentally staged, unstage/remove from the index before pushing:
   git rm --cached .env.local
   git commit -m "chore: stop tracking local env"
   git push

5) Verify workflows and add secrets:
   - After push, open https://github.com/Frisbiz/guildwave
   - Go to Settings → Secrets and variables → Actions and add:
     SUPABASE_URL
     SUPABASE_SERVICE_ROLE_KEY
     DEMO_SEED_EMAIL
     DEMO_SEED_PASSWORD
   - Then go to Actions → CI — Seed Demo Data → Run workflow (manual) to seed demo data.

Notes:
- If you prefer using GitHub CLI and it's installed:
  gh repo create Frisbiz/guildwave --public --source=. --remote=origin --push
  (This will create the remote and push your current branch.)
- If you run into permission errors, confirm you're authenticated. For HTTPS, it's easiest to use a PAT.
- After pushing, Releases and Actions will show up in the repo UI.

If you want, I can:
- Provide the exact PAT-friendly Windows guidance (how to store PAT with Git Credential Manager).
- Add a small script to automatically create a Release from a tag once you push tags.
