# Updating the site without losing your URL

The URL stays the same as long as you **update the existing site** instead of creating a new one.
The only way to lose it is to drop a fresh zip on <https://app.netlify.com/drop> again — that makes
a brand-new site with a brand-new random URL every time.

There's one thing you must do to make the URL permanently yours.

---

## The one-time step: claim the site

When you drag a zip onto Netlify Drop **without an account**, the site is live but unclaimed — it's
a temporary sandbox. You cannot update it, and you don't really own the URL.

Fix it in 60 seconds:

1. Right after dropping the zip, Netlify shows a banner along the lines of
   **"Sign up to claim this site"** — click it (free; email or GitHub login)
2. Once signed in, the site appears in your dashboard and is yours permanently
3. **Site configuration → Change site name** → pick something real, e.g. `dto-exchange`

Your permanent URL becomes `https://dto-exchange.netlify.app`.

> Missed the claim banner? Just drop the zip again while **logged in**, rename that site, and ignore
> the unclaimed one — it'll be discarded.

---

## Updating from then on — pick one

### Method 1 · Drag onto the same site (manual, keeps URL)

1. Regenerate the package:
   ```bash
   python3 make-zip.py
   ```
2. Go to <https://app.netlify.com> → click **your site** → **Deploys** tab
3. Drag `dto-website.zip` onto the drop area at the bottom of that page
   *(labelled "Need to update your site? Drag and drop your site folder here")*

Live in ~10 seconds at the **same URL**.

**The important bit:** drop it on your *site's Deploys tab*, **not** on `app.netlify.com/drop`.
Same gesture, completely different result — the Deploys tab updates your site, the Drop page makes a
new one.

### Method 2 · Connect GitHub (automatic, recommended)

Do this once and you never touch a zip again — every push publishes itself.

1. Your site → **Site configuration → Build & deploy → Continuous deployment** → **Link repository**
2. Choose GitHub, authorize, pick `c07822343-cmyk/Placeholder` (private repos are fine)
3. Set **Branch to deploy:** `arena/019fa143-placeholder`
4. Build command: *empty* · Publish directory: `.`
5. Save

Now updating is just:

```bash
git add -A
git commit -m "Update listings"
git push origin arena/019fa143-placeholder
```

The site rebuilds automatically in ~30 seconds. Same URL, always.

You can even skip the terminal entirely: edit `data/listings.json` in the GitHub web UI, click
**Commit changes**, and the site updates on its own.

---

## What you'll actually be updating

### Adding a listing (most common)
Edit `data/listings.json`, add an object to the `listings` array:

```json
{
  "name": "New Doc",
  "description": "What it is",
  "type": "stock",
  "doxstox": 2400,
  "verified": true,
  "askingPrice": null
}
```

No rebuild needed — this file is read by the browser at page load. Just redeploy.

### Changing page text
Edit the strings in `build.py`, then regenerate the HTML:

```bash
python3 build.py
python3 make-zip.py     # only if you're using the drag method
```

> Don't edit the `.html` files directly — `build.py` overwrites them.

### Connecting the Google Form
Edit `assets/config.js` only. See [`SETUP-GOOGLE-FORM.md`](SETUP-GOOGLE-FORM.md).

---

## Rolling back a bad update

Netlify keeps every previous deploy. Site → **Deploys** → click an older one →
**Publish deploy**. Instantly back, same URL. This works with both methods.

---

## If you want a custom domain later

Buy a domain (~$10/yr) and add it under **Domain management → Add a domain**. Netlify issues the
HTTPS certificate free and automatically. Your `.netlify.app` URL keeps working too, so nothing
breaks.

Doing this also means you're never locked to a host — point the domain at a different provider and
the address your users know stays identical.

---

## Quick reference

| Goal | Do this |
|---|---|
| Make the URL permanently mine | Sign up free, claim the site, rename it |
| Update manually | `python3 make-zip.py` → drag onto **Deploys tab** |
| Update automatically | Link the GitHub repo once, then just `git push` |
| Undo a bad deploy | Deploys → older deploy → Publish deploy |
| Never lose the URL | Never use `app.netlify.com/drop` twice |
