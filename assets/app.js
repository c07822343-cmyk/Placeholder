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

window.DTO.normalizeStatus = function (status, verified) {
  var s = String(status || '').trim().toLowerCase();
  if (s === 'active') return 'Active';
  if (s === 'for sale' || s === 'forsale') return 'For Sale';
  if (s === 'under review' || s === 'underreview' || s === 'in review' || s === 'inreview') return 'Under Review';
  if (s === 'sold') return 'Sold';
  if (s === 'frozen') return 'Frozen';
  if (verified === true) return 'Active';
  if (verified === false) return 'Under Review';
  return 'Under Review';
};

window.DTO.statusBadge = function (status) {
  var normalized = window.DTO.normalizeStatus(status);
  var cls = 'status-under-review';
  if (normalized === 'Active') cls = 'status-active';
  else if (normalized === 'For Sale') cls = 'status-for-sale';
  else if (normalized === 'Sold') cls = 'status-sold';
  else if (normalized === 'Frozen') cls = 'status-frozen';
  return '<span class="badge ' + cls + '">' + window.DTO.escapeHtml(normalized) + '</span>';
};

window.DTO.qualityFormula = {
  utility: 250,
  aesthetics: 150,
  integration: 100,
  verification: 100
};

window.DTO.tooltipText = {
  utility: 'Measures what a user can do. Higher utility means the doc is structurally essential to the ecosystem.',
  aesthetics: 'Measures design work, organization, branding, navigation and overall craftsmanship.',
  integration: 'Measures the quality and depth of ecosystem connections rather than raw partnership counts.',
  verification: 'Measures trust, staff-vetted reliability and reputation. Verification Grade runs from 1 to 5.'
};

window.DTO.listingHref = function (row) {
  return 'listing-details.html?name=' + encodeURIComponent(row.name || '') +
    '&type=' + encodeURIComponent(row.type || '');
};

/* ---------- Listings loader ---------- */
window.DTO.loadListings = (function () {
  var cachedPromise = null;

  function parseNumber(v) {
    if (v == null || v === '') return null;
    var cleaned = String(v).replace(/[$,%]/g, '').replace(/,/g, '').trim();
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

  function normalizeTier(v, min, max) {
    var n = parseNumber(v);
    if (n == null) return null;
    n = Math.round(n);
    if (n < min || n > max) return null;
    return n;
  }

  function calculateDoxstox(utility, aesthetics, integration, verificationGrade) {
    if ([utility, aesthetics, integration, verificationGrade].some(function (n) { return n == null; })) return null;
    return (window.DTO.qualityFormula.utility * utility) +
      (window.DTO.qualityFormula.aesthetics * aesthetics) +
      (window.DTO.qualityFormula.integration * integration) +
      (window.DTO.qualityFormula.verification * verificationGrade);
  }

  function normalizeItem(item) {
    var published = item && Object.prototype.hasOwnProperty.call(item, 'published')
      ? parseBool(item.published)
      : true;
    var verified = item && typeof item.verified === 'boolean' ? item.verified : parseBool(item && item.verified);
    var utility = normalizeTier(item && item.utility, 1, 10);
    var aesthetics = normalizeTier(item && item.aesthetics, 1, 10);
    var integration = normalizeTier(item && item.integration, 1, 10);
    var verificationGrade = normalizeTier(item && item.verificationGrade, 1, 5);
    var computedDoxstox = calculateDoxstox(utility, aesthetics, integration, verificationGrade);
    var doxstox = computedDoxstox != null ? computedDoxstox : parseNumber(item && item.currentDS != null ? item.currentDS : item.doxstox);
    var sharePrice = computedDoxstox != null ? (computedDoxstox / 100) : parseNumber(item && item.currentSP != null ? item.currentSP : item.sharePrice);

    return {
      ticker: String(item && item.ticker || '').trim(),
      name: String(item && (item.title || item.name || item.ticker) || '').trim(),
      title: String(item && (item.title || item.name || item.ticker) || '').trim(),
      description: String(item && item.description || '').trim(),
      type: window.DTO.normalizeType(item && item.type),
      doxstox: doxstox,
      sharePrice: sharePrice,
      askingPrice: parseNumber(item && item.askingPrice),
      verified: verified,
      status: window.DTO.normalizeStatus(item && item.status, verified),
      utility: utility,
      aesthetics: aesthetics,
      integration: integration,
      verificationGrade: verificationGrade,
      published: published,
      email: String(item && item.email || item.ownerEmail || '').trim(),
      ownerEmail: String(item && item.ownerEmail || '').trim(),
      ownerId: String(item && item.ownerId || '').trim(),
      discord: String(item && item.discord || '').trim(),
      docLink: String(item && item.docLink || '').trim(),
      totalShares: parseNumber(item && item.totalShares),
      availableShares: parseNumber(item && item.availableShares),
      isMarketOpen: item && Object.prototype.hasOwnProperty.call(item, 'isMarketOpen') ? item.isMarketOpen !== false : true
    };
  }

  function isMeaningfulRow(row) {
    return !!(row && row.ticker && (row.name || row.description || row.doxstox != null || row.askingPrice != null || row.sharePrice != null));
  }

  function decodeFirestoreValue(value) {
    if (!value || typeof value !== 'object') return null;
    if (Object.prototype.hasOwnProperty.call(value, 'stringValue')) return value.stringValue;
    if (Object.prototype.hasOwnProperty.call(value, 'integerValue')) return Number(value.integerValue);
    if (Object.prototype.hasOwnProperty.call(value, 'doubleValue')) return Number(value.doubleValue);
    if (Object.prototype.hasOwnProperty.call(value, 'booleanValue')) return !!value.booleanValue;
    if (Object.prototype.hasOwnProperty.call(value, 'nullValue')) return null;
    if (Object.prototype.hasOwnProperty.call(value, 'arrayValue')) {
      var arr = value.arrayValue && value.arrayValue.values ? value.arrayValue.values : [];
      return arr.map(decodeFirestoreValue);
    }
    if (Object.prototype.hasOwnProperty.call(value, 'mapValue')) {
      return decodeFirestoreMap(value.mapValue.fields || {});
    }
    if (Object.prototype.hasOwnProperty.call(value, 'timestampValue')) return value.timestampValue;
    return null;
  }

  function decodeFirestoreMap(fields) {
    var out = {};
    Object.keys(fields || {}).forEach(function (key) {
      out[key] = decodeFirestoreValue(fields[key]);
    });
    return out;
  }

  function loadFirestoreListings() {
    var cfg = window.DTO_CONFIG || {};
    var firebase = cfg.firebase || {};
    var listingsCfg = cfg.listings || {};
    if (listingsCfg.provider !== 'firestore' || !firebase.projectId || !firebase.apiKey) {
      return Promise.reject(new Error('No Firestore listings config found.'));
    }

    var collectionName = listingsCfg.collection || 'docs';
    var url = 'https://firestore.googleapis.com/v1/projects/' + encodeURIComponent(firebase.projectId) +
      '/databases/(default)/documents/' + encodeURIComponent(collectionName) + '?key=' + encodeURIComponent(firebase.apiKey);

    return fetch(url, { cache: 'no-store' })
      .then(function (res) {
        if (!res.ok) throw new Error('Could not load Firestore market docs');
        return res.json();
      })
      .then(function (payload) {
        var docs = Array.isArray(payload.documents) ? payload.documents : [];
        return docs.map(function (entry) {
          var item = decodeFirestoreMap(entry.fields || {});
          if (!item.ticker) {
            var name = String(entry.name || '');
            item.ticker = name.slice(name.lastIndexOf('/') + 1);
          }
          return normalizeItem(item);
        }).filter(function (row) {
          return row.published !== false && isMeaningfulRow(row);
        });
      });
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

  return function () {
    if (!cachedPromise) {
      cachedPromise = loadFirestoreListings()
        .then(function (rows) {
          window.DTO.listingsSource = 'firestore';
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
            ? Number(r.sharePrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' DTC / share'
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
          '<td>' + window.DTO.statusBadge(r.status) + '</td>' +
          '<td><a class="btn btn-ghost" style="padding:7px 14px;font-size:.83rem" href="' + window.DTO.listingHref(r) + '">Inquire</a></td>' +
          '</tr>';
      }).join('');
    }

    var c = document.getElementById('listingCount');
    if (c) {
      var source = window.DTO.listingsSource === 'firestore'
        ? ' · live Firestore'
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
      : (row.sharePrice != null ? Number(row.sharePrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' DTC / share' : 'Not yet set');
    var scoreValue = row.doxstox != null ? Number(row.doxstox).toLocaleString() : 'Pending';
    var statusValue = window.DTO.normalizeStatus(row.status, row.verified);

    document.title = row.name + ' — DTO Listing';
    if (titleEl) titleEl.textContent = row.name;
    if (leadEl) {
      leadEl.textContent = row.description || 'View the latest public details for this DTO listing.';
    }

    var emailHref = window.DTO.isEmail(row.email) ? 'mailto:' + row.email : '';
    var discordHref = window.DTO.bestExternalHref(row.discord);
    var docHref = window.DTO.bestExternalHref(row.docLink);

    var overviewHtml =
      '<div class="grid g2">' +
        '<div class="card">' +
          '<h3>Description</h3>' +
          '<p>' + window.DTO.escapeHtml(row.description || 'No description provided yet.') + '</p>' +
          (docHref ? '<p class="mt-24"><a class="btn btn-ghost" href="' + window.DTO.escapeAttr(docHref) + '" target="_blank" rel="noopener">Open doc link</a></p>' : '') +
        '</div>' +
        '<div class="card">' +
          '<h3>Listing details</h3>' +
          '<div class="rev-row"><span>Type</span><b>' + badge(row.type) + '</b></div>' +
          '<div class="rev-row"><span>DoxStox</span><b>' + window.DTO.escapeHtml(scoreValue) + '</b></div>' +
          '<div class="rev-row"><span>' + priceLabel + '</span><b>' + window.DTO.escapeHtml(priceValue) + '</b></div>' +
          '<div class="rev-row"><span>Status</span><b>' + window.DTO.statusBadge(statusValue) + '</b></div>' +
        '</div>' +
      '</div>' +
      '<div class="grid g3 mt-24">' +
        contactCard('Email', row.email, emailHref) +
        contactCard('Discord', row.discord, discordHref) +
        contactCard('Doc link', row.docLink, docHref) +
      '</div>';

    var valueSnapshotHtml =
      '<div class="grid g2">' +
        '<div class="card tier-card"><div class="tier-head"><h3>Utility</h3><span class="tip" title="' + window.DTO.escapeAttr(window.DTO.tooltipText.utility) + '">?</span></div><p class="tier-score">' + (row.utility != null ? row.utility + ' / 10' : 'Pending') + '</p><p>Measures what users can actually do with the doc.</p></div>' +
        '<div class="card tier-card"><div class="tier-head"><h3>Aesthetics</h3><span class="tip" title="' + window.DTO.escapeAttr(window.DTO.tooltipText.aesthetics) + '">?</span></div><p class="tier-score">' + (row.aesthetics != null ? row.aesthetics + ' / 10' : 'Pending') + '</p><p>Measures doc craftsmanship, organization and visual polish.</p></div>' +
        '<div class="card tier-card"><div class="tier-head"><h3>Integration</h3><span class="tip" title="' + window.DTO.escapeAttr(window.DTO.tooltipText.integration) + '">?</span></div><p class="tier-score">' + (row.integration != null ? row.integration + ' / 10' : 'Pending') + '</p><p>Measures depth of structural ecosystem connections.</p></div>' +
        '<div class="card tier-card"><div class="tier-head"><h3>Verification</h3><span class="tip" title="' + window.DTO.escapeAttr(window.DTO.tooltipText.verification) + '">?</span></div><p class="tier-score">' + (row.verificationGrade != null ? row.verificationGrade + ' / 5' : 'Pending') + '</p><p>Measures staff-vetted trust, reliability and reputation.</p></div>' +
      '</div>' +
      '<div class="card mt-24">' +
        '<h3>Value Snapshot</h3>' +
        '<div class="rev-row"><span>Formula</span><b>DS = (250×U) + (150×A) + (100×I) + (100×V)</b></div>' +
        '<div class="rev-row"><span>Market cap</span><b>' + window.DTO.escapeHtml(scoreValue) + ' DTC</b></div>' +
        '<div class="rev-row"><span>Share price engine</span><b>' + (row.type === 'stock' && row.doxstox != null ? Number(row.doxstox / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' DTC/share' : window.DTO.escapeHtml(priceValue)) + '</b></div>' +
      '</div>';

    mount.innerHTML =
      '<div class="tab-row" role="tablist" aria-label="Listing details tabs">' +
        '<button type="button" class="tab-btn active" data-tab-target="overviewTab">Overview</button>' +
        '<button type="button" class="tab-btn" data-tab-target="snapshotTab">Value Snapshot</button>' +
      '</div>' +
      '<div id="overviewTab" class="tab-panel active">' + overviewHtml + '</div>' +
      '<div id="snapshotTab" class="tab-panel">' + valueSnapshotHtml + '</div>' +
      '<p class="mt-24"><a class="btn btn-gold" href="apply.html#request">Ask DTO about this listing</a> ' +
      '<a class="btn btn-ghost" href="listings.html">Back to listings</a></p>';

    mount.querySelectorAll('.tab-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = btn.getAttribute('data-tab-target');
        mount.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
        mount.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.remove('active'); });
        btn.classList.add('active');
        var panel = mount.querySelector('#' + target);
        if (panel) panel.classList.add('active');
      });
    });
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
