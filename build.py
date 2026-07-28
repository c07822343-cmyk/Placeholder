#!/usr/bin/env python3
"""Tiny static-site builder for DTO.

Writes the finished .html files into the repo root so GitHub Pages can serve
them directly. Run:  python3 build.py
"""
import pathlib

ROOT = pathlib.Path(__file__).parent
ASSET_VERSION = str(max(
    (ROOT / "build.py").stat().st_mtime_ns,
    (ROOT / "assets" / "app.js").stat().st_mtime_ns,
    (ROOT / "assets" / "config.js").stat().st_mtime_ns,
    (ROOT / "assets" / "requests.js").stat().st_mtime_ns,
    (ROOT / "assets" / "style.css").stat().st_mtime_ns,
))

NAV = [
    ("index.html", "Home"),
    ("how-it-works.html", "How It Works"),
    ("doxstox.html", "DoxStox"),
    ("buyouts.html", "Buyouts"),
    ("listings.html", "Listings"),
    ("apply.html", "Apply"),
]

EMAILS = [
    ("the.crypt1c.core@gmail.com", "Primary — best for fast responses"),
    ("494325@bsd48.org", "Secondary inbox"),
    ("Calderman@icloud.com", "Secondary inbox"),
]


def header(active):
    links = ""
    for h, t in NAV:
        cls = ' class="active"' if h == active else ""
        if h == "apply.html":
            cls = ' class="cta active"' if h == active else ' class="cta"'
        links += '<a href="%s"%s>%s</a>' % (h, cls, t)
    return f"""<header class="site">
  <div class="wrap nav">
    <a class="brand" href="index.html">
      <span class="mark">DTO</span>
      <span>Docs Trade Organization<small>By BananaNetworkz</small></span>
    </a>
    <button class="nav-toggle" aria-label="Toggle navigation" aria-expanded="false">&#9776;</button>
    <nav class="nav-links">{links}</nav>
  </div>
</header>"""


FOOTER = """<footer class="site">
  <div class="wrap">
    <div class="foot-grid">
      <div>
        <div class="brand" style="margin-bottom:12px">
          <span class="mark">DTO</span>
          <span>Docs Trade Organization<small>By BananaNetworkz</small></span>
        </div>
        <p>A marketplace and exchange for the Google Docs community — buy, sell, trade
        and invest in docs with staff-verified valuations.</p>
        <p><strong style="color:var(--text)">7% fee</strong> on every completed transaction supports
        platform maintenance, verification and staff operations.</p>
      </div>
      <div>
        <h4>Explore</h4>
        <a href="how-it-works.html">How It Works</a>
        <a href="doxstox.html">How Docs Are Valued</a>
        <a href="buyouts.html">Full Doc Buyouts</a>
        <a href="listings.html">Live Listings</a>
        <a href="apply.html">Apply / List Your Doc</a>
        <a href="apply.html#faq">FAQ</a>
      </div>
      <div>
        <h4>Contact DTO Staff</h4>
        <a href="mailto:the.crypt1c.core@gmail.com">the.crypt1c.core@gmail.com</a>
        <a href="mailto:494325@bsd48.org">494325@bsd48.org</a>
        <a href="mailto:Calderman@icloud.com">Calderman@icloud.com</a>
      </div>
    </div>
    <div class="copyright">
      &copy; <span data-year></span> DTO — Docs Trade Organization · Created by BananaNetworkz.
      All listings and valuations are reviewed manually by DTO staff.
    </div>
  </div>
</footer>"""


def page(filename, title, description, body, active=None, extra_head="", extra_scripts=""):
    active = active or filename
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{description}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{description}">
<meta property="og:type" content="website">
<meta name="theme-color" content="#070b12">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%23f5c542'/><text x='50' y='68' font-size='46' font-family='sans-serif' font-weight='bold' text-anchor='middle' fill='%2314100a'>DTO</text></svg>">
<link rel="stylesheet" href="assets/style.css?v={ASSET_VERSION}">
{extra_head}
</head>
<body>
{header(active)}
<main>
{body}
</main>
{FOOTER}
<script src="assets/config.js?v={ASSET_VERSION}"></script>
<script src="assets/app.js?v={ASSET_VERSION}"></script>
<script src="assets/requests.js?v={ASSET_VERSION}"></script>
{extra_scripts}
</body>
</html>
"""
    (ROOT / filename).write_text(html, encoding="utf-8")
    print("wrote", filename)


# --------------------------------------------------------------------------
# Home
# --------------------------------------------------------------------------
home = """
<section class="hero">
  <div class="wrap">
    <span class="eyebrow">By BananaNetworkz</span>
    <h1>The exchange where a <span class="accent">Google Doc</span><br>becomes a real asset.</h1>
    <p class="lede">DTO — the Docs Trade Organization — is a marketplace and exchange built for the
    Google Docs community. Buy, sell, trade and invest in docs, with every value assigned through
    the DoxStox review process by DTO staff.</p>
    <div class="hero-cta">
      <a class="btn btn-gold" href="apply.html">List your doc</a>
      <a class="btn btn-ghost" href="listings.html">Browse listings</a>
      <a class="btn btn-ghost" href="doxstox.html">How docs are valued</a>
    </div>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <div class="grid g4">
      <div class="card stat"><span class="num">7%</span><span class="label">Transaction fee</span></div>
      <div class="card stat"><span class="num">4</span><span class="label">Valuation factors</span></div>
      <div class="card stat"><span class="num">Weekly</span><span class="label">Score updates</span></div>
      <div class="card stat"><span class="num">100%</span><span class="label">Staff verified</span></div>
    </div>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <h2>What DTO does</h2>
    <p class="section-sub">DTO gives the Docs community a structured system for determining what a doc
    is actually worth — and a safe way to trade it.</p>
    <div class="grid g3">
      <div class="card">
        <span class="icon">&#128220;</span>
        <h3>Buy &amp; sell docs</h3>
        <p>List your doc, get it reviewed and valued by staff, then negotiate or sell at the listed
        price inside a private DTO chat room.</p>
      </div>
      <div class="card">
        <span class="icon">&#128200;</span>
        <h3>DoxStox valuation</h3>
        <p>Every registered doc gets a DoxStox score assigned by DTO staff after manual review —
        updated weekly.</p>
      </div>
      <div class="card">
        <span class="icon">&#129297;</span>
        <h3>Invest in shares</h3>
        <p>Owners can issue shares. Investors buy into a doc's future value without taking ownership,
        and trade those shares through DTO.</p>
      </div>
      <div class="card">
        <span class="icon">&#128176;</span>
        <h3>Real-money buyouts</h3>
        <p>Full Doc Buyouts transfer complete ownership for real currency, verified end-to-end by
        DTO staff.</p>
      </div>
      <div class="card">
        <span class="icon">&#128737;</span>
        <h3>Scam resistance</h3>
        <p>Manual verification and staff-adjusted valuations keep the market
        fair and resistant to manipulation.</p>
      </div>
      <div class="card">
        <span class="icon">&#127760;</span>
        <h3>A real economy</h3>
        <p>The goal: a fair, organized, community-driven economy where docs are recognised as valuable
        projects worth building.</p>
      </div>
    </div>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <h2>Quality-first valuation</h2>
    <p class="section-sub">DTO now uses a public quality-first DoxStox rubric. Staff still review every
    doc manually, but the score is anchored to four weighted factors instead of raw hype or link counts.</p>
    <div class="grid g2">
      <div class="card"><h3>Utility × 250</h3><p>The evolved version of influence: how essential the doc's function is to the BananaNetworkz ecosystem.</p></div>
      <div class="card"><h3>Aesthetics × 150</h3><p>Visual professionalism, structure, navigation and overall readability.</p></div>
      <div class="card"><h3>Integration × 100</h3><p>Depth of real cross-doc workflows and embedded community connections, not surface-level link lists.</p></div>
      <div class="card"><h3>Verification × 100</h3><p>Staff-vetted trust level and reputation, scored on a 1–5 grade scale.</p></div>
    </div>
    <div class="notice mt-24"><strong>DS = (Utility × 250) + (Aesthetics × 150) + (Integration × 100) + (Verification × 100)</strong></div>
    <p class="mt-24"><a class="btn btn-gold" href="doxstox.html">See the full scoring rubric</a></p>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <h2>Applying takes about a minute</h2>
    <p class="section-sub">The whole request happens right here on the site — no account, no sign-in,
    nothing to install. Pick what you want to do, tell us about your doc, and submit.</p>
    <div class="grid g4">
      <div class="card"><h3>1 · Choose</h3><p>Stock listing, full buyout, or a valuation on its own.</p></div>
      <div class="card"><h3>2 · Describe</h3><p>Doc link, description, and background on how your doc stands in the community.</p></div>
      <div class="card"><h3>3 · Submit</h3><p>Your request goes straight into DTO's review queue with a ticket ID.</p></div>
      <div class="card"><h3>4 · Hear back</h3><p>Staff respond within 24–48 hours with your verified score or a decision.</p></div>
    </div>
    <p class="mt-24 center"><a class="btn btn-gold" href="apply.html">Start your request</a></p>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <h2>Prefer to email?</h2>
    <p class="section-sub">The request form is fastest, but staff are reachable directly at any of these
    addresses.</p>
    <div class="grid g3">
""" + "".join(
    f'<a class="mail-tile" href="mailto:{e}"><span class="em">&#9993;</span>'
    f'<span>{e}<small>{note}</small></span></a>'
    for e, note in EMAILS
) + """
    </div>
    <p class="mt-24"><a class="btn btn-gold" href="apply.html">Start a request</a></p>
  </div>
</section>
"""

# --------------------------------------------------------------------------
# How it works
# --------------------------------------------------------------------------
how = """
<section class="hero" style="padding-bottom:26px">
  <div class="wrap">
    <span class="eyebrow">Overview</span>
    <h1>How DTO works</h1>
    <p class="lede">DTO (Docs Trade Organization) is a marketplace and exchange created by
    BananaNetworkz for the Google Docs community. It allows users to buy, sell, trade and invest in
    Google Docs while providing a structured system for determining their value.</p>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <h2>Buying and selling docs</h2>
    <p class="section-sub">Users may list their docs for sale through DTO. Once listed, DTO staff review
    the doc and assign it a value based on its partnerships and overall
    standing within the community.</p>
    <div class="grid g2">
      <div class="card">
        <h3>Negotiation happens privately</h3>
        <p>Interested buyers may negotiate with the owner or purchase the doc at the listed price. This
        happens in private chat rooms provided by DTO staff.</p>
      </div>
      <div class="card">
        <h3>DTO records the transfer</h3>
        <p>Once a transaction is completed, DTO records the ownership transfer and collects a 7%
        transaction fee, which supports the operation and maintenance of DTO.</p>
      </div>
      <div class="card">
        <h3>Full ownership</h3>
        <p>Buying a doc grants full ownership and control of that doc unless otherwise specified by the
        seller.</p>
      </div>
      <div class="card">
        <h3>Everything is verified</h3>
        <p>All transactions are handled manually by DTO staff for security. Private deals made outside
        DTO are not recognised.</p>
      </div>
    </div>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <h2>DoxStox</h2>
    <p class="section-sub">DoxStox is DTO's valuation and investment system. The legacy popularity-first
    model has been replaced by a qualitative structural model focused on what the doc does, how polished
    it is, how deeply it is embedded and how trustworthy it is.</p>
    <div class="grid g2">
      <div class="card">
        <h3>The quality-first variables</h3>
        <ul class="clean">
          <li><strong>Utility</strong> — what users can actually do with the doc</li>
          <li><strong>Aesthetics &amp; organization</strong> — design work, structure and navigation</li>
          <li><strong>Integration depth</strong> — structural ecosystem dependency, not raw link count</li>
          <li><strong>Verification grade</strong> — trust, trade history and staff-vetted reliability</li>
        </ul>
      </div>
      <div class="card">
        <h3>Why this replaced the old model</h3>
        <p>DTO is deliberately moving away from inflated popularity signals and shallow partnership padding.
        Practical usefulness and craftsmanship now matter more than raw attention.</p>
      </div>
    </div>
    <div class="notice mt-24"><strong>DS = (Utility × 250) + (Aesthetics × 150) + (Integration × 100) + (Verification × 100)</strong> and staff review scores weekly.</div>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <h2>Investing and shares</h2>
    <p class="section-sub">Doc owners may choose to issue shares for their doc.</p>
    <ul class="clean">
      <li>Purchasing shares does <strong>not</strong> grant ownership of the doc itself — it represents an
      investment in that doc's future value.</li>
      <li>As a doc grows, gains partnerships or strengthens its community standing, its
      <strong>DoxStox score may increase</strong>.</li>
      <li>A rising DoxStox score can lead to a <strong>higher share value</strong>.</li>
      <li>Investors may <strong>buy, sell and trade shares</strong> through DTO.</li>
    </ul>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <h2>The DTO valuation process</h2>
    <p class="section-sub">All values displayed on DTO are determined by DTO staff through manual review
    using the published quality-first rubric.</p>
    <div class="card">
      <p>Staff assign 1–10 scores for Utility, Aesthetics, Integration and Verification, apply the official
      weights, then convert the DoxStox score into share price with <strong>SP = DS / 100</strong>.
      Manual review is still mandatory, but "feeling-based" scoring and raw-number inflation are no longer
      the standard.</p>
    </div>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <h2>DTO mission</h2>
    <div class="callout" style="font-family:var(--font);font-size:1.15rem;line-height:1.6">
      To create a fair, organized and community-driven economy where Google Docs can be recognized as
      valuable projects, traded safely, and invested in by members of the community.
    </div>
    <p class="mt-24"><a class="btn btn-gold" href="apply.html">List your doc</a>
    <a class="btn btn-ghost" href="doxstox.html">See how value is calculated</a></p>
  </div>
</section>
"""

# --------------------------------------------------------------------------
# DoxStox — staff-determined valuation
# --------------------------------------------------------------------------
doxstox = """
<section class="hero" style="padding-bottom:26px">
  <div class="wrap">
    <span class="eyebrow">Valuation</span>
    <h1>The <span class="accent">quality-first</span> DoxStox rubric</h1>
    <p class="lede">DTO has officially moved from a quantity-first valuation model to a quality-first
    system. Every registered doc still receives a DoxStox score through manual staff review, but the
    baseline score now follows a public weighted rubric.</p>
    <div class="hero-cta">
      <a class="btn btn-gold" href="apply.html">Request a valuation</a>
      <a class="btn btn-ghost" href="listings.html">See scored docs</a>
    </div>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <h2>The official formula</h2>
    <p class="section-sub">These weights are the DTO standard and are non-negotiable for baseline scoring.</p>
    <div class="callout" style="font-family:var(--font);font-size:1.15rem;line-height:1.6">
      <strong>DS = (Utility × 250) + (Aesthetics × 150) + (Integration × 100) + (Verification × 100)</strong>
    </div>
    <div class="grid g2 mt-24">
      <div class="card"><h3>Utility × 250</h3><p>The evolved version of influence: practical, indispensable value inside the BananaNetworkz ecosystem.</p></div>
      <div class="card"><h3>Aesthetics × 150</h3><p>Visual professionalism, structural layout, navigational clarity and overall polish.</p></div>
      <div class="card"><h3>Integration × 100</h3><p>Depth of real cross-doc workflows and embedded ecosystem value, not raw link counts.</p></div>
      <div class="card"><h3>Verification × 100</h3><p>Staff-vetted trust level and reputation, graded from 1 to 5.</p></div>
    </div>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <h2>How the four variables are judged</h2>
    <div class="grid g2">
      <div class="card">
        <h3>Utility</h3>
        <p>Relevance beats traffic. A tool used by a small group of power users can outrank a widely viewed
        doc if it is genuinely essential to ecosystem operations.</p>
        <ul class="clean">
          <li><strong>10</strong> — essential ecosystem tool</li>
          <li><strong>8–9</strong> — high-utility specialist resource</li>
          <li><strong>5–7</strong> — functional and clearly useful</li>
          <li><strong>1–4</strong> — limited use or no clear purpose</li>
        </ul>
      </div>
      <div class="card">
        <h3>Aesthetics &amp; organization</h3>
        <p>Professional formatting matters. Busy, chaotic or unstructured docs are hard-capped low here.</p>
        <ul class="clean">
          <li><strong>9–10</strong> — professional grade presentation</li>
          <li><strong>7–8</strong> — clean and well-organized</li>
          <li><strong>5–6</strong> — standard but basic</li>
          <li><strong>1–4</strong> — unstructured, cluttered or chaotic</li>
        </ul>
      </div>
      <div class="card">
        <h3>Integration depth</h3>
        <p>DTO now values depth of connection over partnership quantity. A shared workflow beats a long list
        of shallow links.</p>
        <ul class="clean">
          <li><strong>8–10</strong> — deeply embedded cross-doc systems</li>
          <li><strong>5–7</strong> — active, mutually valuable partner network</li>
          <li><strong>3–4</strong> — surface-level link lists</li>
          <li><strong>1–2</strong> — isolated from the ecosystem</li>
        </ul>
      </div>
      <div class="card">
        <h3>Verification status</h3>
        <p>Reputation is part of the score. Reliability, successful trade history and trust are all counted.</p>
        <ul class="clean">
          <li><strong>5</strong> — verified (staff-vetted)</li>
          <li><strong>4</strong> — trusted and documented</li>
          <li><strong>3</strong> — active / neutral standing</li>
          <li><strong>1–2</strong> — flagged or risky</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <h2>Share price conversion</h2>
    <p class="section-sub">Once staff calculate the DoxStox score, stock listings convert it into share price with a fixed rule.</p>
    <div class="grid g2">
      <div class="card">
        <h3>Conversion rule</h3>
        <p><strong>SP = DS / 100</strong>. Internal records keep two decimal places. Public displays may be rounded
        for simplicity.</p>
      </div>
      <div class="card">
        <h3>Worked example</h3>
        <p>Utility 7, Aesthetics 8, Integration 6, Verification 5 gives:
        <strong>1750 + 1200 + 600 + 1000 = 4550 DS</strong>, which becomes <strong>45.50 DTC/share</strong>.</p>
      </div>
    </div>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <h2>Operational rules</h2>
    <div class="grid g2">
      <div class="card">
        <h3>Manual review only</h3>
        <p>Automated bots and scripts are prohibited. Every score must come from human staff assessment.</p>
      </div>
      <div class="card">
        <h3>Weekly audit</h3>
        <p>All DS scores and ticker values must be reviewed weekly. If a listing is not current, its status
        should move to <strong>Under Review</strong>.</p>
      </div>
      <div class="card">
        <h3>Fee nuance</h3>
        <p>The 7% transaction fee applies to full doc buyouts and marketplace transactions only — not to
        share investments themselves.</p>
      </div>
      <div class="card">
        <h3>Anti-manipulation</h3>
        <p>Feeling-based inflation, shallow partnership padding and private side deals all work against the
        purpose of the rubric and can result in immediate action from staff.</p>
      </div>
    </div>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <h2>Official status tags</h2>
    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>Status</th><th>Meaning</th></tr>
        </thead>
        <tbody>
          <tr><td><span class="badge status-active">Active</span></td><td>Registered, verified and tracking its DoxStox score.</td></tr>
          <tr><td><span class="badge status-for-sale">For Sale</span></td><td>Officially listed for a Full Buyout or Stock Listing.</td></tr>
          <tr><td><span class="badge status-under-review">Under Review</span></td><td>Currently undergoing valuation, verification or weekly audit.</td></tr>
          <tr><td><span class="badge status-sold">Sold</span></td><td>Full Buyout completed and ownership transferred.</td></tr>
          <tr><td><span class="badge status-frozen">Frozen</span></td><td>Trading suspended due to suspicious activity or formal review.</td></tr>
        </tbody>
      </table>
    </div>
    <div class="notice mt-24">Standard operating procedure: apply <strong>Frozen</strong> immediately if a doc is flagged for suspicious activity, scam reports or active investigation.</div>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <h2>Fairness and appeals</h2>
    <div class="grid g2">
      <div class="card">
        <h3>Consistency</h3>
        <p>The rubric gives staff a shared baseline while keeping review manual and community-aware.</p>
      </div>
      <div class="card">
        <h3>Disagree with a score?</h3>
        <p>Email staff with your ticket ID and updated facts. Weekly audits and corrections remain part of the system.</p>
      </div>
    </div>
    <p class="mt-24"><a class="btn btn-gold" href="apply.html">Request a valuation</a>
    <a class="btn btn-ghost" href="how-it-works.html">How DTO works</a></p>
  </div>
</section>
"""

# --------------------------------------------------------------------------
# Buyouts
# --------------------------------------------------------------------------
buyouts = """
<section class="hero" style="padding-bottom:26px">
  <div class="wrap">
    <span class="eyebrow">Real money</span>
    <h1>Full Doc <span class="accent">Buyout</span> system</h1>
    <p class="lede">A Full Doc Buyout is when a Google Doc is completely purchased using real money
    instead of DTO Credits or shares. This results in full ownership transfer of the doc from the current
    owner to the buyer. All buyouts are handled and verified through DTO staff to ensure safety,
    legitimacy and fair pricing.</p>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <h2>How buyout listings work</h2>
    <p class="section-sub">DTO helps doc owners list a full sale and handles the process from review to transfer.</p>
    <div class="grid g2">
      <div class="card">
        <h3>What sellers submit</h3>
        <p style="margin-bottom:10px">To start a full buyout listing, send:</p>
        <ul class="clean">
          <li>Doc name</li>
          <li>Asking price (USD)</li>
          <li>Description</li>
          <li>Basic stats (partnerships, etc.)</li>
          <li>DTO evaluation (DoxStox score if available)</li>
        </ul>
      </div>
      <div class="card">
        <h3>What DTO does</h3>
        <ul class="clean">
          <li>Reviews the doc and listing details</li>
          <li>Publishes the listing once approved</li>
          <li>Facilitates contact and deal flow between buyer and seller</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <h2>Matching and negotiation</h2>
    <p class="section-sub">DTO acts as the middle layer between interested buyers and sellers.</p>
    <div class="grid g2">
      <div class="card">
        <ul class="clean">
          <li>Sellers submit docs for buyout listing</li>
          <li>DTO reviews and approves the listing</li>
          <li>DTO can introduce interested buyers once a listing is live</li>
        </ul>
      </div>
      <div class="card">
        <h3>What gets agreed</h3>
        <ul class="clean">
          <li><strong>Final price</strong></li>
          <li><strong>Transfer timing</strong></li>
          <li><strong>Any special conditions</strong></li>
        </ul>
      </div>
    </div>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <h2>Pricing system (real money)</h2>
    <p class="section-sub">All buyouts use real currency (USD or an agreed currency).</p>
    <div class="grid g3">
      <div class="card"><h3>Suggested range</h3><p>Based on the doc's DoxStox evaluation.</p></div>
      <div class="card"><h3>Market comparison</h3><p>How similar docs have been priced.</p></div>
      <div class="card"><h3>Sale history</h3><p>Previous sales, where available.</p></div>
    </div>
    <div class="notice mt-24">The final price is agreed between buyer and seller, with
    <strong>DTO acting as the verifier</strong>.</div>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <h2>The DTO fee — 7%</h2>
    <p class="section-sub">DTO takes a 7% transaction fee on every completed full buyout. It is applied
    automatically to the final sale price and funds platform maintenance, verification systems and staff
    operations.</p>
    <div class="calc">
      <div class="card">
        <label class="form-label" for="feePrice">Final sale price (USD)</label>
        <input type="number" id="feePrice" min="0" step="1" value="100">
        <p class="hint" style="color:var(--muted);font-size:.85rem;margin-top:10px">
          Example from the DTO rulebook: a doc sold for $100 means a $7 fee, the seller receives $93, and
          the buyer pays $100 total.</p>
      </div>
      <div class="result">
        <div class="ds-label">DTO fee (7%)</div>
        <div class="ds" id="feeOut">$7.00</div>
        <div class="breakdown">
          <div><span>Buyer pays</span><b id="buyerOut">$100.00</b></div>
          <div><span>DTO fee (7%)</span><b id="feeOut2"></b></div>
          <div><span>Seller receives</span><b id="sellerOut">$93.00</b></div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <h2>Buyout process</h2>
    <ol class="steps">
      <li><strong>Seller submits doc for buyout listing</strong>Send the doc link, name, description and asking price to DTO staff.</li>
      <li><strong>DTO verifies and approves listing</strong>Stats are checked and a DoxStox evaluation is attached.</li>
      <li><strong>Interested buyers are introduced</strong>DTO connects both sides once there is real interest.</li>
      <li><strong>Negotiation runs through DTO staff</strong>All contact stays inside the DTO process.</li>
      <li><strong>DTO facilitates negotiation and agreement</strong>In a private chat room provided by staff.</li>
      <li><strong>Payment is confirmed</strong>Verified by DTO before anything transfers.</li>
      <li><strong>DTO collects the 7% fee</strong>Applied to the final agreed sale price.</li>
      <li><strong>Ownership of the Google Doc is transferred</strong>Full control passes to the buyer.</li>
      <li><strong>Transaction is recorded as complete</strong>Logged in DTO's ownership records.</li>
    </ol>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <h2>Important rules</h2>
    <div class="notice warn">
      <ul class="clean">
        <li>All buyouts must go through <strong>DTO verification</strong></li>
        <li>Private deals outside DTO are <strong>not recognized</strong></li>
        <li>All communication and transfer steps must stay inside the DTO process</li>
        <li>The <strong>7% DTO fee</strong> applies to all completed buyouts</li>
        <li>Any suspicious activity may result in <strong>removal or blacklist</strong></li>
      </ul>
    </div>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <h2>Why this system exists</h2>
    <div class="grid g3">
      <div class="card"><h3>Prevent scams</h3><p>Real-money transactions carry real risk — DTO verifies both sides.</p></div>
      <div class="card"><h3>Structured negotiations</h3><p>DTO keeps the deal organized so both sides agree terms before the transfer happens.</p></div>
      <div class="card"><h3>Fair pricing</h3><p>DoxStox provides guidance instead of guesswork.</p></div>
      <div class="card"><h3>Trust &amp; transparency</h3><p>Every deal is recorded and verifiable.</p></div>
      <div class="card"><h3>Sustainable operations</h3><p>The 7% fee model keeps DTO running.</p></div>
      <div class="card"><h3>A structured marketplace</h3><p>Real-value trades in an organized venue.</p></div>
    </div>
    <p class="mt-24"><a class="btn btn-gold" href="apply.html">Submit a doc for buyout</a>
    <a class="btn btn-ghost" href="listings.html">See current buyout listings</a></p>
  </div>
</section>
"""

# --------------------------------------------------------------------------
# Listings
# --------------------------------------------------------------------------
listings = """
<section class="hero" style="padding-bottom:22px">
  <div class="wrap">
    <span class="eyebrow">Market</span>
    <h1>Live <span class="accent">listings</span></h1>
    <p class="lede">Docs currently listed on DTO for stock investment or full buyout. Every listing shown
    here has been submitted to DTO staff; verified listings have completed review.</p>
    <div class="hero-cta">
      <a class="btn btn-gold" href="apply.html">Add your doc</a>
      <a class="btn btn-ghost" href="doxstox.html">How scores are set</a>
    </div>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <div class="grid" style="grid-template-columns:1.4fr .8fr .8fr;gap:12px;margin-bottom:20px">
      <div>
        <label class="form-label" for="fSearch">Search</label>
        <input type="text" id="fSearch" placeholder="Search docs…" aria-label="Search listings by name or description">
      </div>
      <div>
        <label class="form-label" for="fType">Listing type</label>
        <select id="fType" aria-label="Filter by listing type">
          <option value="all">All listing types</option>
          <option value="stock">Stock listings</option>
          <option value="buyout">Full buyouts</option>
        </select>
      </div>
      <div>
        <label class="form-label" for="fSort">Sort by</label>
        <select id="fSort" aria-label="Sort listings">
          <option value="ds-desc">Highest DoxStox</option>
          <option value="ds-asc">Lowest DoxStox</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>
    </div>
    <p class="section-sub" id="listingCount" style="margin-bottom:14px"></p>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Doc</th><th>Type</th><th>DoxStox</th><th>Price</th><th>Status</th><th></th>
          </tr>
        </thead>
        <tbody id="listingRows">
          <tr><td colspan="6" style="text-align:center;padding:30px">Loading listings…</td></tr>
        </tbody>
      </table>
    </div>
    <div class="notice mt-24">DoxStox scores and share prices are set by DTO staff using the quality-first rubric and
    updated weekly. Buyout prices are asking prices in USD; the final figure is agreed between buyer and
    seller with DTO as verifier. The 7% DTO fee applies to completed buyouts and marketplace transactions,
    not to share investments themselves.</div>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <h2>Want to appear here?</h2>
    <p class="section-sub">Send DTO staff your doc link, name, a short description and whether you want a
    stock listing or a full buyout. Listings go live once review is complete.</p>
    <p><a class="btn btn-gold" href="apply.html">Start a request</a></p>
  </div>
</section>
"""

# --------------------------------------------------------------------------
# Listing detail
# --------------------------------------------------------------------------
listing_detail = """
<section class="hero" style="padding-bottom:22px">
  <div class="wrap">
    <span class="eyebrow">Listing</span>
    <h1 id="listingDetailTitle">Loading listing…</h1>
    <p class="lede" id="listingDetailLead">Pulling the latest public details for this listing from DTO's live listings sheet.</p>
    <div class="hero-cta">
      <a class="btn btn-ghost" href="listings.html">&#8592; Back to listings</a>
      <a class="btn btn-gold" href="apply.html#request">Ask DTO about this listing</a>
    </div>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <div id="listingDetailPage">
      <div class="card" style="padding:24px">Loading listing details…</div>
    </div>
  </div>
</section>
"""

# --------------------------------------------------------------------------
# Account
# --------------------------------------------------------------------------
account_page = """
<section class="hero" style="padding-bottom:30px">
  <div class="wrap">
    <span class="eyebrow">Account</span>
    <h1>Secure your <span class="accent">DTO account</span></h1>
    <p class="lede">Register with email and password, verify your inbox, then manage your portfolio,
    DTC balance visibility and trading access from one place.</p>
    <div class="hero-cta">
      <a class="btn btn-gold" href="#authPanels">Open account tools</a>
      <a class="btn btn-ghost" href="portfolio.html">Go to portfolio</a>
    </div>
  </div>
</section>

<section class="block" id="authPanels">
  <div class="wrap">
    <div id="firebaseNotice" class="setup-banner" hidden></div>
    <div class="grid g2">
      <div class="card auth-panel">
        <h2>Create account</h2>
        <p class="section-sub">Use a real email address — DTO requires email verification before trading.</p>
        <form id="registerForm" class="stack-form">
          <div class="field-wrap">
            <label class="form-label" for="regEmail">Email</label>
            <input id="regEmail" name="email" type="email" required placeholder="you@example.com">
          </div>
          <div class="field-wrap">
            <label class="form-label" for="regPassword">Password</label>
            <input id="regPassword" name="password" type="password" minlength="8" required placeholder="Minimum 8 characters">
          </div>
          <div class="field-wrap">
            <label class="form-label" for="regConfirm">Confirm password</label>
            <input id="regConfirm" name="confirm" type="password" minlength="8" required placeholder="Repeat password">
          </div>
          <button class="btn btn-gold" type="submit">Create account</button>
        </form>
      </div>
      <div class="card auth-panel">
        <h2>Login</h2>
        <p class="section-sub">Your session persists securely through Firebase Auth.</p>
        <form id="loginForm" class="stack-form">
          <div class="field-wrap">
            <label class="form-label" for="loginEmail">Email</label>
            <input id="loginEmail" name="email" type="email" required placeholder="you@example.com">
          </div>
          <div class="field-wrap">
            <label class="form-label" for="loginPassword">Password</label>
            <input id="loginPassword" name="password" type="password" required placeholder="Your password">
          </div>
          <button class="btn btn-gold" type="submit">Login</button>
        </form>
        <hr class="dash-sep">
        <h3>Reset password</h3>
        <form id="resetForm" class="stack-form compact-form">
          <div class="field-wrap">
            <label class="form-label" for="resetEmail">Email</label>
            <input id="resetEmail" name="email" type="email" required placeholder="you@example.com">
          </div>
          <button class="btn btn-ghost" type="submit">Send reset email</button>
        </form>
      </div>
    </div>

    <div class="card mt-24">
      <h2>Account status</h2>
      <div id="accountState">
        <p class="section-sub mb-0">Loading account status…</p>
      </div>
      <div class="hero-cta mt-24">
        <button class="btn btn-ghost" id="resendVerifyBtn" type="button" hidden>Resend verification email</button>
        <button class="btn btn-ghost" id="refreshVerifyBtn" type="button" hidden>Refresh verification status</button>
        <button class="btn btn-ghost" id="logoutBtn" type="button" hidden>Logout</button>
        <a class="btn btn-gold" href="portfolio.html">Open portfolio</a>
      </div>
    </div>
  </div>
</section>
"""

# --------------------------------------------------------------------------
# Portfolio
# --------------------------------------------------------------------------
portfolio_page = """
<section class="hero" style="padding-bottom:28px">
  <div class="wrap">
    <span class="eyebrow">Portfolio</span>
    <h1>Your <span class="accent">DTC portfolio</span></h1>
    <p class="lede">Track DTC balance, live shareholdings, structural valuation tiers and buy or sell
    using real-time DoxStox pricing from the cloud database.</p>
    <div class="hero-cta">
      <a class="btn btn-gold" href="#portfolioDashboard">Open dashboard</a>
      <a class="btn btn-ghost" href="account.html">Manage account</a>
    </div>
  </div>
</section>

<section class="block" id="portfolioDashboard">
  <div class="wrap">
    <div id="portfolioNotice" class="setup-banner" hidden></div>
    <div id="portfolioAuthGate" class="notice warn" hidden></div>

    <div class="grid g4 portfolio-metrics">
      <div class="card metric-card">
        <span class="metric-label">Net portfolio value</span>
        <strong class="metric-value" id="netValueOut">0 DTC</strong>
        <span class="metric-hint" id="netValueDelta">Waiting for account data…</span>
      </div>
      <div class="card metric-card">
        <span class="metric-label">DTC balance</span>
        <strong class="metric-value" id="balanceOut">0 DTC</strong>
        <span class="metric-hint">Spendable internal trading balance</span>
      </div>
      <div class="card metric-card">
        <span class="metric-label">Shareholdings</span>
        <strong class="metric-value" id="holdingsCountOut">0</strong>
        <span class="metric-hint">Open stock positions</span>
      </div>
      <div class="card metric-card">
        <span class="metric-label">Account badges</span>
        <div class="badge-row" id="accountBadges"></div>
        <span class="metric-hint" id="accountBadgeHint">Login required</span>
      </div>
    </div>

    <div class="grid g2 mt-24">
      <div class="card">
        <h2>Account summary</h2>
        <p class="section-sub">Live account state, restrictions and verified-buyer access all update from Firestore.</p>
        <div id="portfolioProfileSummary" class="summary-list"></div>
      </div>
      <div class="card">
        <h2>Trading rules snapshot</h2>
        <div class="summary-list">
          <div class="rev-row"><span>DoxStox formula</span><b>DS = (250×U) + (150×A) + (100×I) + (100×V)</b></div>
          <div class="rev-row"><span>Share price</span><b>SP = DS / 100</b></div>
          <div class="rev-row"><span>Buyout fee</span><b>7% on full buyouts</b></div>
          <div class="rev-row"><span>Share limits</span><b>100 total shares per doc</b></div>
        </div>
      </div>
    </div>

    <section class="mt-24">
      <h2>Full ownership docs</h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Ticker</th><th>Name</th><th>Status</th><th>DoxStox</th><th>Share Price</th></tr>
          </thead>
          <tbody id="ownedDocsRows">
            <tr><td colspan="5" style="text-align:center;padding:26px">Login to load ownership records.</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="mt-24">
      <h2>Partial shareholdings</h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Ticker</th><th>Quantity</th><th>Avg. Entry</th><th>Current SP</th><th>Market Value</th><th>Sell</th></tr>
          </thead>
          <tbody id="holdingsRows">
            <tr><td colspan="6" style="text-align:center;padding:26px">Login to load shareholdings.</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="mt-24">
      <h2>Marketplace</h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Ticker</th><th>Name</th><th>DoxStox</th><th>Current SP</th><th>Available Shares</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody id="marketRows">
            <tr><td colspan="7" style="text-align:center;padding:26px">Loading market data…</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="mt-24">
      <h2>Transaction history</h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Type</th><th>Ticker</th><th>Quantity</th><th>Total</th><th>Status</th><th>Time</th></tr>
          </thead>
          <tbody id="transactionRows">
            <tr><td colspan="6" style="text-align:center;padding:26px">Login to load transactions.</td></tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</section>
"""

# --------------------------------------------------------------------------
# Admin
# --------------------------------------------------------------------------
admin_page = """
<section class="hero" style="padding-bottom:28px">
  <div class="wrap">
    <span class="eyebrow">Admin</span>
    <h1>DTO <span class="accent">control panel</span></h1>
    <p class="lede">Admin-only tools for verified buyer approval, balance adjustments, trade restrictions,
    doc valuation management and transaction approvals.</p>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <div id="adminNotice" class="setup-banner" hidden></div>
    <div id="adminAuthGate" class="notice warn" hidden></div>

    <section>
      <h2>Create a market doc</h2>
      <p class="section-sub">This lets DTO staff add a new ticker to Firestore without opening Firebase Console.
      Once saved, it appears in the live portfolio marketplace immediately.</p>
      <div class="card">
        <form id="createDocForm" class="stack-form">
          <div class="grid g3">
            <div class="field-wrap">
              <label class="form-label" for="newTicker">Ticker</label>
              <input id="newTicker" name="ticker" type="text" required placeholder="DOC2">
            </div>
            <div class="field-wrap">
              <label class="form-label" for="newTitle">Title</label>
              <input id="newTitle" name="title" type="text" required placeholder="Doc title">
            </div>
            <div class="field-wrap">
              <label class="form-label" for="newType">Type</label>
              <select id="newType" name="type">
                <option value="stock">Stock listing</option>
                <option value="buyout">Full buyout</option>
              </select>
            </div>
            <div class="field-wrap">
              <label class="form-label" for="newUtility">Utility</label>
              <input id="newUtility" name="utility" type="number" min="1" max="10" step="1" required value="5">
            </div>
            <div class="field-wrap">
              <label class="form-label" for="newAesthetics">Aesthetics</label>
              <input id="newAesthetics" name="aesthetics" type="number" min="1" max="10" step="1" required value="5">
            </div>
            <div class="field-wrap">
              <label class="form-label" for="newIntegration">Integration</label>
              <input id="newIntegration" name="integration" type="number" min="1" max="10" step="1" required value="5">
            </div>
            <div class="field-wrap">
              <label class="form-label" for="newVerificationGrade">Verification Grade</label>
              <input id="newVerificationGrade" name="verificationGrade" type="number" min="1" max="5" step="1" required value="3">
            </div>
            <div class="field-wrap">
              <label class="form-label" for="newStatus">Status</label>
              <select id="newStatus" name="status">
                <option value="For Sale">For Sale</option>
                <option value="Active">Active</option>
                <option value="Under Review">Under Review</option>
                <option value="Sold">Sold</option>
                <option value="Frozen">Frozen</option>
              </select>
            </div>
            <div class="field-wrap">
              <label class="form-label" for="newTotalShares">Total Shares</label>
              <input id="newTotalShares" name="totalShares" type="number" min="1" step="1" required value="100">
              <span class="hint" style="color:var(--muted);font-size:.8rem">Available shares start equal to total shares and then update automatically as people buy or sell.</span>
            </div>
            <div class="field-wrap">
              <label class="form-label" for="newOwnerEmail">Owner Email <span style="color:var(--muted);font-weight:500">(optional)</span></label>
              <input id="newOwnerEmail" name="ownerEmail" type="email" placeholder="owner@example.com">
            </div>
          </div>
          <div class="field-wrap">
            <label class="form-label" for="newDescription">Description</label>
            <textarea id="newDescription" name="description" required placeholder="What the doc does and why it matters."></textarea>
          </div>
          <div class="hero-cta">
            <button class="btn btn-gold" type="submit">Create market doc</button>
            <button class="btn btn-ghost" id="createDocReset" type="reset">Clear</button>
          </div>
        </form>
      </div>
    </section>

    <section class="mt-24">
      <h2>Sync from Google Sheet</h2>
      <div class="card">
        <p class="section-sub">Use the shared market sheet as your source of truth. Sync matches docs by <strong>Ticker</strong>,
        so existing tickers are updated and new tickers are created without making duplicates.</p>
        <div class="summary-list">
          <div class="rev-row"><span>Unique key</span><b>Ticker</b></div>
          <div class="rev-row"><span>Required sheet columns</span><b>Ticker, Doc Name, Description, Type, Utility, Aesthetics, Integration, Verification Grade, Status, Total Shares, Owner Email, Published, Email, Discord, Doc Link</b></div>
          <div class="rev-row"><span>Available shares</span><b>Preserved for existing docs; new docs start at total shares</b></div>
        </div>
        <div class="hero-cta mt-24">
          <button class="btn btn-gold" id="syncSheetBtn" type="button">Sync published sheet rows</button>
        </div>
      </div>
    </section>

    <section class="mt-24">
      <h2>User controls</h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Email</th><th>Verified Buyer</th><th>Blacklisted</th><th>DTC Balance</th><th>Actions</th></tr>
          </thead>
          <tbody id="adminUserRows">
            <tr><td colspan="5" style="text-align:center;padding:26px">Admin access required.</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="mt-24">
      <h2>Pending approvals</h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Type</th><th>Ticker</th><th>User</th><th>Amount</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody id="adminTransactionRows">
            <tr><td colspan="6" style="text-align:center;padding:26px">No pending approvals loaded.</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="mt-24">
      <h2>Doc valuation editor</h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Ticker</th><th>Utility</th><th>Aesthetics</th><th>Integration</th><th>Verification</th><th>Status</th><th>Shares</th><th>Save</th></tr>
          </thead>
          <tbody id="adminDocsRows">
            <tr><td colspan="8" style="text-align:center;padding:26px">Admin access required.</td></tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</section>
"""

# --------------------------------------------------------------------------
# Apply — on-site request system (submits into Netlify Forms)
# --------------------------------------------------------------------------
apply_page = """
<section class="hero" style="padding-bottom:26px">
  <div class="wrap">
    <span class="eyebrow">Requests</span>
    <h1>Apply to <span class="accent">DTO</span></h1>
    <p class="lede">List a doc for stock investment, sell it outright in a full buyout, or get a valuation.
    Complete the request below — it takes about a minute, and everything is reviewed
    manually by DTO staff.</p>
    <div class="hero-cta">
      <a class="btn btn-gold" href="#request">Start a request</a>
      <a class="btn btn-ghost" href="#faq">Read the FAQ</a>
    </div>
  </div>
</section>

<section class="block" style="padding-top:20px">
  <div class="wrap">
    <div class="grid g3">
      <div class="card"><span class="icon">&#9889;</span><h3>Takes ~1 minute</h3><p>Four short steps. No account, no password, nothing to install.</p></div>
      <div class="card"><span class="icon">&#128273;</span><h3>Goes straight to staff</h3><p>Your request lands in DTO's private review queue the moment you submit.</p></div>
      <div class="card"><span class="icon">&#127903;</span><h3>You get a ticket ID</h3><p>Quote it in any email and staff can pull your request up instantly.</p></div>
    </div>
  </div>
</section>

<section class="block" id="request">
  <div class="wrap">
    <h2>Submit a request</h2>
    <p class="section-sub">All fields marked required must be completed. DTO staff verify every stat you
    provide — fake or misleading information results in rejection.</p>

    <div class="setup-banner" id="setupBanner" hidden></div>

    <form name="dto-request" data-netlify="true" netlify-honeypot="bot-field" hidden>
      <input type="hidden" name="form-name" value="dto-request">
      <input type="text" name="bot-field">
      <input type="text" name="requestType">
      <input type="text" name="name">
      <input type="email" name="email">
      <input type="text" name="contactAlt">
      <input type="text" name="docName">
      <input type="text" name="docLink">
      <textarea name="description"></textarea>
      <input type="text" name="askingPrice">
      <textarea name="partners"></textarea>
      <textarea name="notes"></textarea>
      <input type="text" name="ticket">
      <textarea name="requestSummary"></textarea>
      <input type="text" name="submittedAt">
    </form>

    <div id="reqWrap">
      <form id="dtoRequest" class="req-shell" autocomplete="on" novalidate>

        <div class="req-head">
          <div class="step-label" id="reqStepLabel">Step 1</div>
          <div class="progress-track"><div class="progress-bar" id="reqProgressBar"></div></div>
          <div id="reqDots"></div>
        </div>

        <!-- STEP 1 : request type -->
        <div class="step" data-title="Request type">
          <h3>What would you like to do?</h3>
          <p class="step-sub">Pick the option that matches your goal. You can change this later by
          emailing staff with your ticket ID.</p>
          <div class="type-grid" data-required-radio="request_type">
            <label class="type-card">
              <input type="radio" name="request_type" value="Stock Listing" checked>
              <span class="tc-check"></span>
              <span class="tc-icon">&#128200;</span>
              <span class="tc-title">Stock Listing</span>
              <span class="tc-desc">Keep ownership of your doc and let investors buy shares. Value
              updates weekly with your DoxStox score.</span>
            </label>
            <label class="type-card">
              <input type="radio" name="request_type" value="Full Buyout">
              <span class="tc-check"></span>
              <span class="tc-icon">&#128176;</span>
              <span class="tc-title">Full Buyout</span>
              <span class="tc-desc">Sell your doc outright for real money. Ownership transfers fully to
              the buyer once payment clears.</span>
            </label>
            <label class="type-card">
              <input type="radio" name="request_type" value="Valuation Only">
              <span class="tc-check"></span>
              <span class="tc-icon">&#128269;</span>
              <span class="tc-title">Valuation Only</span>
              <span class="tc-desc">Just want to know what your doc is worth? Get an official DoxStox
              score without listing it.</span>
            </label>
          </div>
        </div>

        <!-- STEP 2 : about you -->
        <div class="step" data-title="Your details" hidden>
          <h3>How can DTO reach you?</h3>
          <p class="step-sub">Staff will contact you here to confirm details and open a private chat room
          for negotiation.</p>
          <div class="field-wrap half">
            <label class="form-label" for="f_name">Name or handle <span style="color:var(--red)">*</span></label>
            <input type="text" id="f_name" name="name" data-required placeholder="e.g. BananaNetworkz">
          </div>
          <div class="field-wrap half">
            <label class="form-label" for="f_email">Contact email <span style="color:var(--red)">*</span></label>
            <input type="email" id="f_email" name="email" data-required placeholder="you@example.com">
          </div>
          <div class="field-wrap">
            <label class="form-label" for="f_alt">Discord or other contact <span style="color:var(--muted);font-weight:500">(optional)</span></label>
            <input type="text" id="f_alt" name="contact_alt" placeholder="username#0000">
            <span class="hint" style="color:var(--muted);font-size:.8rem">Speeds things up — staff often
            reach out here first.</span>
          </div>
          <div class="notice">DTO never asks for passwords or account access. Ownership transfers happen
          through Google Docs' own sharing settings, with staff supervising.</div>
        </div>

        <!-- STEP 3a : doc details (sellers) -->
        <div class="step" data-title="Doc details" data-only="seller" hidden>
          <h3>Tell us about your doc</h3>
          <p class="step-sub">This is what staff review, and what buyers or investors see once approved.</p>
          <div class="field-wrap">
            <label class="form-label" for="f_docname">Doc name <span style="color:var(--red)">*</span></label>
            <input type="text" id="f_docname" name="doc_name" data-required placeholder="e.g. Study Vault">
          </div>
          <div class="field-wrap">
            <label class="form-label" for="f_doclink">Doc link <span style="color:var(--red)">*</span></label>
            <input type="url" id="f_doclink" name="doc_link" data-required
                   placeholder="https://docs.google.com/document/d/...">
            <span class="hint" style="color:var(--muted);font-size:.8rem">Set sharing to "Anyone with the
            link can view" so staff can evaluate it.</span>
          </div>
          <div class="field-wrap">
            <label class="form-label" for="f_desc">Description <span style="color:var(--red)">*</span></label>
            <textarea id="f_desc" name="description" data-required
              placeholder="What the doc is, who it serves, and why it matters in the community."></textarea>
          </div>
          <div class="field-wrap" id="priceWrap" hidden>
            <label class="form-label" for="f_price">Asking price in USD</label>
            <input type="number" id="f_price" name="asking_price" min="0" step="1" placeholder="100">
            <div class="est-panel" id="reqFee"></div>
          </div>
        </div>

        <!-- STEP 4 : background (sellers) -->
        <div class="step" data-title="Doc background" data-only="seller" hidden>
          <h3>Background for valuation</h3>
          <p class="step-sub">DTO staff set your doc's value by hand — there's no formula and nothing is
          auto-calculated. The more context you give here, the more accurate your score will be.</p>

          <div class="field-wrap">
            <label class="form-label" for="s_par">Partnerships</label>
            <textarea id="s_par" name="partners" style="min-height:80px"
              placeholder="Which docs do you partner with, and how active are those partnerships? Write 'none' if you have none yet."></textarea>
          </div>

          <div class="notice">Be honest — staff verify everything against what they can confirm
          independently. Overstated claims slow your review down and can get a submission rejected.</div>
        </div>

        <!-- STEP 5 : review -->
        <div class="step" data-title="Review &amp; submit" hidden>
          <h3>Review your request</h3>
          <p class="step-sub">Check everything below, then submit. You'll get a ticket ID to quote in any
          follow-up email, and staff will send you your DoxStox valuation after review.</p>
          <div class="field-wrap">
            <label class="form-label" for="f_notes">Anything else staff should know <span style="color:var(--muted);font-weight:500">(optional)</span></label>
            <textarea id="f_notes" name="notes" style="min-height:80px"
              placeholder="Partnerships, history, previous sales, special conditions…"></textarea>
          </div>
          <div class="card" style="padding:18px 20px">
            <div id="reqReview"></div>
          </div>
          <p style="margin-top:18px;text-align:center">
            <span class="ticket-chip">&#127903; <span id="reqTicket"></span></span>
          </p>
          <div class="notice" style="margin-top:18px">By submitting you confirm the information is
          accurate, and you accept that DTO applies a <strong>7% fee</strong> to completed transactions
          and may decline any submission.</div>
        </div>

        <div class="req-nav">
          <button type="button" class="btn btn-ghost" id="reqBack">&#8592; Back</button>
          <button type="button" class="btn btn-gold" id="reqNext">Continue &#8594;</button>
          <button type="button" class="btn btn-gold" id="reqSubmit" hidden>Submit request</button>
        </div>
      </form>
    </div>

    <!-- success -->
    <div id="reqDone" class="req-shell done-panel" hidden>
      <div class="tick">&#10003;</div>
      <h3>Request received</h3>
      <p id="doneMsg">Your request is in DTO's review queue. Staff will get back to you shortly.</p>
      <p style="margin-bottom:22px"><span class="ticket-chip">&#127903; <span id="doneTicket"></span></span></p>
      <p style="font-size:.88rem">Save that ticket ID — quoting it in any follow-up message lets staff find your
      request instantly.</p>
      <div id="doneActions" style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:20px">
        <a class="btn btn-ghost" id="doneCopy" href="#">Copy request details</a>
        <a class="btn btn-gold" href="listings.html">Browse listings</a>
      </div>
    </div>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <h2>What happens next</h2>
    <p class="section-sub">Every request follows the same reviewed path — no shortcuts, no private
    side-deals.</p>
    <div class="timeline">
      <div class="tl"><h4>1 · Request received</h4><p>Your submission lands in DTO's private review queue with its ticket ID attached.</p></div>
      <div class="tl"><h4>2 · Staff review</h4><p>Staff open your doc, check your stats against what they can verify, and flag anything inconsistent.</p></div>
      <div class="tl"><h4>3 · DoxStox evaluation</h4><p>Staff weigh your doc's partnerships and quality against comparable listings, then agree a score.</p></div>
      <div class="tl"><h4>4 · You're contacted</h4><p>Staff email you the verdict — approved with a score and share price, or declined with a reason.</p></div>
      <div class="tl"><h4>5 · Listing goes live</h4><p>Approved docs appear on the listings page. Buyers and investors can then be matched to you.</p></div>
      <div class="tl"><h4>6 · Deal &amp; transfer</h4><p>Negotiation happens in a private DTO chat room. On completion, DTO collects the 7% fee and records the transfer.</p></div>
    </div>
  </div>
</section>

<section class="block" id="faq">
  <div class="wrap">
    <h2>Frequently asked questions</h2>
    <p class="section-sub">Still unsure about something? Email staff — the addresses are below.</p>

    <details class="faq" open>
      <summary>Does it cost anything to apply?</summary>
      <div class="faq-body"><p>No. Submitting a request, getting reviewed and receiving a DoxStox score
      are all free. DTO only earns from the <strong>7% fee</strong> applied to completed buyouts and marketplace
      transactions — not from share investments themselves.</p></div>
    </details>
    <details class="faq">
      <summary>What's the difference between a stock listing and a full buyout?</summary>
      <div class="faq-body"><p>With a <strong>stock listing</strong> you keep ownership of your doc and
      investors buy shares in its future value. With a <strong>full buyout</strong> you sell the doc
      entirely and ownership transfers to the buyer.</p></div>
    </details>
    <details class="faq">
      <summary>How is my doc's value decided?</summary>
      <div class="faq-body"><p>DTO staff assign it after manually reviewing your doc against the quality-first
      DoxStox rubric. Utility, aesthetics, integration depth and verification status are scored, weighted and
      then converted into a DoxStox score and share price. See
      <a href="doxstox.html">how valuation works</a> for the full process.</p></div>
    </details>
    <details class="faq">
      <summary>How long does review take?</summary>
      <div class="faq-body"><p>Usually 24–48 hours. Requests with a working doc link and honest stats move
      fastest. Scores are then re-reviewed and updated weekly.</p></div>
    </details>
    <details class="faq">
      <summary>Can my request be rejected?</summary>
      <div class="faq-body"><p>Yes. DTO reserves the right to decline any submission. The most common
      reason is fake or misleading stats, which is why honest self-reporting matters — staff verify
      everything.</p></div>
    </details>
    <details class="faq">
      <summary>Is it safe? How do I know I won't get scammed?</summary>
      <div class="faq-body"><p>Every deal runs through DTO verification. Negotiation happens in
      staff-provided private chat rooms, and payment is confirmed before ownership transfers. Private deals
      made outside DTO are not recognised and are not protected.</p></div>
    </details>
    <details class="faq">
      <summary>Do I need a Google account or to sign in anywhere?</summary>
      <div class="faq-body"><p>No. The form on this page needs no account. Just make sure your doc's
      sharing is set so staff can view it.</p></div>
    </details>
    <details class="faq">
      <summary>What is DTC?</summary>
      <div class="faq-body"><p>DTO Credits — the internal unit used for share prices and stock-based
      trades. Full buyouts use real money (USD or another agreed currency).</p></div>
    </details>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <h2>Need help?</h2>
    <p class="section-sub">Use the form above for submissions. These addresses are only for support,
    follow-up questions, or checking on an existing ticket.</p>
    <div class="grid g3">
""" + "".join(
    '<a class="mail-tile" href="mailto:%s"><span class="em">&#9993;</span>'
    '<span>%s<small>%s</small></span></a>' % (e, e, note)
    for e, note in EMAILS
) + """
    </div>
  </div>
</section>
"""

NOT_FOUND = """
<section class="hero">
  <div class="wrap center">
    <span class="eyebrow">404</span>
    <h1>That page isn't <span class="accent">listed</span>.</h1>
    <p class="lede" style="margin:0 auto 28px">The page you were looking for doesn't exist on DTO.</p>
    <div class="hero-cta" style="justify-content:center">
      <a class="btn btn-gold" href="index.html">Back to home</a>
      <a class="btn btn-ghost" href="listings.html">Browse listings</a>
    </div>
  </div>
</section>
"""

if __name__ == "__main__":
    page("index.html", "DTO — Docs Trade Organization | Buy, sell & invest in Google Docs",
         "DTO is a marketplace and exchange by BananaNetworkz where the Google Docs community can buy, "
         "sell, trade and invest in docs, with DoxStox valuations set by DTO staff.", home)
    page("how-it-works.html", "How DTO Works — Docs Trade Organization",
         "How buying, selling, DoxStox valuation, shares and the DTO review process work.", how)
    page("doxstox.html", "How Docs Are Valued — DoxStox | DTO",
         "DTO's quality-first DoxStox rubric scores utility, aesthetics, integration depth and verification, "
         "then converts the result into share price.", doxstox)
    page("buyouts.html", "Full Doc Buyouts (Real Money) — DTO",
         "How DTO handles real-money full doc buyouts: pricing, the 7% fee and the full transfer process.", buyouts)
    page("listings.html", "Live Listings — DTO",
         "Google Docs currently listed on DTO for stock investment or full buyout.", listings)
    page("listing-details.html", "Listing Details — DTO",
         "View contact details and public information for a specific DTO listing.", listing_detail,
         active="listings.html")
    page("account.html", "Account — DTO",
         "Register, verify your email, login, reset your password and manage your DTO account.",
         account_page,
         extra_scripts=f'<script type="module" src="assets/auth.js?v={ASSET_VERSION}"></script>')
    page("portfolio.html", "Portfolio Dashboard — DTO",
         "Track your DTC balance, shareholdings, live DoxStox prices and trading activity.",
         portfolio_page,
         extra_scripts=f'<script type="module" src="assets/portfolio.js?v={ASSET_VERSION}"></script>')
    page("admin.html", "Admin Panel — DTO",
         "Admin controls for verified buyers, DTC balances, doc valuations and approval workflows.",
         admin_page,
         extra_scripts=f'<script type="module" src="assets/admin.js?v={ASSET_VERSION}"></script>')
    page("apply.html", "Apply to DTO — List Your Doc or Get a Valuation",
         "Submit a request to DTO: list your Google Doc for stock investment, sell it in a full buyout, "
         "or get a valuation. Reviewed manually by DTO staff.", apply_page)
    page("404.html", "Page not found — DTO", "That page isn't listed on DTO.", NOT_FOUND, active="")
