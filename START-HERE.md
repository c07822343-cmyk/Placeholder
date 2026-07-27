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

### Then — important, 1 minute
When the site appears, Netlify shows a **"Sign up to claim this site"** banner. **Click it** (free,
email or GitHub login).

This matters: an unclaimed site can't be updated, and the URL isn't really yours. Once claimed, go to
**Site configuration → Change site name** and pick something real like `dto-exchange` — your
permanent URL becomes `https://dto-exchange.netlify.app`.

### To update the site later, keeping the same URL
Go to your site's **Deploys** tab and drag the new zip there — **not** onto the Drop page again
(that would create a second, separate site with a different URL).

Full details, plus how to make updates automatic: **[`UPDATING.md`](UPDATING.md)**

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
