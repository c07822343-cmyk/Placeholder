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
        <a href="doxstox.html">DoxStox &amp; Formula</a>
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
      <a class="btn btn-ghost" href="doxstox.html">See the DoxStox formula</a>
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
        DTO staff with only verified buyers recommended.</p>
      </div>
      <div class="card">
        <span class="icon">&#128737;</span>
        <h3>Scam resistance</h3>
        <p>Manual verification, a verified-buyer list, and staff-adjusted valuations keep the market
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
    <h2>The DoxStox formula</h2>
    <p class="section-sub">Mathematics provides the baseline. DTO staff make reasonable adjustments for
    what a formula can't measure.</p>
    <div class="formula">
      DS = 200I + 100P + 150R + 75G
      <small>I = Influence (1–10) · P = Partners (1 point each) · R = Reputation (0–10) · G = Growth (0–10)
      &nbsp;|&nbsp; Share price SP = DS ÷ 100</small>
    </div>
    <p class="mt-24"><a class="btn btn-gold" href="doxstox.html">Open the DoxStox calculator</a></p>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <h2>Applying takes about a minute</h2>
    <p class="section-sub">The whole request happens right here on the site — no account, no sign-in,
    nothing to install. Pick what you want to do, tell us about your doc, and submit.</p>
    <div class="grid g4">
      <div class="card"><h3>1 · Choose</h3><p>Stock listing, full buyout, verified buyer, or a valuation on its own.</p></div>
      <div class="card"><h3>2 · Describe</h3><p>Doc link, description, and your honest stats. A live DoxStox preview updates as you type.</p></div>
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
    <p class="section-sub">All values displayed on DTO are determined by DTO staff using the official
    DoxStox formula and community review process.</p>
    <div class="card">
      <p>While mathematical calculations provide a baseline value, DTO staff may make reasonable
      adjustments to account for factors that cannot be measured automatically. This ensures that values
      remain <strong style="color:var(--text)">fair, accurate and resistant to manipulation</strong>.</p>
    </div>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <h2>DTO mission</h2>
    <div class="formula" style="font-family:var(--font);font-size:1.15rem;line-height:1.6">
      To create a fair, organized and community-driven economy where Google Docs can be recognized as
      valuable projects, traded safely, and invested in by members of the community.
    </div>
    <p class="mt-24"><a class="btn btn-gold" href="apply.html">List your doc</a>
    <a class="btn btn-ghost" href="doxstox.html">See how value is calculated</a></p>
  </div>
</section>
"""

# --------------------------------------------------------------------------
# DoxStox
# --------------------------------------------------------------------------
doxstox = """
<section class="hero" style="padding-bottom:26px">
  <div class="wrap">
    <span class="eyebrow">Valuation system</span>
    <h1>DoxStox <span class="accent">formula</span></h1>
    <p class="lede">Every registered doc receives a DoxStox score. It is the baseline number behind share
    prices, suggested buyout ranges and a doc's overall standing in the DTO market.</p>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <h2>Core score</h2>
    <div class="formula">
      DS = 200I + 100P + 150R + 75G
      <small>Share price: SP = DS ÷ 100 &nbsp;(expressed in DTC per share)</small>
    </div>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <h2>What each part means</h2>
    <div class="grid g2">
      <div class="card">
        <h3>I — Influence (1–10) <span class="badge buyout">×200</span></h3>
        <p style="margin-bottom:10px">The <strong style="color:var(--text)">most important factor</strong>.
        DTO staff decide based on how well-known the doc is, how often it gets referenced, and how
        "important" it feels in the ecosystem.</p>
        <ul class="clean">
          <li><strong>1</strong> — unknown doc</li>
          <li><strong>5</strong> — average active doc</li>
          <li><strong>10</strong> — central / huge influence</li>
        </ul>
      </div>
      <div class="card">
        <h3>P — Partners <span class="badge buyout">×100</span></h3>
        <p style="margin-bottom:10px">Each partnership counts as 1 point. A partner is another doc linking
        to or working with it.</p>
        <ul class="clean">
          <li>0 partners = <strong>0</strong></li>
          <li>3 partners = <strong>3</strong></li>
          <li>10 partners = <strong>10</strong></li>
        </ul>
      </div>
      <div class="card">
        <h3>R — Reputation (0–10) <span class="badge buyout">×150</span></h3>
        <p style="margin-bottom:10px">Based on trust. DTO staff score:</p>
        <ul class="clean">
          <li>Honesty</li>
          <li>Scam history</li>
          <li>Reliability</li>
          <li>Successful trades</li>
        </ul>
      </div>
      <div class="card">
        <h3>G — Growth (0–10) <span class="badge buyout">×75</span></h3>
        <p style="margin-bottom:10px">A weekly momentum score, based on:</p>
        <ul class="clean">
          <li>Activity increase</li>
          <li>New partners gained</li>
          <li>Rising influence</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <h2>DoxStox calculator</h2>
    <p class="section-sub">Move the sliders to see how a doc's score and share price are built. This is an
    unofficial estimate — final values are set by DTO staff.</p>
    <form id="calc" class="calc" onsubmit="return false">
      <div class="card">
        <div class="field">
          <label for="inI">Influence (I) <span class="val" id="valI">6</span></label>
          <input type="range" id="inI" min="1" max="10" step="1" value="6">
          <span class="hint">1 = unknown · 5 = average active doc · 10 = central influence</span>
        </div>
        <div class="field">
          <label for="inP">Partners (P) <span class="val" id="valP">4</span></label>
          <input type="range" id="inP" min="0" max="20" step="1" value="4">
          <span class="hint">One point per partnered doc</span>
        </div>
        <div class="field">
          <label for="inR">Reputation (R) <span class="val" id="valR">7</span></label>
          <input type="range" id="inR" min="0" max="10" step="1" value="7">
          <span class="hint">Honesty, scam history, reliability, successful trades</span>
        </div>
        <div class="field mb-0">
          <label for="inG">Growth (G) <span class="val" id="valG">5</span></label>
          <input type="range" id="inG" min="0" max="10" step="1" value="5">
          <span class="hint">Weekly momentum: activity, new partners, rising influence</span>
        </div>
      </div>
      <div class="result">
        <div class="ds-label">DoxStox score</div>
        <div class="ds" id="dsOut">3,025</div>
        <div class="sp" id="spOut">30.25 DTC / share</div>
        <div class="breakdown">
          <div><span>200 × Influence</span><b id="partI">1,200</b></div>
          <div><span>100 × Partners</span><b id="partP">400</b></div>
          <div><span>150 × Reputation</span><b id="partR">1,050</b></div>
          <div><span>75 × Growth</span><b id="partG">375</b></div>
          <div><span>Total DS</span><b id="dsOut2"></b></div>
        </div>
        <p class="hint" id="spRound" style="margin-top:14px;font-size:.8rem;color:var(--muted)"></p>
      </div>
    </form>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <h2>Worked example</h2>
    <div class="grid g2">
      <div class="card">
        <h3>A doc with…</h3>
        <ul class="clean">
          <li>Influence = <strong>6</strong></li>
          <li>Partners = <strong>4</strong></li>
          <li>Reputation = <strong>7</strong></li>
          <li>Growth = <strong>5</strong></li>
        </ul>
      </div>
      <div class="card">
        <h3>Calculation</h3>
        <ul class="clean">
          <li>200 × 6 = <strong>1,200</strong></li>
          <li>100 × 4 = <strong>400</strong></li>
          <li>150 × 7 = <strong>1,050</strong></li>
          <li>75 × 5 = <strong>375</strong></li>
          <li>Final: <strong style="color:var(--gold)">DS = 3,025</strong></li>
          <li>Share price: <strong style="color:var(--gold)">30.25 DTC</strong> (round to 30 DTC for
          simplicity)</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <h2>Why this formula works</h2>
    <div class="grid g4">
      <div class="card"><h3>Influence</h3><p>Controls overall weight — the main driver of value.</p></div>
      <div class="card"><h3>Partners</h3><p>Reflect network strength across the ecosystem.</p></div>
      <div class="card"><h3>Reputation</h3><p>Prevents scam inflation of a doc's value.</p></div>
      <div class="card"><h3>Growth</h3><p>Shows momentum week to week.</p></div>
    </div>
    <div class="notice mt-24">Even if someone cheats one category, they can't fully break the system —
    and DTO staff review every score before it is published.</div>
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
        <h3>Buyers <span class="badge verified">Verified</span></h3>
        <p style="margin-bottom:10px">Users looking to purchase full ownership of docs using real money.</p>
        <ul class="clean">
          <li>DTO maintains a list of <strong>verified buyers</strong> — users reviewed and approved by
          staff as legitimate and serious purchasers.</li>
          <li>Only verified buyers are recommended to sellers, to reduce scams and fake offers.</li>
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
        <h3>Verified buyers are matched on</h3>
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
      <li><strong>Verified buyers are matched or recommended</strong>Based on budget, interest category and activity level.</li>
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
        <li>Only <strong>verified buyers</strong> are recommended to sellers</li>
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
    <div class="notice mt-24">Prices for stock listings are derived from the doc's DoxStox score
    (SP = DS ÷ 100) and update weekly. Buyout prices are asking prices in USD; the final figure is agreed
    between buyer and seller with DTO as verifier, and the 7% DTO fee applies to every completed deal.</div>
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
    <p class="lede">List a doc for stock investment, sell it outright in a full buyout, or register as a
    verified buyer. Complete the request below — it takes about a minute, and everything is reviewed
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
              <input type="radio" name="request_type" value="Verified Buyer">
              <span class="tc-check"></span>
              <span class="tc-icon">&#128737;</span>
              <span class="tc-title">Become a Verified Buyer</span>
              <span class="tc-desc">Get approved as a legitimate purchaser so sellers are matched and
              recommended to you first.</span>
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

        <!-- STEP 3b : buyer details -->
        <div class="step" data-title="Buyer profile" data-only="buyer" hidden>
          <h3>Your buyer profile</h3>
          <p class="step-sub">DTO matches verified buyers to sellers based on budget, interest category
          and activity level.</p>
          <div class="field-wrap">
            <label class="form-label" for="f_budget">Budget in USD <span style="color:var(--red)">*</span></label>
            <input type="number" id="f_budget" name="budget" data-required min="0" step="1" placeholder="250">
          </div>
          <div class="field-wrap">
            <label class="form-label" for="f_int">What kind of docs are you looking for? <span style="color:var(--red)">*</span></label>
            <textarea id="f_int" name="description" data-required
              placeholder="Categories, size, influence level, anything specific you're hunting for."></textarea>
          </div>
          <div class="notice">Verification reduces scams on both sides. Staff may ask for proof of funds
          or trade history before approving you as a verified buyer.</div>
        </div>

        <!-- STEP 4 : stats (sellers) -->
        <div class="step" data-title="Doc stats" data-only="seller" hidden>
          <h3>Self-reported stats</h3>
          <p class="step-sub">Give your honest estimate for each. Staff verify everything and set the
          official score — inflated numbers only slow your review down.</p>

          <div class="slide-row">
            <label for="s_inf">Influence <b data-out="influence">5</b></label>
            <input type="range" id="s_inf" name="influence" min="1" max="10" step="1" value="5">
            <div class="scale"><span>1 · unknown</span><span>5 · average</span><span>10 · central</span></div>
          </div>
          <div class="slide-row">
            <label for="s_par">Partners <b data-out="partners">0</b></label>
            <input type="range" id="s_par" name="partners" min="0" max="20" step="1" value="0">
            <div class="scale"><span>0</span><span>10</span><span>20+</span></div>
          </div>
          <div class="slide-row">
            <label for="s_rep">Reputation <b data-out="reputation">5</b></label>
            <input type="range" id="s_rep" name="reputation" min="0" max="10" step="1" value="5">
            <div class="scale"><span>0 · untrusted</span><span>5</span><span>10 · flawless</span></div>
          </div>
          <div class="slide-row">
            <label for="s_gro">Growth <b data-out="growth">5</b></label>
            <input type="range" id="s_gro" name="growth" min="0" max="10" step="1" value="5">
            <div class="scale"><span>0 · flat</span><span>5</span><span>10 · surging</span></div>
          </div>

          <div class="est-panel" id="reqEstimate"></div>
        </div>

        <!-- STEP 5 : review -->
        <div class="step" data-title="Review &amp; submit" hidden>
          <h3>Review your request</h3>
          <p class="step-sub">Check everything below, then submit. You'll get a ticket ID to quote in any
          follow-up email.</p>
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
      <div class="tl"><h4>3 · DoxStox evaluation</h4><p>Your official score is calculated with DS = 200I + 100P + 150R + 75G, then adjusted for anything the formula can't measure.</p></div>
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
      <div class="faq-body"><p>Through the DoxStox formula: <strong>DS = 200I + 100P + 150R + 75G</strong>
      — influence, partners, reputation and growth. Share price is <strong>DS ÷ 100</strong> in DTC.
      Staff may make reasonable adjustments for factors a formula can't capture. See the
      <a href="doxstox.html">DoxStox page</a> for the full breakdown and a calculator.</p></div>
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
      <div class="faq-body"><p>Every deal runs through DTO verification. Only <strong>verified buyers</strong>
      are recommended to sellers, negotiation happens in staff-provided private chat rooms, and payment is
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
    page("doxstox.html", "DoxStox Formula & Calculator — DTO",
         "The official DoxStox formula DS = 200I + 100P + 150R + 75G, with an interactive calculator and "
         "share price conversion.", doxstox)
    page("buyouts.html", "Full Doc Buyouts (Real Money) — DTO",
         "How DTO handles real-money full doc buyouts: verified buyers, matching, pricing, the 7% fee and "
         "the 9-step buyout process.", buyouts)
    page("listings.html", "Live Listings — DTO",
         "Google Docs currently listed on DTO for stock investment or full buyout.", listings)
    page("apply.html", "Apply to DTO — List Your Doc or Become a Verified Buyer",
         "Submit a request to DTO: list your Google Doc for stock investment, sell it in a full buyout, "
         "or register as a verified buyer. Reviewed manually by DTO staff.", apply_page)
    page("404.html", "Page not found — DTO", "That page isn't listed on DTO.", NOT_FOUND, active="")
