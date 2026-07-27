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
    ("join.html", "List Your Doc"),
]

EMAILS = [
    ("the.crypt1c.core@gmail.com", "Primary — best for fast responses"),
    ("494325@bsd48.org", "Secondary inbox"),
    ("Calderman@icloud.com", "Secondary inbox"),
]


def header(active):
    links = "".join(
        '<a href="%s"%s>%s</a>' % (h, ' class="active"' if h == active else "", t)
        for h, t in NAV
    )
    return f"""<header class="site">
  <div class="wrap nav">
    <a class="brand" href="index.html">
      <span class="mark">DTO</span>
      <span>Docs Trade Organization<small>By BananaNetworkz</small></span>
    </a>
    <button class="nav-toggle" aria-label="Toggle navigation">&#9776;</button>
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
        <a href="join.html">List Your Doc</a>
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
<script src="assets/app.js"></script>
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
      <a class="btn btn-gold" href="join.html">List your doc</a>
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
    <h2>Ready to be listed?</h2>
    <p class="section-sub">Submit your doc for evaluation and choose a stock listing or a full buyout.
    Every submission is reviewed manually by DTO staff.</p>
    <div class="grid g3">
""" + "".join(
    f'<a class="mail-tile" href="mailto:{e}"><span class="em">&#9993;</span>'
    f'<span>{e}<small>{note}</small></span></a>'
    for e, note in EMAILS
) + """
    </div>
    <p class="mt-24"><a class="btn btn-gold" href="join.html">Use the listing form</a></p>
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
    <p class="mt-24"><a class="btn btn-gold" href="join.html">List your doc</a>
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
    <p class="mt-24"><a class="btn btn-gold" href="join.html">Submit a doc for buyout</a>
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
      <a class="btn btn-gold" href="join.html">Add your doc</a>
      <a class="btn btn-ghost" href="doxstox.html">How scores are set</a>
    </div>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <div class="grid" style="grid-template-columns:1.4fr .8fr .8fr;gap:12px;margin-bottom:20px">
      <input type="text" id="fSearch" placeholder="Search docs…">
      <select id="fType">
        <option value="all">All listing types</option>
        <option value="stock">Stock listings</option>
        <option value="buyout">Full buyouts</option>
      </select>
      <select id="fSort">
        <option value="ds-desc">Highest DoxStox</option>
        <option value="ds-asc">Lowest DoxStox</option>
        <option value="name">Name A–Z</option>
      </select>
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
    <p><a class="btn btn-gold" href="join.html">Open the listing form</a></p>
  </div>
</section>
"""

# --------------------------------------------------------------------------
# Join
# --------------------------------------------------------------------------
join = """
<section class="hero" style="padding-bottom:26px">
  <div class="wrap">
    <span class="eyebrow">Get listed</span>
    <h1>Join DTO / <span class="accent">list your doc</span></h1>
    <p class="lede">DTO allows creators to monetize their Google Docs through either full buyouts or
    stock-based investment listings. Submit your doc to be reviewed, evaluated and turned into a stock
    asset — or sold outright.</p>
  </div>
</section>

<section class="block" id="inquire">
  <div class="wrap">
    <h2>How to join</h2>
    <p class="section-sub">To get your doc reviewed and added to DTO, email DTO staff. Use the form below
    to build a correctly formatted request in one click.</p>
    <div class="grid g3">
""" + "".join(
    f'<a class="mail-tile" href="mailto:{e}"><span class="em">&#9993;</span>'
    f'<span>{e}<small>{note}</small></span></a>'
    for e, note in EMAILS
) + """
    </div>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <h2>Listing request form</h2>
    <p class="section-sub">Fill this in and press <strong>Email this to DTO</strong> — it opens your mail
    app with everything filled in. No account needed, nothing is stored on this site.</p>
    <form id="listingForm" class="card" onsubmit="return false">
      <div class="form-grid">
        <div>
          <label class="form-label" for="doc_name">Doc name *</label>
          <input type="text" id="doc_name" name="doc_name" placeholder="e.g. Study Vault" required>
        </div>
        <div>
          <label class="form-label" for="email">Your contact email *</label>
          <input type="email" id="email" name="email" placeholder="you@example.com" required>
        </div>
        <div class="full">
          <label class="form-label" for="doc_link">Doc link *</label>
          <input type="url" id="doc_link" name="doc_link" placeholder="https://docs.google.com/document/d/…" required>
        </div>
        <div class="full">
          <label class="form-label" for="description">Short description of what it is *</label>
          <textarea id="description" name="description" placeholder="What the doc is, who it serves, why it matters in the community."></textarea>
        </div>
        <div class="full">
          <label class="form-label">What do you want? *</label>
          <div class="radio-row">
            <label class="radio-card">
              <input type="radio" name="listing_type" value="Stock Listing" checked>
              <strong>Stock Listing</strong>
              <small>Keep ownership · investors buy shares · value updates weekly via DoxStox</small>
            </label>
            <label class="radio-card">
              <input type="radio" name="listing_type" value="Full Buyout">
              <strong>Full Buyout</strong>
              <small>Sell the entire doc · one-time payment · ownership transfers fully</small>
            </label>
          </div>
        </div>
        <div id="priceWrap" class="full" style="display:none">
          <label class="form-label" for="asking_price">Asking price (USD)</label>
          <input type="number" id="asking_price" name="asking_price" min="0" step="1" placeholder="100">
        </div>
        <div>
          <label class="form-label" for="influence">Influence (1–10)</label>
          <input type="number" id="influence" name="influence" min="1" max="10" value="5">
        </div>
        <div>
          <label class="form-label" for="partners">Partners (count)</label>
          <input type="number" id="partners" name="partners" min="0" value="0">
        </div>
        <div>
          <label class="form-label" for="reputation">Reputation (0–10)</label>
          <input type="number" id="reputation" name="reputation" min="0" max="10" value="5">
        </div>
        <div>
          <label class="form-label" for="growth">Growth (0–10)</label>
          <input type="number" id="growth" name="growth" min="0" max="10" value="5">
        </div>
        <div class="full">
          <label class="form-label" for="notes">Anything else DTO staff should know</label>
          <textarea id="notes" name="notes" style="min-height:80px" placeholder="Partnerships, history, previous sales…"></textarea>
        </div>
        <div class="full notice" id="formEstimate"></div>
        <div class="full" style="display:flex;gap:12px;flex-wrap:wrap">
          <button class="btn btn-gold" id="mailtoBtn">Email this to DTO</button>
          <button class="btn btn-ghost" id="copyBtn">Copy request text</button>
        </div>
      </div>
    </form>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <h2>What to include in your email</h2>
    <div class="grid g2">
      <div class="card">
        <h3>Required details</h3>
        <ul class="clean">
          <li>Doc link</li>
          <li>Doc name</li>
          <li>Short description of what it is</li>
          <li>Whether you want a <strong>Full Buyout</strong> or a <strong>Stock Listing</strong></li>
        </ul>
      </div>
      <div class="card">
        <h3>Helpful extras</h3>
        <ul class="clean">
          <li>Influence in the community</li>
          <li>Partnerships with other docs</li>
          <li>Reputation and trust level</li>
          <li>Growth and activity</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <h2>Options you can choose</h2>
    <div class="grid g2">
      <div class="card">
        <h3><span class="badge stock">Stock listing</span></h3>
        <p style="margin:10px 0">Your doc becomes a tradable asset inside DTO.</p>
        <ul class="clean">
          <li>You keep ownership</li>
          <li>Investors can buy shares</li>
          <li>Value updates weekly based on DoxStox</li>
          <li>Price per share is calculated by DTO staff</li>
        </ul>
      </div>
      <div class="card">
        <h3><span class="badge buyout">Full buyout</span></h3>
        <p style="margin:10px 0">You sell your entire doc.</p>
        <ul class="clean">
          <li>One-time payment in DTC</li>
          <li>Ownership transfers fully to buyer</li>
          <li>No shares involved</li>
          <li>Negotiated through DTO staff</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <h2>How DTO values your doc</h2>
    <p class="section-sub">DTO staff will evaluate your doc using influence in the community, partnerships
    with other docs, reputation and trust level, and growth and activity. This becomes your
    <strong>DoxStox Score</strong>, which determines value.</p>
    <div class="formula">DS = 200I + 100P + 150R + 75G<small>Share price SP = DS ÷ 100</small></div>
    <p class="mt-24"><a class="btn btn-ghost" href="doxstox.html">Estimate your score</a></p>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <h2>Important rules</h2>
    <div class="notice warn">
      <ul class="clean">
        <li>All listings must be <strong>verified by DTO staff</strong></li>
        <li>Fake stats or misleading information will result in <strong>rejection</strong></li>
        <li>DTO reserves the right to <strong>decline any submission</strong></li>
        <li>All transactions are <strong>handled manually</strong> for security</li>
      </ul>
    </div>
  </div>
</section>

<section class="block">
  <div class="wrap">
    <h2>Why join DTO?</h2>
    <div class="grid g4">
      <div class="card"><h3>Turn a doc into an asset</h3><p>Your Google Doc becomes something with a recognised value.</p></div>
      <div class="card"><h3>Earn from growth</h3><p>Earn from views, influence and growth over time.</p></div>
      <div class="card"><h3>A growing marketplace</h3><p>Join a real digital economy for docs.</p></div>
      <div class="card"><h3>BananaNetworkz ecosystem</h3><p>Be part of the BananaNetworkz exchange ecosystem.</p></div>
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
    page("join.html", "Join DTO / List Your Doc",
         "Submit your Google Doc to DTO for a stock listing or a full buyout. Includes a prefilled email "
         "request builder.", join)
    page("404.html", "Page not found — DTO", "That page isn't listed on DTO.", NOT_FOUND, active="")
