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
        'No listings match that filter. <a href="join.html">Submit your doc</a> to be listed.' +
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
          '<td><a class="btn btn-ghost" style="padding:7px 14px;font-size:.83rem" href="join.html#inquire">Inquire</a></td>' +
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

/* ---------- Listing-type radio highlight ---------- */
document.querySelectorAll('.radio-card input[type="radio"]').forEach(function (r) {
  r.addEventListener('change', function () {
    document.querySelectorAll('.radio-card').forEach(function (c) { c.classList.remove('selected'); });
    if (r.checked) r.closest('.radio-card').classList.add('selected');
  });
  if (r.checked) r.closest('.radio-card').classList.add('selected');
});

/* ---------- Submission form: build a prefilled mailto as a fallback ---------- */
(function initSubmitForm() {
  var form = document.getElementById('listingForm');
  if (!form) return;

  function buildBody(fd) {
    return [
      'DTO LISTING REQUEST',
      '--------------------------------',
      'Doc name:      ' + (fd.get('doc_name') || ''),
      'Doc link:      ' + (fd.get('doc_link') || ''),
      'Listing type:  ' + (fd.get('listing_type') || ''),
      'Asking price:  ' + (fd.get('asking_price') || 'n/a'),
      'Contact:       ' + (fd.get('email') || ''),
      '',
      'Description:',
      (fd.get('description') || ''),
      '',
      'Self-reported stats (DTO staff will verify):',
      '  Influence:    ' + (fd.get('influence') || '-') + ' / 10',
      '  Partners:     ' + (fd.get('partners') || '-'),
      '  Reputation:   ' + (fd.get('reputation') || '-') + ' / 10',
      '  Growth:       ' + (fd.get('growth') || '-') + ' / 10',
      '',
      'Notes:',
      (fd.get('notes') || 'none')
    ].join('\n');
  }

  var mailBtn = document.getElementById('mailtoBtn');
  if (mailBtn) {
    mailBtn.addEventListener('click', function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      var subject = 'DTO Listing Request — ' + (fd.get('doc_name') || 'Untitled Doc');
      location.href = 'mailto:the.crypt1c.core@gmail.com'
        + '?cc=494325@bsd48.org,Calderman@icloud.com'
        + '&subject=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(buildBody(fd));
    });
  }

  var copyBtn = document.getElementById('copyBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', function (e) {
      e.preventDefault();
      var text = buildBody(new FormData(form));
      navigator.clipboard.writeText(text).then(function () {
        copyBtn.textContent = 'Copied ✓';
        setTimeout(function () { copyBtn.textContent = 'Copy request text'; }, 2200);
      });
    });
  }

  // Show/hide asking price depending on listing type
  function toggleprice() {
    var t = form.querySelector('input[name="listing_type"]:checked');
    var wrap = document.getElementById('priceWrap');
    if (!wrap) return;
    wrap.style.display = (t && t.value === 'Full Buyout') ? '' : 'none';
  }
  form.querySelectorAll('input[name="listing_type"]').forEach(function (r) {
    r.addEventListener('change', toggleprice);
  });
  toggleprice();

  // Live DoxStox estimate on the form
  function estimate() {
    var fd = new FormData(form);
    var ds = window.DTO.score(
      +fd.get('influence') || 0, +fd.get('partners') || 0,
      +fd.get('reputation') || 0, +fd.get('growth') || 0
    );
    var out = document.getElementById('formEstimate');
    if (out) {
      out.innerHTML = 'Estimated DoxStox score: <strong>' + ds.toLocaleString() +
        '</strong> &nbsp;·&nbsp; Indicative share price: <strong>' +
        window.DTO.sharePrice(ds).toFixed(2) + ' DTC</strong>' +
        '<br><small>Unofficial. Final value is set by DTO staff review.</small>';
    }
  }
  ['influence', 'partners', 'reputation', 'growth'].forEach(function (n) {
    var el = form.querySelector('[name="' + n + '"]');
    if (el) el.addEventListener('input', estimate);
  });
  estimate();
})();
