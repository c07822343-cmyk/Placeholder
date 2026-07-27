# Deploying DTO — free, 24/7 hosting

The site is plain static HTML/CSS/JS, so any static host will run it for free, forever, with no
server and no database. Everything is already committed on the branch
`arena/019fa143-placeholder`.

Pick **one** of the options below. Option A is the simplest if you want to stay on GitHub.

---

## Option A — GitHub Pages (recommended, ~2 minutes)

I could not enable Pages automatically because the agent token doesn't have repo-admin rights, and
**Pages on a private repo requires a paid plan** — so first make the repo public (free tier):

1. Go to <https://github.com/c07822343-cmyk/Placeholder/settings>
2. Scroll to **Danger Zone → Change repository visibility → Make public**.

Then turn on Pages:

3. Go to **Settings → Pages**
4. Under **Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: **`arena/019fa143-placeholder`** (or `main` after you merge), folder **`/ (root)`**
5. Click **Save**. After ~1 minute the site is live at:

```
https://c07822343-cmyk.github.io/Placeholder/
```

The `.nojekyll` file in the repo root is already there so GitHub serves the files as-is.

### Optional: automated deploys
If you prefer the GitHub Actions deployment method instead of branch deployment, copy
`docs/github-pages-workflow.yml.txt` to `.github/workflows/pages.yml` and commit it from your own
account (the agent token isn't allowed to create workflow files), then set
**Settings → Pages → Source → GitHub Actions**.

---

## Option B — Cloudflare Pages (free, works with a private repo)

1. Sign in at <https://dash.cloudflare.com> → **Workers & Pages → Create → Pages → Connect to Git**
2. Authorize GitHub and pick `c07822343-cmyk/Placeholder`
3. Production branch: `arena/019fa143-placeholder`
4. Framework preset: **None**. Build command: **leave empty**. Build output directory: **`/`**
5. **Save and Deploy** → live at `https://<project>.pages.dev`

Unlimited free bandwidth, no sleeping, custom domains free.

---

## Option C — Netlify (free, drag-and-drop, no Git needed)

- Fast path: go to <https://app.netlify.com/drop> and drag the whole project folder onto the page.
  It's live in seconds at a `*.netlify.app` URL.
- Or **Add new site → Import from Git**, choose the repo, leave the build command empty and set the
  publish directory to `.`

---

## Option D — Vercel (free)

<https://vercel.com/new> → import the repo → Framework preset **Other** → no build command →
output directory `.` → Deploy.

---

## After it's live

- **Custom domain** (optional): all four hosts support free custom domains with automatic HTTPS.
- **Updating listings:** edit `data/listings.json` and push — the site picks it up on next load.
- **Updating page copy:** edit the strings in `build.py`, run `python3 build.py`, and push the
  regenerated `.html` files.

## Local preview

```bash
cd Placeholder
python3 -m http.server 8000
# http://localhost:8000
```
