/* DTO — shared front-end logic */

/* ---------- Mobile nav ---------- */
document.addEventListener('click', function (e) {
  var t = e.target.closest('.nav-toggle');
  if (!t) return;
  var links = document.querySelector('.nav-links');
  if (links) links.classList.toggle('open');
});

/* ---------- Active nav link ---------- */
(function () {
  var here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    var href = a.getAttribute('href');
    if (href === here) a.classList.add('active');
  });
})();

/* ---------- Year ---------- */
document.querySelectorAll('[data-year]').forEach(function (el) {
  el.textContent = new Date().getFullYear();
});

/* ---------- DoxStox calculator ----------
   DS = 200I + 100P + 150R + 75G
   SP = DS / 100                              */
window.DTO = {
  score: function (I, P, R, G) {
    return 200 * I + 100 * P + 150 * R + 75 * G;
  },
  sharePrice: function (ds) {
    return ds / 100;
  },
  fee: function (price) {
    return price * 0.07;
  }
};

(function initCalc() {
  var form = document.getElementById('calc');
  if (!form) return;

  var ids = ['I', 'P', 'R', 'G'];
  function read(id) { return parseInt(document.getElementById('in' + id).value, 10) || 0; }

  function render() {
    var I = read('I'), P = read('P'), R = read('R'), G = read('G');
    var parts = { I: 200 * I, P: 100 * P, R: 150 * R, G: 75 * G };
    var ds = parts.I + parts.P + parts.R + parts.G;
    var sp = window.DTO.sharePrice(ds);

    ids.forEach(function (id) {
      document.getElementById('val' + id).textContent = read(id);
      document.getElementById('part' + id).textContent = parts[id].toLocaleString();
    });
    document.getElementById('dsOut').textContent = ds.toLocaleString();
    var ds2 = document.getElementById('dsOut2');
    if (ds2) ds2.textContent = ds.toLocaleString();
    document.getElementById('spOut').textContent = sp.toFixed(2) + ' DTC / share';
    document.getElementById('spRound').textContent =
      'Rounded for simplicity: ' + Math.round(sp) + ' DTC per share';
  }

  ids.forEach(function (id) {
    document.getElementById('in' + id).addEventListener('input', render);
  });
  render();
})();

/* ---------- Fee calculator ---------- */
(function initFee() {
  var input = document.getElementById('feePrice');
  if (!input) return;
  function render() {
    var p = parseFloat(input.value) || 0;
    var fee = window.DTO.fee(p);
    document.getElementById('feeOut').textContent = '$' + fee.toFixed(2);
    var f2 = document.getElementById('feeOut2');
    if (f2) f2.textContent = '-$' + fee.toFixed(2);
    document.getElementById('sellerOut').textContent = '$' + (p - fee).toFixed(2);
    document.getElementById('buyerOut').textContent = '$' + p.toFixed(2);
  }
  input.addEventListener('input', render);
  render();
})();

/* ---------- Listings table ---------- */
(function initListings() {
  var tbody = document.getElementById('listingRows');
  if (!tbody) return;

  var state = { type: 'all', q: '', sort: 'ds-desc', rows: [] };

  function badge(type) {
    return type === 'buyout'
      ? '<span class="badge buyout">Full Buyout</span>'
      : '<span class="badge stock">Stock Listing</span>';
  }

  function draw() {
    var rows = state.rows.filter(function (r) {
      if (state.type !== 'all' && r.type !== state.type) return false;
      if (state.q && (r.name + ' ' + r.description).toLowerCase().indexOf(state.q) === -1) return false;
      return true;
    });

    rows.sort(function (a, b) {
      if (state.sort === 'ds-desc') return b.doxstox - a.doxstox;
      if (state.sort === 'ds-asc') return a.doxstox - b.doxstox;
      if (state.sort === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

    if (!rows.length) {
      tbody.innerHTML =
        '<tr><td colspan="6" style="text-align:center;padding:34px">' +
        'No listings match that filter. <a href="apply.html">Submit your doc</a> to be listed.' +
        '</td></tr>';
    } else {
      tbody.innerHTML = rows.map(function (r) {
        var sp = window.DTO.sharePrice(r.doxstox);
        var price = r.type === 'buyout'
          ? (r.askingPrice ? '$' + Number(r.askingPrice).toLocaleString() + ' USD' : 'Open to offers')
          : sp.toFixed(2) + ' DTC / share';
        return '<tr>' +
          '<td class="doc-name">' + r.name + '<br><small style="color:var(--muted);font-weight:500">' + r.description + '</small></td>' +
          '<td>' + badge(r.type) + '</td>' +
          '<td class="score">' + r.doxstox.toLocaleString() + '</td>' +
          '<td>' + price + '</td>' +
          '<td>' + (r.verified
            ? '<span class="badge verified">Verified</span>'
            : '<span class="badge pending">In Review</span>') + '</td>' +
          '<td><a class="btn btn-ghost" style="padding:7px 14px;font-size:.83rem" href="apply.html#request">Inquire</a></td>' +
          '</tr>';
      }).join('');
    }

    var c = document.getElementById('listingCount');
    if (c) c.textContent = rows.length + ' listing' + (rows.length === 1 ? '' : 's');
  }

  fetch('data/listings.json')
    .then(function (r) { return r.json(); })
    .then(function (data) { state.rows = data.listings || []; draw(); })
    .catch(function () {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px">' +
        'Listings could not be loaded. Email <a href="mailto:the.crypt1c.core@gmail.com">the.crypt1c.core@gmail.com</a>.</td></tr>';
    });

  var typeSel = document.getElementById('fType');
  var sortSel = document.getElementById('fSort');
  var search = document.getElementById('fSearch');
  if (typeSel) typeSel.addEventListener('change', function () { state.type = this.value; draw(); });
  if (sortSel) sortSel.addEventListener('change', function () { state.sort = this.value; draw(); });
  if (search) search.addEventListener('input', function () { state.q = this.value.toLowerCase(); draw(); });
})();

/* ---------- Nav a11y: reflect toggle state ---------- */
document.addEventListener('click', function (e) {
  var t = e.target.closest('.nav-toggle');
  if (!t) return;
  var links = document.querySelector('.nav-links');
  t.setAttribute('aria-expanded', links && links.classList.contains('open') ? 'true' : 'false');
});

/* ---------- Setup banner: only shown while the Google Form isn't wired up ---------- */
(function () {
  var el = document.getElementById('setupBanner');
  if (!el) return;
  var cfg = window.DTO_CONFIG || {};
  var configured = cfg.formId && cfg.entries && cfg.entries.requestType;
  if (configured) { el.remove(); return; }
  el.hidden = false;
  el.innerHTML = '<strong>Staff note:</strong> the Google Form isn\'t connected yet, so requests ' +
    'currently open a prefilled email to DTO staff. Everything works — see ' +
    '<code>SETUP-GOOGLE-FORM.md</code> to route requests into a spreadsheet instead. ' +
    'This notice disappears automatically once connected.';
})();

/* ---------- Reveal-on-scroll ---------- */
(function () {
  if (!('IntersectionObserver' in window)) return;
  var els = document.querySelectorAll('.card, .tl, details.faq');
  if (!els.length) return;
  els.forEach(function (e) { e.classList.add('reveal'); });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -40px 0px', threshold: .05 });
  els.forEach(function (e) { io.observe(e); });
})();
