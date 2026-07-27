# DTO — Docs Trade Organization

Official website for **DTO (Docs Trade Organization)**, the Google Docs marketplace and exchange
created by BananaNetworkz.

Static HTML/CSS/JS. No backend, no database, no dependencies, no build step needed to serve it —
which is what makes it free to host forever.

---

## Pages

| File | Purpose |
|---|---|
| `index.html` | Home — what DTO is, the four-step apply flow, valuation overview |
| `how-it-works.html` | Buying & selling, DoxStox, shares, valuation process, mission |
| `doxstox.html` | How docs are valued — the staff review process |
| `buyouts.html` | Real-money buyout system, 7% fee calculator, 9-step process |
| `listings.html` | Live listings — searchable, filterable, sortable |
| `apply.html` | **Request system** — multi-step wizard, timeline, FAQ |
| `404.html` | Not-found page |

## The request system

`apply.html` contains a four-to-five step wizard that handles all incoming requests:

- **Three request types** — Stock Listing, Full Buyout, Valuation Only
- **Conditional steps** — valuation-only requests skip the asking price question
- **Live DoxStox preview** as the applicant moves the stat sliders
- **Live 7% fee breakdown** on buyout asking prices
- **Inline validation** with clear per-field errors
- **Review screen** before submitting
- **Ticket ID** (e.g. `DTO-7F3K2A`) generated for every request

Submissions post into a **Google Form**, so requests arrive as rows in a spreadsheet you can sort
and filter. Applicants never see Google Forms — they only see the site.

**Setup: see [`SETUP-GOOGLE-FORM.md`](SETUP-GOOGLE-FORM.md)** (about 10 minutes, one time).
Once it's connected, submissions go straight into your Google Form and its linked spreadsheet.

## Hosting

**New here? Read [`START-HERE.md`](START-HERE.md)** — the fastest route is dragging
`dto-website.zip` onto <https://app.netlify.com/drop>. Live in 30 seconds, no account needed.

Once it's live, **[`UPDATING.md`](UPDATING.md)** covers publishing changes without losing your URL.

For auto-deploying from GitHub (works with this private repo), see [`DEPLOY.md`](DEPLOY.md).
Recommended: Cloudflare Pages — unlimited bandwidth, free.

---

## Day-to-day tasks

### Add or update a listing
Edit **`data/listings.json`** and push. Editable straight from the GitHub web UI.

```json
{
  "name": "Doc name",
  "description": "One-line description",
  "type": "stock",
  "doxstox": 3025,
  "verified": true,
  "askingPrice": null
}
```

- `type` — `"stock"` or `"buyout"`
- `verified` — `true` → green Verified badge, `false` → In Review
- `askingPrice` — USD number for buyouts, `null` for stock listings
- `doxstox` / `sharePrice` — the values **you assign during review**. Use `null` for either while
  review is pending and the listing shows "Pending" / "Not yet set". Nothing is auto-calculated.

### Change the Google Form connection
Edit **`assets/config.js`** only. Staff emails, fee rate and ticket prefix live there too.

### Change page content
The `.html` files are **generated** — don't edit them directly, your changes get overwritten.
Edit the strings in `build.py`, then:

```bash
python3 build.py
```

### Local preview
```bash
python3 -m http.server 8000
# http://localhost:8000
```

---

## Project layout

```
├── build.py                  # generates the .html files
├── make-zip.py               # packages dto-website.zip for drag-and-drop hosting
├── assets/
│   ├── config.js             # ← Google Form + staff settings (edit this)
│   ├── style.css             # all styling
│   ├── app.js                # nav, calculators, listings table
│   └── requests.js           # the request wizard
├── data/listings.json        # ← listings (edit this)
├── tools/get-entry-ids.py    # pulls entry IDs out of your Google Form
├── START-HERE.md             # ← easiest way to get online
├── UPDATING.md               # how to update without losing your URL
├── FORM-QUESTIONS.md         # the 16 Google Form questions to create
├── SETUP-GOOGLE-FORM.md      # request system setup
└── DEPLOY.md                 # hosting setup (Git-connected)
```

## Valuation

DoxStox scores and share prices are **assigned by DTO staff** through manual review. There is no
public formula and the site calculates nothing — it displays exactly the values you put in
`data/listings.json`.

Staff review partnerships and overall doc quality, then assign a score.

## Contact

- the.crypt1c.core@gmail.com (fastest)
- 494325@bsd48.org
- Calderman@icloud.com
