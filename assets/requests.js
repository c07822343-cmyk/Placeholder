/* ============================================================
   DTO — On-site request system
   Multi-step application wizard that submits to the configured
   backend/provider (alwaysdata Airtable API or Netlify Forms).
   ============================================================ */
(function () {
  'use strict';

  var form = document.getElementById('dtoRequest');
  if (!form) return;

  var CFG = window.DTO_CONFIG || { options: {}, emails: [], submissions: {} };
  var OPT = CFG.options || {};
  var SUBMIT = CFG.submissions || {};
  var FEE = OPT.feeRate || 0.07;
  var FORM_NAME = SUBMIT.formName || 'dto-request';
  var BOT_FIELD = SUBMIT.botField || 'bot-field';

  var steps = Array.prototype.slice.call(form.querySelectorAll('.step'));
  var current = 0;
  var ticket = makeTicket();

  /* ---------------- helpers ---------------- */

  function makeTicket() {
    var chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    var s = '';
    for (var i = 0; i < 6; i++) s += chars.charAt(Math.floor(Math.random() * chars.length));
    return (OPT.ticketPrefix || 'DTO') + '-' + s;
  }

  function val(name) {
    var el = form.querySelector('[name="' + name + '"]');
    if (!el) return '';
    if (el.type === 'radio') {
      var c = form.querySelector('[name="' + name + '"]:checked');
      return c ? c.value : '';
    }
    return (el.value || '').trim();
  }

  function requestType() {
    var c = form.querySelector('[name="request_type"]:checked');
    return c ? c.value : '';
  }

  function isSeller() {
    var t = requestType();
    return t === 'Stock Listing' || t === 'Full Buyout' || t === 'Valuation Only';
  }

  function showBanner(html) {
    var banner = document.getElementById('setupBanner');
    if (!banner) return;
    banner.innerHTML = html;
    banner.hidden = !html;
  }

  function clearBanner() {
    var banner = document.getElementById('setupBanner');
    if (!banner) return;
    banner.hidden = true;
    banner.innerHTML = '';
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function onLocalPreview() {
    return /^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/i.test(location.hostname);
  }

  /* ---------------- step navigation ---------------- */

  function relevantSteps() {
    return steps.filter(function (s) {
      var only = s.getAttribute('data-only');
      if (!only) return true;
      if (only === 'seller') return isSeller();
      if (only === 'buyout') return requestType() === 'Full Buyout';
      return true;
    });
  }

  function show(index) {
    var list = relevantSteps();
    if (index < 0) index = 0;
    if (index > list.length - 1) index = list.length - 1;
    current = index;

    steps.forEach(function (s) { s.hidden = true; });
    list[current].hidden = false;

    var pct = Math.round((current / (list.length - 1)) * 100);
    var bar = document.getElementById('reqProgressBar');
    if (bar) bar.style.width = pct + '%';

    var dots = document.getElementById('reqDots');
    if (dots) {
      dots.innerHTML = list.map(function (s, i) {
        var cls = i === current ? 'dot active' : (i < current ? 'dot done' : 'dot');
        return '<span class="' + cls + '" title="' + (s.getAttribute('data-title') || '') + '"></span>';
      }).join('');
    }

    var label = document.getElementById('reqStepLabel');
    if (label) {
      label.textContent = 'Step ' + (current + 1) + ' of ' + list.length +
        ' · ' + (list[current].getAttribute('data-title') || '');
    }

    var back = document.getElementById('reqBack');
    var next = document.getElementById('reqNext');
    var send = document.getElementById('reqSubmit');
    if (back) back.style.visibility = current === 0 ? 'hidden' : 'visible';
    var last = current === list.length - 1;
    if (next) next.hidden = last;
    if (send) send.hidden = !last;

    if (last) buildReview();
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function validateStep() {
    var list = relevantSteps();
    var stepEl = list[current];
    var bad = null;

    stepEl.querySelectorAll('[data-required]').forEach(function (el) {
      if (el.offsetParent === null) return;
      var v = (el.value || '').trim();
      var ok = !!v;

      if (ok && el.type === 'email') ok = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
      if (ok && el.type === 'url') ok = /^https?:\/\//i.test(v);

      var wrap = el.closest('.field-wrap') || el.parentElement;
      var err = wrap.querySelector('.err');
      if (!ok) {
        el.classList.add('invalid');
        if (!err) {
          err = document.createElement('span');
          err.className = 'err';
          wrap.appendChild(err);
        }
        err.textContent = el.type === 'url'
          ? 'Please enter a full link starting with https://'
          : (el.type === 'email' ? 'Please enter a valid email address.' : 'This field is required.');
        if (!bad) bad = el;
      } else {
        el.classList.remove('invalid');
        if (err) err.remove();
      }
    });

    stepEl.querySelectorAll('[data-required-radio]').forEach(function (g) {
      var n = g.getAttribute('data-required-radio');
      if (!form.querySelector('[name="' + n + '"]:checked')) {
        if (!bad) bad = g;
        g.classList.add('invalid-group');
      } else {
        g.classList.remove('invalid-group');
      }
    });

    if (bad) {
      bad.focus && bad.focus();
      bad.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
    return true;
  }

  /* ---------------- price / fee preview ---------------- */

  function updateFee() {
    var p = parseFloat(val('asking_price')) || 0;
    var box = document.getElementById('reqFee');
    if (!box) return;
    if (!p) { box.innerHTML = ''; return; }
    var fee = p * FEE;
    box.innerHTML =
      '<div class="est-row"><span>Buyer pays</span><b>$' + p.toFixed(2) + '</b></div>' +
      '<div class="est-row"><span>DTO fee (' + (FEE * 100) + '%)</span><b>-$' + fee.toFixed(2) + '</b></div>' +
      '<div class="est-row total"><span>You receive</span><b>$' + (p - fee).toFixed(2) + '</b></div>';
  }

  /* ---------------- review screen ---------------- */

  function buildReview() {
    var rows = [];
    function add(label, v) { if (v) rows.push([label, v]); }

    add('Request type', requestType());
    add('Name / handle', val('name'));
    add('Email', val('email'));
    add('Other contact', val('contact_alt'));

    if (isSeller()) {
      add('Doc name', val('doc_name'));
      add('Doc link', val('doc_link'));
      add('Description', val('description'));
      if (requestType() === 'Full Buyout') add('Asking price', val('asking_price') ? '$' + val('asking_price') : '');
      add('Partnerships', val('partners'));
    }
    add('Notes', val('notes'));

    var el = document.getElementById('reqReview');
    if (el) {
      el.innerHTML = rows.map(function (r) {
        return '<div class="rev-row"><span>' + r[0] + '</span><b>' + escapeHtml(r[1]) + '</b></div>';
      }).join('');
    }
    var t = document.getElementById('reqTicket');
    if (t) t.textContent = ticket;
  }

  /* ---------------- submission ---------------- */

  function payloadValues() {
    var type = requestType();
    return {
      requestType: type,
      name: val('name'),
      email: val('email'),
      contactAlt: val('contact_alt') || 'None provided',
      docName: val('doc_name'),
      docLink: val('doc_link'),
      description: val('description'),
      askingPrice: type === 'Full Buyout' ? (val('asking_price') || '0') : 'N/A',
      partners: val('partners') || 'None provided',
      notes: val('notes') || 'None',
      ticket: ticket,
      submittedAt: new Date().toISOString()
    };
  }

  function requestSummary() {
    var values = payloadValues();
    return [
      'DTO REQUEST — ' + values.ticket,
      '=========================================',
      'Request type : ' + values.requestType,
      'Name/handle  : ' + values.name,
      'Email        : ' + values.email,
      'Other contact: ' + values.contactAlt,
      '',
      'Doc name     : ' + values.docName,
      'Doc link     : ' + values.docLink,
      '',
      'Description:',
      values.description,
      '',
      'Asking price : ' + values.askingPrice,
      '',
      'Partnerships:',
      values.partners,
      '',
      'Notes:',
      values.notes
    ].join('\n');
  }

  function buildNetlifyBody() {
    var params = new URLSearchParams();
    var values = payloadValues();
    params.append('form-name', FORM_NAME);
    params.append(BOT_FIELD, '');
    Object.keys(values).forEach(function (key) {
      params.append(key, String(values[key]));
    });
    params.append('requestSummary', requestSummary());
    return params.toString();
  }

  function buildApiBody() {
    var values = payloadValues();
    values.requestSummary = requestSummary();
    return JSON.stringify(values);
  }

  function submitToProvider() {
    if (SUBMIT.provider === 'alwaysdata-airtable') {
      return fetch(SUBMIT.endpoint || '/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: buildApiBody()
      }).then(function (res) {
        if (!res.ok) throw new Error('Request API failed');
        return res.json();
      });
    }

    return fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: buildNetlifyBody()
    }).then(function (res) {
      if (!res.ok) throw new Error('Netlify form request failed');
      if (onLocalPreview() && !res.headers.get('x-nf-request-id')) {
        throw new Error('Netlify Forms is not active on local preview');
      }
      return res;
    });
  }

  function showPending() {
    var wrap = document.getElementById('reqWrap');
    var done = document.getElementById('reqDone');
    var msg = document.getElementById('doneMsg');
    var tk = document.getElementById('doneTicket');
    var actions = document.getElementById('doneActions');
    if (wrap) wrap.hidden = true;
    if (!done) return;
    done.hidden = false;
    if (tk) tk.textContent = ticket;
    if (msg) msg.innerHTML = 'Submitting your request to DTO… please wait a moment.';
    if (actions) actions.hidden = true;
    done.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function restoreForm() {
    var wrap = document.getElementById('reqWrap');
    var done = document.getElementById('reqDone');
    var actions = document.getElementById('doneActions');
    if (wrap) wrap.hidden = false;
    if (done) done.hidden = true;
    if (actions) actions.hidden = false;
  }

  function succeed() {
    var wrap = document.getElementById('reqWrap');
    var done = document.getElementById('reqDone');
    var actions = document.getElementById('doneActions');
    if (wrap) wrap.hidden = true;
    if (!done) return;
    done.hidden = false;
    if (actions) actions.hidden = false;
    var tk = document.getElementById('doneTicket');
    if (tk) tk.textContent = ticket;
    var msg = document.getElementById('doneMsg');
    if (msg) {
      msg.innerHTML = 'Your request was submitted to DTO\'s review queue. Staff will get back to you within <strong>' +
        (OPT.responseTime || '24–48 hours') + '</strong>.';
    }
    done.scrollIntoView({ behavior: 'smooth', block: 'center' });

    var copy = document.getElementById('doneCopy');
    if (copy) {
      copy.onclick = function (ev) {
        ev.preventDefault();
        navigator.clipboard.writeText(requestSummary()).then(function () {
          copy.textContent = 'Copied ✓';
          setTimeout(function () { copy.textContent = 'Copy request details'; }, 2000);
        });
      };
    }
  }

  function submit() {
    if (!validateStep()) return;
    clearBanner();

    var btn = document.getElementById('reqSubmit');
    if ('onLine' in navigator && !navigator.onLine) {
      showBanner('<strong>You appear to be offline.</strong> Reconnect to the internet and try submitting again.');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Sending…';
    showPending();

    submitToNetlify()
      .then(function () { succeed(); })
      .catch(function () {
        restoreForm();
        showBanner('<strong>Could not send the request.</strong> This form works only on the deployed Netlify site. If you already deployed there, try refreshing and submitting again.');
      })
      .finally(function () {
        btn.disabled = false;
        btn.textContent = 'Submit request';
      });
  }

  /* ---------------- wire up ---------------- */

  var nextBtn = document.getElementById('reqNext');
  var backBtn = document.getElementById('reqBack');
  var sendBtn = document.getElementById('reqSubmit');

  if (nextBtn) nextBtn.addEventListener('click', function (e) {
    e.preventDefault();
    if (validateStep()) show(current + 1);
  });
  if (backBtn) backBtn.addEventListener('click', function (e) {
    e.preventDefault();
    show(current - 1);
  });
  if (sendBtn) sendBtn.addEventListener('click', function (e) {
    e.preventDefault();
    submit();
  });

  form.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      if (validateStep()) {
        var list = relevantSteps();
        if (current === list.length - 1) submit(); else show(current + 1);
      }
    }
  });

  form.querySelectorAll('[name="request_type"]').forEach(function (r) {
    r.addEventListener('change', function () {
      form.querySelectorAll('.type-card').forEach(function (c) { c.classList.remove('selected'); });
      r.closest('.type-card').classList.add('selected');
      var pw = document.getElementById('priceWrap');
      if (pw) pw.hidden = requestType() !== 'Full Buyout';
    });
    if (r.checked) r.dispatchEvent(new Event('change'));
  });

  var ap = form.querySelector('[name="asking_price"]');
  if (ap) ap.addEventListener('input', updateFee);

  form.addEventListener('input', function (e) {
    if (e.target.classList && e.target.classList.contains('invalid')) {
      e.target.classList.remove('invalid');
      var w = e.target.closest('.field-wrap');
      var er = w && w.querySelector('.err');
      if (er) er.remove();
    }
  });

  if (SUBMIT.provider === 'alwaysdata-airtable') {
    if (onLocalPreview()) {
      showBanner('<strong>Preview mode:</strong> submissions are configured for the alwaysdata API. Run the Flask app to test live request intake.');
    } else {
      showBanner('<strong>Connected:</strong> this request form is configured to send requests into the Airtable review workspace via the alwaysdata backend.');
    }
  } else if (onLocalPreview()) {
    showBanner('<strong>Preview mode:</strong> submissions are configured for Netlify Forms and will work once this site is deployed on Netlify.');
  } else {
    showBanner('<strong>Connected:</strong> this request form is configured for Netlify Forms.');
  }

  updateFee();
  show(0);
})();
