Deployment to GitHub (Quick Steps)
=================================

1) Initialize repo and commit locally (if not already initialized):

```powershell
cd "c:\Users\ramch\OneDrive\Desktop\std_project_manage (6)"
git init
git add .
git commit -m "Initial commit"
```

2) Create a repository on GitHub & push (two ways):

- Using the GitHub CLI (recommended):

```powershell
gh repo create your-github-username/std_project_manage --public --source=. --remote=origin --push
```

- Or create a repository via GitHub web UI and then set the remote and push:

```powershell
git remote add origin https://github.com/<USERNAME>/std_project_manage.git
git push -u origin main
```

3) Build & test locally (optional):

```powershell
npm ci
npm run build
```

4) GitHub Actions (automated):

- The workflow `.github/workflows/deploy.yml` will automatically run on push to `main`, build your project and publish the `/build` folder to the `gh-pages` branch.
- If your site will live at `https://<USERNAME>.github.io/<REPO>/` then set the `base` property in `vite.config.ts` to `'/<REPO>/'` or, preferably, set the `GH_PAGES_BASE` environment var to `'/<REPO>/'` in the Actions workflow.

5) Configure Env / Base path for GitHub Pages in Actions

Edit `.github/workflows/deploy.yml` to set the environment variable BEFORE the build step (add this under env):

```yaml
      - name: Build
        env:
          GH_PAGES_BASE: '/std_project_manage/'
        run: npm run build
```

6) Confirm & Go Live

- After pushing to `main`, the workflow will run and push the built files to `gh-pages`. The Pages URL is available via repo settings → Pages.

Additional tips
- If you prefer to use a custom domain, see repository settings → Pages for instructions.
- If you prefer Vercel/Netlify deployments, they offer easier zero-config deployments; I can also set that up if you prefer.
