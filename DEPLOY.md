# Deploying DTO — free, 24/7, private repo

The repo stays **private**. That rules out GitHub Pages (Pages on a private repo requires a paid
GitHub plan), but the hosts below all deploy from a private GitHub repo on their **free** tier, with
free HTTPS, no sleeping, and no credit card.

The site is plain static HTML/CSS/JS — no build step, no server, no database. Config files for all
three hosts are already committed, so you just click through the connect flow.

**Branch to deploy:** the branch you want the host to publish from.

If you're using this repo in Arena right now, that's **`arena/019fa46a-placeholder`**. If you later
move the site to another long-lived branch, use that branch instead.

---

## Option 1 — Cloudflare Pages ⭐ recommended

Best free tier of the three: unlimited bandwidth, unlimited requests, 500 builds/month.

1. Sign up / log in at <https://dash.cloudflare.com>
2. Left sidebar → **Workers & Pages** → **Create** → **Pages** tab → **Connect to Git**
3. Click **Connect GitHub**, authorize Cloudflare, and grant it access to the
   `c07822343-cmyk/Placeholder` repository (choose *Only select repositories* if you like — private
   repos are fully supported)
4. Select the **Placeholder** repo → **Begin setup**
5. Fill in:
   - **Project name:** `dto` (this becomes your URL)
   - **Production branch:** the branch you're hosting from
     *(in Arena right now: `arena/019fa46a-placeholder`)*
   - **Framework preset:** `None`
   - **Build command:** *leave completely empty*
   - **Build output directory:** `/`
6. **Save and Deploy**

Live in ~30 seconds at:

```
https://dto.pages.dev
```

Every future push to that branch redeploys automatically. The committed `_headers` file is picked up
by Cloudflare for caching and security headers.

---

## Option 2 — Netlify

Free tier: 100 GB bandwidth/month, 300 build minutes/month.

1. Log in at <https://app.netlify.com>
2. **Add new site** → **Import an existing project** → **Deploy with GitHub**
3. Authorize Netlify and grant access to the private `Placeholder` repo
4. Settings are auto-detected from the committed `netlify.toml`:
   - **Branch to deploy:** the branch you're hosting from
     *(in Arena right now: `arena/019fa46a-placeholder`)*
   - **Build command:** empty · **Publish directory:** `.`
5. **Deploy site** → live at `https://<random-name>.netlify.app`
   (rename it under **Site configuration → Change site name**, e.g. `dto.netlify.app`)

### Netlify without connecting Git at all
If you'd rather not link the repo: download/zip the project folder and drag it onto
<https://app.netlify.com/drop>. Live in seconds. Re-drag to update.

---

## Option 3 — Vercel

Free Hobby tier, private repos supported.

1. <https://vercel.com/new> → **Import Git Repository** → authorize GitHub → pick `Placeholder`
2. **Framework Preset:** `Other` · **Build Command:** empty · **Output Directory:** `.`
3. **Deploy** → live at `https://<project>.vercel.app`
4. Set the production branch under **Settings → Git → Production Branch** to the branch you're
   hosting from *(in Arena right now: `arena/019fa46a-placeholder`)*

`vercel.json` is already committed with the correct headers.

---

## Custom domain (optional, all three)

All three hosts give free custom domains with automatic HTTPS. Buy a domain (e.g. `dto.exchange`,
~$10/yr) and add it under the project's **Domains** tab, then point the nameservers/CNAME where they
tell you. Not required — the free `*.pages.dev` / `*.netlify.app` / `*.vercel.app` URL works
permanently.

Free-domain alternative: <https://www.js.org> or a `is-a.dev` subdomain if you want a nicer name at
zero cost.

---

## Running the site day to day

### Add or update a listing
Edit **`data/listings.json`**, commit, push. The host redeploys in seconds and the listings page
picks it up.

```json
{
  "name": "Doc name",
  "description": "One-line description shown under the name",
  "type": "stock",
  "doxstox": 3025,
  "verified": true,
  "askingPrice": null
}
```

- `type` — `"stock"` or `"buyout"`
- `doxstox` — the score you assigned during review (`null` if still pending)
- `verified` — `true` shows a green **Verified** badge, `false` shows **In Review**
- `sharePrice` — DTC per share you set for stock listings (`null` if still pending)
- `askingPrice` — USD number for buyouts; `null` for stock listings

You can edit this file straight from the GitHub web UI — no local setup needed.

### Change page copy
The `.html` files are generated. Edit the strings in `build.py`, then:

```bash
python3 build.py
git add -A && git commit -m "Update copy"
git push origin <your-hosting-branch>

# In Arena right now, that branch is:
# git push origin arena/019fa46a-placeholder
```

### Local preview
```bash
cd Placeholder
python3 -m http.server 8000
# http://localhost:8000
```

---

## Handling incoming requests

The **Apply** page has a built-in request wizard that submits into **Netlify Forms** when the site is
hosted on Netlify. No separate form service or server is required.

After deployment, open your Netlify dashboard and you'll see submissions under the site's **Forms**
section automatically.
