#!/usr/bin/env python3
"""Tiny static-site builder for DTO.

Writes the finished .html files into the repo root so GitHub Pages can serve
them directly. Run:  python3 build.py
"""
import pathlib

ROOT = pathlib.Path(__file__).parent

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


def page(filename, title, description, body, active=None):
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
<link rel="stylesheet" href="assets/style.css">
</head>
<body>
{header(active)}
<main>
{body}
</main>
{FOOTER}
<script src="assets/config.js"></script>
<script src="assets/app.js"></script>
<script src="assets/requests.js"></script>
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
        <p>Every registered doc gets a DoxStox score built from influence, partnerships, reputation
        and growth — reviewed and updated weekly.</p>
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
    <h2>Valuation you can trust</h2>
    <p class="section-sub">Every doc receives a DoxStox score assigned by DTO staff after manual review.
    There's no public formula to game — just consistent human judgement, applied the same way to every
    doc and revisited weekly.</p>
    <div class="grid g4">
      <div class="card"><h3>Influence</h3><p>How well-known the doc is and how often others reference it.</p></div>
      <div class="card"><h3>Partnerships</h3><p>Who it works with, and how active those relationships are.</p></div>
      <div class="card"><h3>Reputation</h3><p>Trust, reliability and track record over time.</p></div>
      <div class="card"><h3>Growth</h3><p>Momentum — whether it's climbing, steady or stalling.</p></div>
    </div>
    <p class="mt-24"><a class="btn btn-gold" href="doxstox.html">How valuation works</a></p>
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
    the doc and assign it a value based on its influence, partnerships, reputation, growth and overall
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
    <p class="section-sub">DoxStox is DTO's valuation and investment system. Every registered doc receives
    a DoxStox score representing its estimated value and influence within the community.</p>
    <div class="grid g2">
      <div class="card">
        <h3>Why not use view counts?</h3>
        <p>Unlike traditional websites, many Google Docs do not have publicly available viewer statistics.
        Because of this, DTO staff evaluate docs using factors that can actually be verified.</p>
      </div>
      <div class="card">
        <h3>Verifiable factors</h3>
        <ul class="clean">
          <li><strong>Community influence</strong></li>
          <li><strong>Partnerships</strong></li>
          <li><strong>Reputation</strong></li>
          <li><strong>Growth</strong></li>
        </ul>
      </div>
    </div>
    <div class="notice mt-24">These factors are combined into a DoxStox score. Higher scores indicate a
    stronger and more valuable doc. <strong>DoxStox scores are reviewed and updated weekly by DTO
    staff.</strong></div>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <h2>Investing and shares</h2>
    <p class="section-sub">Doc owners may choose to issue shares for their doc.</p>
    <ul class="clean">
      <li>Purchasing shares does <strong>not</strong> grant ownership of the doc itself — it represents an
      investment in that doc's future value.</li>
      <li>As a doc grows, gains partnerships, improves its reputation or becomes more influential, its
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
    of each doc.</p>
    <div class="card">
      <p>There is no public formula and no automatic calculation. Staff assess influence, partnerships,
      reputation and growth together, weighing each according to the doc in front of them, and
      cross-check against comparable listings. This keeps values
      <strong style="color:var(--text)">fair, accurate and resistant to manipulation</strong> — there is
      no single number for anyone to inflate.</p>
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
    <h1>How docs are <span class="accent">valued</span></h1>
    <p class="lede">Every registered doc receives a DoxStox score — its estimated value and influence
    within the community. Scores are assigned by DTO staff through manual review, not by a public
    formula.</p>
    <div class="hero-cta">
      <a class="btn btn-gold" href="apply.html">Request a valuation</a>
      <a class="btn btn-ghost" href="listings.html">See scored docs</a>
    </div>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <h2>Why staff decide, not a formula</h2>
    <p class="section-sub">Unlike traditional websites, most Google Docs have no public viewer
    statistics. There is no reliable number to plug into an equation.</p>
    <div class="grid g3">
      <div class="card">
        <span class="icon">&#128065;</span>
        <h3>No public stats</h3>
        <p>View counts aren't visible on Google Docs, so any automatic score would be built on numbers
        nobody can verify.</p>
      </div>
      <div class="card">
        <span class="icon">&#128737;</span>
        <h3>Resistant to gaming</h3>
        <p>A published formula tells people exactly which number to inflate. Human review can't be
        farmed the same way.</p>
      </div>
      <div class="card">
        <span class="icon">&#9878;</span>
        <h3>Judgement matters</h3>
        <p>Standing, trust and momentum are real but hard to quantify. Staff weigh them case by case.</p>
      </div>
    </div>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <h2>What staff assess</h2>
    <p class="section-sub">Four factors shape every valuation. None has a fixed weight — their
    importance depends on the doc.</p>
    <div class="grid g2">
      <div class="card">
        <h3>&#127760; Community influence</h3>
        <p style="margin-bottom:10px">How well-known the doc is, how often it gets referenced by others,
        and how central it feels to the ecosystem. Typically the strongest signal.</p>
        <ul class="clean">
          <li>Recognition across the community</li>
          <li>How often other docs reference it</li>
          <li>Its role in the wider ecosystem</li>
        </ul>
      </div>
      <div class="card">
        <h3>&#129309; Partnerships</h3>
        <p style="margin-bottom:10px">Docs that link to or actively work with it. Network strength
        matters more than raw count — one meaningful partnership can outweigh several nominal ones.</p>
        <ul class="clean">
          <li>Who it partners with</li>
          <li>How active those partnerships are</li>
          <li>Quality over quantity</li>
        </ul>
      </div>
      <div class="card">
        <h3>&#11088; Reputation</h3>
        <p style="margin-bottom:10px">Trust built over time. This can raise a valuation substantially —
        or sink it.</p>
        <ul class="clean">
          <li>Honesty and reliability</li>
          <li>Scam or dispute history</li>
          <li>Track record of successful trades</li>
        </ul>
      </div>
      <div class="card">
        <h3>&#128200; Growth</h3>
        <p style="margin-bottom:10px">Momentum. A smaller doc climbing fast may be valued above a larger
        one that has stalled.</p>
        <ul class="clean">
          <li>Activity trend over recent weeks</li>
          <li>New partnerships gained</li>
          <li>Rising or falling influence</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <h2>The review process</h2>
    <p class="section-sub">Every doc goes through the same path — no shortcuts, no exceptions.</p>
    <div class="timeline">
      <div class="tl"><h4>1 · Submission</h4><p>You submit your doc with background on its influence, partnerships, reputation and growth.</p></div>
      <div class="tl"><h4>2 · Verification</h4><p>Staff open the doc and check what you've told them against what they can independently confirm.</p></div>
      <div class="tl"><h4>3 · Community review</h4><p>Standing is assessed against comparable docs already tracked by DTO.</p></div>
      <div class="tl"><h4>4 · Score assigned</h4><p>Staff agree a DoxStox score and, for stock listings, a price per share in DTC.</p></div>
      <div class="tl"><h4>5 · Published</h4><p>The score goes live on the listings page and you're notified.</p></div>
      <div class="tl"><h4>6 · Weekly review</h4><p>Scores are revisited weekly and adjusted as docs grow, stall or change hands.</p></div>
    </div>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <h2>Reading a DoxStox score</h2>
    <p class="section-sub">Scores are comparative — they're meaningful against each other rather than as
    absolute figures. These bands are a rough guide, not a rule.</p>
    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>Band</th><th>Typical profile</th></tr>
        </thead>
        <tbody>
          <tr><td class="score">3,500+</td><td>Central to the ecosystem. Widely referenced, many active partnerships, spotless reputation.</td></tr>
          <tr><td class="score">2,000 – 3,500</td><td>Well established and trusted, with a solid partner network and steady growth.</td></tr>
          <tr><td class="score">1,000 – 2,000</td><td>Active and recognised, building its partnerships and reputation.</td></tr>
          <tr><td class="score">Under 1,000</td><td>Newer or smaller docs, or those still establishing trust.</td></tr>
        </tbody>
      </table>
    </div>
    <div class="notice mt-24">Share prices for stock listings are set by DTO staff alongside the score.
    Where a score is shown as <strong>Pending</strong>, review is still underway.</div>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <h2>Fairness and appeals</h2>
    <div class="grid g2">
      <div class="card">
        <h3>Consistency</h3>
        <p>The same four factors are applied to every doc, and scores are cross-checked against
        comparable listings so nothing is judged in isolation.</p>
      </div>
      <div class="card">
        <h3>Disagree with your score?</h3>
        <p>Email staff with your ticket ID and anything they may have missed — new partnerships, recent
        growth, corrected information. Scores are re-examined weekly regardless.</p>
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
    <h2>Buyers &amp; sellers system</h2>
    <p class="section-sub">DTO organizes buyouts using two groups.</p>
    <div class="grid g2">
      <div class="card">
        <h3>Sellers</h3>
        <p style="margin-bottom:10px">Users who want to fully sell their Google Doc. They list:</p>
        <ul class="clean">
          <li>Doc name</li>
          <li>Asking price (USD)</li>
          <li>Description</li>
          <li>Basic stats (influence, partnerships, etc.)</li>
          <li>DTO evaluation (DoxStox score if available)</li>
        </ul>
      </div>
      <div class="card">
        <h3>Buyers</h3>
        <p style="margin-bottom:10px">Users looking to purchase full ownership of docs using real money.</p>
        <ul class="clean">
          <li>DTO reviews each buyer to reduce scams and fake offers.</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <h2>Buyer matching system</h2>
    <p class="section-sub">DTO acts as a middle layer between buyers and sellers.</p>
    <div class="grid g2">
      <div class="card">
        <ul class="clean">
          <li>Sellers submit docs for buyout listing</li>
          <li>DTO reviews and approves the listing</li>
          <li>DTO may introduce buyers directly to sellers for faster deals</li>
        </ul>
      </div>
      <div class="card">
        <h3>Buyers are matched on</h3>
        <ul class="clean">
          <li><strong>Budget</strong></li>
          <li><strong>Interest category</strong></li>
          <li><strong>Activity level</strong></li>
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
      <li><strong>Buyers are matched or recommended</strong>Based on budget, interest category and activity level.</li>
      <li><strong>Buyer contacts DTO staff with intent to purchase</strong>All contact runs through DTO.</li>
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
        <li>Only <strong>reviewed buyers</strong> are recommended to sellers</li>
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
      <div class="card"><h3>Serious buyers only</h3><p>Sellers only deal with buyers DTO has reviewed.</p></div>
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
    <div class="notice mt-24">DoxStox scores and share prices are set by DTO staff during review and
    updated weekly. Buyout prices are asking prices in USD; the final figure is agreed between buyer and
    seller with DTO as verifier, and the 7% DTO fee applies to every completed deal.</div>
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
# Apply — on-site request system (submits into a Google Form)
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
      <p id="doneMsg">Your request is in DTO's review queue. Staff will get back to you within
      <span id="doneTime">24–48 hours</span>.</p>
      <p style="margin-bottom:22px"><span class="ticket-chip">&#127903; <span id="doneTicket"></span></span></p>
      <p style="font-size:.88rem">Save that ticket ID — quoting it in an email lets staff find your
      request instantly.</p>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:20px">
        <a class="btn btn-ghost" id="doneCopy" href="#">Copy request details</a>
        <a class="btn btn-ghost" id="doneMail" href="#">Email staff directly</a>
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
      <div class="tl"><h4>3 · DoxStox evaluation</h4><p>Staff weigh your doc's influence, partnerships, reputation and growth against comparable listings, then agree a score.</p></div>
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
      are all free. DTO only earns from the <strong>7% fee</strong> applied to completed transactions.</p></div>
    </details>
    <details class="faq">
      <summary>What's the difference between a stock listing and a full buyout?</summary>
      <div class="faq-body"><p>With a <strong>stock listing</strong> you keep ownership of your doc and
      investors buy shares in its future value. With a <strong>full buyout</strong> you sell the doc
      entirely and ownership transfers to the buyer.</p></div>
    </details>
    <details class="faq">
      <summary>How is my doc's value decided?</summary>
      <div class="faq-body"><p>DTO staff assign it after manually reviewing your doc. They weigh four
      things — community influence, partnerships, reputation and growth — and cross-check against
      comparable docs already listed. There is no public formula, which is deliberate: a published
      equation just tells people which number to inflate. See
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
      <div class="faq-body"><p>Every deal runs through DTO verification. Buyers are reviewed by staff,
      negotiation happens in staff-provided private chat rooms, and payment is
      confirmed before ownership transfers. Private deals made outside DTO are not recognised and are not
      protected.</p></div>
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
    <h2>Prefer email?</h2>
    <p class="section-sub">The form above is fastest, but you can always email staff directly. Include
    your doc link, doc name, a short description, and whether you want a stock listing or a full buyout.</p>
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
         "Every doc receives a DoxStox score assigned by DTO staff through manual review of its "
         "influence, partnerships, reputation and growth.", doxstox)
    page("buyouts.html", "Full Doc Buyouts (Real Money) — DTO",
         "How DTO handles real-money full doc buyouts: buyer matching, pricing, the 7% fee and "
         "the 9-step buyout process.", buyouts)
    page("listings.html", "Live Listings — DTO",
         "Google Docs currently listed on DTO for stock investment or full buyout.", listings)
    page("apply.html", "Apply to DTO — List Your Doc or Get a Valuation",
         "Submit a request to DTO: list your Google Doc for stock investment, sell it in a full buyout, "
         "or get a valuation. Reviewed manually by DTO staff.", apply_page)
    page("404.html", "Page not found — DTO", "That page isn't listed on DTO.", NOT_FOUND, active="")
