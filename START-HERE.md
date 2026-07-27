# Get the site online — the easy way

**Fastest option: 30 seconds, no account, no Git, no settings.**

---

## Option A — Drag and drop (start here)

1. Download **`dto-website.zip`** from this repo
   ([direct link](https://github.com/c07822343-cmyk/Placeholder/raw/arena/019fa143-placeholder/dto-website.zip)
   — click the download icon)
2. Go to **<https://app.netlify.com/drop>**
3. **Drag the zip file onto the page**

That's it. The site is live at a URL like `https://silly-name-123.netlify.app`.

Free forever, HTTPS included, never sleeps, no credit card.

### Then (optional, 1 minute)
- **Pick a nicer name:** sign up with the button it shows you (free — email or GitHub login), then
  **Site configuration → Change site name** → e.g. `dto-exchange` → your URL becomes
  `https://dto-exchange.netlify.app`
- Without signing up the site still stays live, you just can't rename it or update it later.

### To update the site later
Re-drag a new zip onto the same page (or your site's **Deploys** tab). Takes seconds.

---

## Option B — Connect GitHub (auto-updates)

Slightly more setup, but then **every change you push goes live automatically** — no re-dragging.
Best once things settle down.

Recommended host: **Cloudflare Pages** (unlimited bandwidth, works with your private repo).

1. <https://dash.cloudflare.com> → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. Authorize GitHub, give it access to `c07822343-cmyk/Placeholder`
3. Settings:
   - **Production branch:** `arena/019fa143-placeholder`
   - **Framework preset:** `None`
   - **Build command:** *leave empty*
   - **Build output directory:** `/`
4. **Save and Deploy** → live at `https://<name>.pages.dev`

Full details and alternatives (Netlify via Git, Vercel) are in [`DEPLOY.md`](DEPLOY.md).

---

## Which should I pick?

| | Drag & drop | Connect GitHub |
|---|---|---|
| Time to live | 30 seconds | ~3 minutes |
| Account needed | No | Yes (free) |
| Updates | Re-drag a zip | Automatic on push |
| Good for | Getting online **now** | Long-term |

You can start with A and switch to B whenever — nothing is wasted.

---

## After it's live

Two things left, both optional and neither blocks launch:

1. **Connect the request form to Google Forms** so applications land in a spreadsheet instead of
   your inbox → [`SETUP-GOOGLE-FORM.md`](SETUP-GOOGLE-FORM.md) (~10 min)

   *Until then the Apply page still works — it opens a prefilled email to staff.*

2. **Add listings** by editing `data/listings.json` → see [`README.md`](README.md)

---

## Regenerating the zip

If you change the site and want a fresh zip for drag-and-drop:

```bash
python3 build.py                 # only if you edited build.py
python3 make-zip.py
```
