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

/* ---------- Shared helpers ----------
   Valuations are assigned by DTO staff. There is no public formula. */
window.DTO = {
  fee: function (price) {
    return price * 0.07;
  },
  money: function (n) {
    return '$' + Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
};

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

  var CFG = window.DTO_CONFIG || {};
  var SHEET = CFG.listings || {};
  var state = { type: 'all', q: '', sort: 'ds-desc', rows: [] };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function badge(type) {
    return type === 'buyout'
      ? '<span class="badge buyout">Full Buyout</span>'
      : '<span class="badge stock">Stock Listing</span>';
  }

  function normalizeHeader(s) {
    return String(s || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
  }

  function parseNumber(v) {
    if (v == null || v === '') return null;
    var cleaned = String(v).replace(/[$,]/g, '').trim();
    if (!cleaned) return null;
    var n = Number(cleaned);
    return isFinite(n) ? n : null;
  }

  function parseBool(v) {
    var s = String(v == null ? '' : v).trim().toLowerCase();
    return s === 'true' || s === 'yes' || s === 'y' || s === '1' || s === 'published' || s === 'verified';
  }

  function normalizeType(v) {
    var s = String(v || '').trim().toLowerCase();
    if (s.indexOf('buyout') !== -1) return 'buyout';
    return 'stock';
  }

  function isMeaningfulRow(row) {
    return row && (row.name || row.description || row.type || row.doxstox != null || row.askingPrice != null || row.sharePrice != null);
  }

  function draw() {
    var rows = state.rows.filter(function (r) {
      if (state.type !== 'all' && r.type !== state.type) return false;
      if (state.q && (r.name + ' ' + r.description).toLowerCase().indexOf(state.q) === -1) return false;
      return true;
    });

    rows.sort(function (a, b) {
      var av = (a.doxstox == null) ? -1 : a.doxstox;
      var bv = (b.doxstox == null) ? -1 : b.doxstox;
      if (state.sort === 'ds-desc') return bv - av;
      if (state.sort === 'ds-asc') return av - bv;
      if (state.sort === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

    if (!rows.length) {
      var msg = state.rows.length === 0
        ? 'No listings yet. <a href="apply.html">Submit your doc</a> to be the first.'
        : 'No listings match that filter. <a href="apply.html">Submit your doc</a> to be listed.';
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:34px">' + msg + '</td></tr>';
    } else {
      tbody.innerHTML = rows.map(function (r) {
        var price;
        if (r.type === 'buyout') {
          price = r.askingPrice != null
            ? '$' + Number(r.askingPrice).toLocaleString() + ' USD'
            : '<span style="color:var(--muted)">Open to offers</span>';
        } else {
          price = (r.sharePrice != null)
            ? Number(r.sharePrice).toLocaleString() + ' DTC / share'
            : '<span style="color:var(--muted)">Not yet set</span>';
        }
        var score = (r.doxstox != null)
          ? Number(r.doxstox).toLocaleString()
          : '<span style="color:var(--muted);font-weight:500">Pending</span>';
        return '<tr>' +
          '<td class="doc-name">' + esc(r.name) + '<br><small style="color:var(--muted);font-weight:500">' + esc(r.description || '') + '</small></td>' +
          '<td>' + badge(r.type) + '</td>' +
          '<td class="score">' + score + '</td>' +
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

  function loadLocalListings() {
    return fetch('data/listings.json')
      .then(function (r) { return r.json(); })
      .then(function (data) { return data.listings || []; });
  }

  function rowsFromSheetTable(table) {
    var headers = (SHEET.headers || {});
    var expected = {
      name: normalizeHeader(headers.name || 'Doc Name'),
      description: normalizeHeader(headers.description || 'Description'),
      type: normalizeHeader(headers.type || 'Type'),
      doxstox: normalizeHeader(headers.doxstox || 'DoxStox'),
      sharePrice: normalizeHeader(headers.sharePrice || 'Share Price'),
      askingPrice: normalizeHeader(headers.askingPrice || 'Asking Price'),
      verified: normalizeHeader(headers.verified || 'Verified'),
      published: normalizeHeader(headers.published || 'Published')
    };

    var rawRows = (table.rows || []).map(function (row) {
      return (row.c || []).map(function (cell) {
        return cell && cell.v != null ? String(cell.v) : '';
      });
    });

    var headerIndex = rawRows.findIndex(function (row) {
      var normalized = row.map(normalizeHeader);
      return normalized.indexOf(expected.name) !== -1 && normalized.indexOf(expected.type) !== -1;
    });

    if (headerIndex === -1) return [];

    var headerRow = rawRows[headerIndex].map(normalizeHeader);
    var col = {};
    Object.keys(expected).forEach(function (key) {
      col[key] = headerRow.indexOf(expected[key]);
    });

    return rawRows.slice(headerIndex + 1).map(function (row) {
      function at(key) {
        var idx = col[key];
        return idx >= 0 ? (row[idx] || '').trim() : '';
      }
      var publishedValue = at('published');
      var published = !publishedValue || parseBool(publishedValue);
      var item = {
        name: at('name'),
        description: at('description'),
        type: normalizeType(at('type')),
        doxstox: parseNumber(at('doxstox')),
        sharePrice: parseNumber(at('sharePrice')),
        askingPrice: parseNumber(at('askingPrice')),
        verified: parseBool(at('verified')),
        published: published
      };
      return item;
    }).filter(function (row) {
      return row.published && isMeaningfulRow(row);
    });
  }

  function loadSheetListings() {
    return new Promise(function (resolve, reject) {
      if (SHEET.provider !== 'google-sheets' || !SHEET.sheetId) {
        reject(new Error('No Google Sheet configured'));
        return;
      }

      var cbName = '__dtoSheetCallback_' + Date.now();
      var timedOut = false;
      var script = document.createElement('script');
      var timeout = setTimeout(function () {
        timedOut = true;
        cleanup();
        reject(new Error('Timed out loading Google Sheet'));
      }, 10000);

      function cleanup() {
        clearTimeout(timeout);
        try { delete window[cbName]; } catch (e) { window[cbName] = undefined; }
        if (script.parentNode) script.parentNode.removeChild(script);
      }

      window[cbName] = function (response) {
        if (timedOut) return;
        cleanup();
        try {
          resolve(rowsFromSheetTable(response.table || {}));
        } catch (err) {
          reject(err);
        }
      };

      script.onerror = function () {
        cleanup();
        reject(new Error('Could not load Google Sheet script'));
      };

      var gid = encodeURIComponent(SHEET.gid || '0');
      script.src = 'https://docs.google.com/spreadsheets/d/' + encodeURIComponent(SHEET.sheetId) +
        '/gviz/tq?gid=' + gid + '&headers=0&tqx=out:json;responseHandler:' + cbName;
      document.body.appendChild(script);
    });
  }

  loadSheetListings()
    .catch(function () { return loadLocalListings(); })
    .then(function (rows) {
      state.rows = rows || [];
      draw();
    })
    .catch(function () {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px">' +
        'Listings could not be loaded right now.</td></tr>';
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
