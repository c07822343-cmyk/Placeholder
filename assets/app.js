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

/* ---------- Shared helpers ---------- */
window.DTO = window.DTO || {};

window.DTO.fee = function (price) {
  return price * 0.07;
};

window.DTO.money = function (n) {
  return '$' + Number(n).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

window.DTO.escapeHtml = function (s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
};

window.DTO.escapeAttr = function (s) {
  return window.DTO.escapeHtml(s).replace(/`/g, '&#96;');
};

window.DTO.isUrl = function (s) {
  return /^https?:\/\//i.test(String(s || '').trim());
};

window.DTO.isEmail = function (s) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(s || '').trim());
};

window.DTO.bestExternalHref = function (s) {
  var v = String(s || '').trim();
  if (!v) return '';
  if (window.DTO.isUrl(v)) return v;
  if (/^(discord\.gg|discord\.com|www\.discord\.com)\//i.test(v)) return 'https://' + v;
  if (/^(docs\.google\.com|drive\.google\.com)\//i.test(v)) return 'https://' + v;
  return '';
};

window.DTO.normalizeType = function (v) {
  var s = String(v || '').trim().toLowerCase();
  if (s.indexOf('buyout') !== -1) return 'buyout';
  return 'stock';
};

window.DTO.listingHref = function (row) {
  return 'listing-details.html?name=' + encodeURIComponent(row.name || '') +
    '&type=' + encodeURIComponent(row.type || '');
};

window.DTO.loadListings = (function () {
  var cachedPromise = null;

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
    if (v === true) return true;
    if (v === false) return false;
    var s = String(v == null ? '' : v).trim().toLowerCase();
    return s === 'true' || s === 'yes' || s === 'y' || s === '1' || s === 'published' || s === 'verified';
  }

  function normalizeItem(item) {
    var published = item && Object.prototype.hasOwnProperty.call(item, 'published')
      ? parseBool(item.published)
      : true;

    return {
      name: String(item && item.name || '').trim(),
      description: String(item && item.description || '').trim(),
      type: window.DTO.normalizeType(item && item.type),
      doxstox: parseNumber(item && item.doxstox),
      sharePrice: parseNumber(item && item.sharePrice),
      askingPrice: parseNumber(item && item.askingPrice),
      verified: item && typeof item.verified === 'boolean' ? item.verified : parseBool(item && item.verified),
      published: published,
      email: String(item && item.email || '').trim(),
      discord: String(item && item.discord || '').trim(),
      docLink: String(item && item.docLink || '').trim()
    };
  }

  function isMeaningfulRow(row) {
    return !!(row && (row.name || row.description || row.email || row.discord || row.docLink ||
      row.doxstox != null || row.askingPrice != null || row.sharePrice != null));
  }

  function loadLocalListings() {
    return fetch('data/listings.json', { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        return (data.listings || []).map(normalizeItem).filter(function (row) {
          return row.published && isMeaningfulRow(row);
        });
      });
  }

  function rowsFromSheetTable(table) {
    var headers = ((window.DTO_CONFIG || {}).listings || {}).headers || {};
    var expected = {
      name: normalizeHeader(headers.name || 'Doc Name'),
      description: normalizeHeader(headers.description || 'Description'),
      type: normalizeHeader(headers.type || 'Type'),
      doxstox: normalizeHeader(headers.doxstox || 'DoxStox'),
      sharePrice: normalizeHeader(headers.sharePrice || 'Share Price'),
      askingPrice: normalizeHeader(headers.askingPrice || 'Asking Price'),
      verified: normalizeHeader(headers.verified || 'Verified'),
      published: normalizeHeader(headers.published || 'Published'),
      email: normalizeHeader(headers.email || 'Email'),
      discord: normalizeHeader(headers.discord || 'Discord'),
      docLink: normalizeHeader(headers.docLink || 'Doc Link')
    };

    var rawRows = (table.rows || []).map(function (row) {
      return (row.c || []).map(function (cell) {
        return cell && cell.v != null ? String(cell.v) : '';
      });
    });

    var headerRow = [];
    var startIndex = 0;
    var colLabels = (table.cols || []).map(function (col) {
      return normalizeHeader((col && (col.label || col.id)) || '');
    });

    if (colLabels.indexOf(expected.name) !== -1 && colLabels.indexOf(expected.type) !== -1) {
      headerRow = colLabels;
      startIndex = 0;
    } else {
      var headerIndex = rawRows.findIndex(function (row) {
        var normalized = row.map(normalizeHeader);
        return normalized.indexOf(expected.name) !== -1 && normalized.indexOf(expected.type) !== -1;
      });
      if (headerIndex === -1) return [];
      headerRow = rawRows[headerIndex].map(normalizeHeader);
      startIndex = headerIndex + 1;
    }

    var col = {};
    Object.keys(expected).forEach(function (key) {
      col[key] = headerRow.indexOf(expected[key]);
    });

    return rawRows.slice(startIndex).map(function (row) {
      function at(key) {
        var idx = col[key];
        return idx >= 0 ? String(row[idx] || '').trim() : '';
      }

      var item = normalizeItem({
        name: at('name'),
        description: at('description'),
        type: at('type'),
        doxstox: at('doxstox'),
        sharePrice: at('sharePrice'),
        askingPrice: at('askingPrice'),
        verified: at('verified'),
        published: at('published') || true,
        email: at('email'),
        discord: at('discord'),
        docLink: at('docLink')
      });

      return item;
    }).filter(function (row) {
      return row.published && isMeaningfulRow(row);
    });
  }

  function loadSheetListings() {
    return new Promise(function (resolve, reject) {
      var sheetCfg = ((window.DTO_CONFIG || {}).listings || {});
      if (sheetCfg.provider !== 'google-sheets' || !sheetCfg.sheetId) {
        reject(new Error('No Google Sheet configured'));
        return;
      }

      var cbName = '__dtoSheetCallback_' + Date.now();
      var script = document.createElement('script');
      var timeout = setTimeout(function () {
        cleanup();
        reject(new Error('Timed out loading Google Sheet'));
      }, 10000);

      function cleanup() {
        clearTimeout(timeout);
        try { delete window[cbName]; } catch (e) { window[cbName] = undefined; }
        if (script.parentNode) script.parentNode.removeChild(script);
      }

      window[cbName] = function (response) {
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

      var gid = encodeURIComponent(sheetCfg.gid || '0');
      script.src = 'https://docs.google.com/spreadsheets/d/' + encodeURIComponent(sheetCfg.sheetId) +
        '/gviz/tq?gid=' + gid + '&headers=0&tqx=out:json;responseHandler:' + cbName;
      document.body.appendChild(script);
    });
  }

  return function () {
    if (!cachedPromise) {
      cachedPromise = loadSheetListings()
        .then(function (rows) {
          window.DTO.listingsSource = 'google-sheets';
          return rows;
        })
        .catch(function () {
          return loadLocalListings().then(function (rows) {
            window.DTO.listingsSource = 'local-fallback';
            return rows;
          });
        });
    }
    return cachedPromise;
  };
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
          '<td class="doc-name">' + window.DTO.escapeHtml(r.name) + '<br><small style="color:var(--muted);font-weight:500">' + window.DTO.escapeHtml(r.description || '') + '</small></td>' +
          '<td>' + badge(r.type) + '</td>' +
          '<td class="score">' + score + '</td>' +
          '<td>' + price + '</td>' +
          '<td>' + (r.verified
            ? '<span class="badge verified">Verified</span>'
            : '<span class="badge pending">In Review</span>') + '</td>' +
          '<td><a class="btn btn-ghost" style="padding:7px 14px;font-size:.83rem" href="' + window.DTO.listingHref(r) + '">Inquire</a></td>' +
          '</tr>';
      }).join('');
    }

    var c = document.getElementById('listingCount');
    if (c) {
      var source = window.DTO.listingsSource === 'google-sheets'
        ? ' · live Google Sheet'
        : (window.DTO.listingsSource === 'local-fallback' ? ' · fallback data' : '');
      c.textContent = rows.length + ' listing' + (rows.length === 1 ? '' : 's') + source;
    }
  }

  window.DTO.loadListings()
    .then(function (rows) {
      state.rows = rows || [];
      draw();
    })
    .catch(function () {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px">Listings could not be loaded right now.</td></tr>';
    });

  var typeSel = document.getElementById('fType');
  var sortSel = document.getElementById('fSort');
  var search = document.getElementById('fSearch');
  if (typeSel) typeSel.addEventListener('change', function () { state.type = this.value; draw(); });
  if (sortSel) sortSel.addEventListener('change', function () { state.sort = this.value; draw(); });
  if (search) search.addEventListener('input', function () { state.q = this.value.toLowerCase(); draw(); });
})();

/* ---------- Listing detail page ---------- */
(function initListingDetail() {
  var mount = document.getElementById('listingDetailPage');
  if (!mount) return;

  var titleEl = document.getElementById('listingDetailTitle');
  var leadEl = document.getElementById('listingDetailLead');
  var params = new URLSearchParams(location.search);
  var wantedName = String(params.get('name') || '').trim().toLowerCase();
  var wantedType = params.get('type') ? window.DTO.normalizeType(params.get('type')) : '';

  function badge(type) {
    return type === 'buyout'
      ? '<span class="badge buyout">Full Buyout</span>'
      : '<span class="badge stock">Stock Listing</span>';
  }

  function contactCard(label, value, href) {
    if (!value) {
      return '<div class="card"><h3>' + label + '</h3><p style="color:var(--muted)">Not provided</p></div>';
    }
    var body = '<p>' + window.DTO.escapeHtml(value) + '</p>';
    if (href) {
      body += '<p class="mt-24"><a class="btn btn-ghost" href="' + window.DTO.escapeAttr(href) + '"' +
        (/^https?:/i.test(href) ? ' target="_blank" rel="noopener"' : '') + '>' +
        (label === 'Email' ? 'Open email' : 'Open link') + '</a></p>';
    }
    return '<div class="card"><h3>' + label + '</h3>' + body + '</div>';
  }

  function renderNotFound() {
    if (titleEl) titleEl.textContent = 'Listing not found';
    if (leadEl) leadEl.textContent = 'That listing could not be found in the current DTO listings data.';
    mount.innerHTML = '<div class="notice warn">That listing could not be found. It may have been removed, renamed, or is no longer published.</div>' +
      '<p class="mt-24"><a class="btn btn-gold" href="listings.html">Back to listings</a></p>';
  }

  function render(row) {
    var priceLabel = row.type === 'buyout' ? 'Asking price' : 'Share price';
    var priceValue = row.type === 'buyout'
      ? (row.askingPrice != null ? '$' + Number(row.askingPrice).toLocaleString() + ' USD' : 'Open to offers')
      : (row.sharePrice != null ? Number(row.sharePrice).toLocaleString() + ' DTC / share' : 'Not yet set');
    var scoreValue = row.doxstox != null ? Number(row.doxstox).toLocaleString() : 'Pending';
    var statusValue = row.verified ? 'Verified' : 'In Review';

    document.title = row.name + ' — DTO Listing';
    if (titleEl) titleEl.textContent = row.name;
    if (leadEl) {
      leadEl.textContent = row.description || 'View the latest public details for this DTO listing.';
    }

    var discordHref = window.DTO.isUrl(row.discord) ? row.discord : '';
    var docHref = window.DTO.isUrl(row.docLink) ? row.docLink : '';

    mount.innerHTML =
      '<div class="grid g2">' +
        '<div class="card">' +
          '<h3>Description</h3>' +
          '<p>' + window.DTO.escapeHtml(row.description || 'No description provided yet.') + '</p>' +
          (row.docLink ? '<p class="mt-24"><a class="btn btn-ghost" href="' + window.DTO.escapeAttr(row.docLink) + '" target="_blank" rel="noopener">Open doc link</a></p>' : '') +
        '</div>' +
        '<div class="card">' +
          '<h3>Listing details</h3>' +
          '<div class="rev-row"><span>Type</span><b>' + badge(row.type) + '</b></div>' +
          '<div class="rev-row"><span>DoxStox</span><b>' + window.DTO.escapeHtml(scoreValue) + '</b></div>' +
          '<div class="rev-row"><span>' + priceLabel + '</span><b>' + window.DTO.escapeHtml(priceValue) + '</b></div>' +
          '<div class="rev-row"><span>Status</span><b>' + window.DTO.escapeHtml(statusValue) + '</b></div>' +
        '</div>' +
      '</div>' +
      '<div class="grid g3 mt-24">' +
        contactCard('Email', row.email, row.email ? 'mailto:' + row.email : '') +
        contactCard('Discord', row.discord, discordHref) +
        contactCard('Doc link', row.docLink, docHref) +
      '</div>' +
      '<p class="mt-24"><a class="btn btn-gold" href="apply.html#request">Ask DTO about this listing</a> ' +
      '<a class="btn btn-ghost" href="listings.html">Back to listings</a></p>';
  }

  if (!wantedName) {
    renderNotFound();
    return;
  }

  window.DTO.loadListings()
    .then(function (rows) {
      var row = rows.find(function (item) {
        return item.name.toLowerCase() === wantedName && (!wantedType || item.type === wantedType);
      }) || rows.find(function (item) {
        return item.name.toLowerCase() === wantedName;
      });

      if (!row) {
        renderNotFound();
        return;
      }
      render(row);
    })
    .catch(function () {
      if (titleEl) titleEl.textContent = 'Listing unavailable';
      if (leadEl) leadEl.textContent = 'The listing source could not be loaded right now.';
      mount.innerHTML = '<div class="notice warn">Listing details could not be loaded right now. Please try again in a moment.</div>';
    });
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
  }, { rootMargin: '0px 0px -40px 0px', threshold: 0.05 });
  els.forEach(function (e) { io.observe(e); });
})();
