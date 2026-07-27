/* ============================================================
   DTO — On-site request system
   Multi-step application wizard that submits into a Google Form.
   ============================================================ */
(function () {
  'use strict';

  var form = document.getElementById('dtoRequest');
  if (!form) return;

  var CFG = window.DTO_CONFIG || { entries: {}, options: {}, emails: [] };
  var OPT = CFG.options || {};
  var FEE = OPT.feeRate || 0.07;

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
    return t === 'Stock Listing' || t === 'Full Buyout';
  }

  /* ---------------- step navigation ---------------- */

  function relevantSteps() {
    // Step visibility depends on the chosen request type
    return steps.filter(function (s) {
      var only = s.getAttribute('data-only');
      if (!only) return true;
      if (only === 'seller') return isSeller();
      if (only === 'buyer') return requestType() === 'Verified Buyer';
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

    // progress
    var pct = Math.round(((current) / (list.length - 1)) * 100);
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
      if (el.offsetParent === null) return;      // hidden field
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

    // radio groups
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

  /* ---------------- live DoxStox ---------------- */

  function doxstox() {
    var I = +val('influence') || 0,
        P = +val('partners') || 0,
        R = +val('reputation') || 0,
        G = +val('growth') || 0;
    return 200 * I + 100 * P + 150 * R + 75 * G;
  }

  function updateEstimate() {
    var ds = doxstox();
    var sp = ds / 100;
    var box = document.getElementById('reqEstimate');
    if (!box) return;
    box.innerHTML =
      '<div class="est-row"><span>Estimated DoxStox score</span><b>' + ds.toLocaleString() + '</b></div>' +
      '<div class="est-row"><span>Indicative share price</span><b>' + sp.toFixed(2) + ' DTC</b></div>' +
      '<div class="est-note">Unofficial preview using DS = 200I + 100P + 150R + 75G. ' +
      'DTO staff set the final verified score.</div>';
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
      add('Influence', val('influence') + ' / 10');
      add('Partners', val('partners'));
      add('Reputation', val('reputation') + ' / 10');
      add('Growth', val('growth') + ' / 10');
      add('Estimated DoxStox', doxstox().toLocaleString());
    } else {
      add('Budget', val('budget') ? '$' + val('budget') : '');
      add('Interests', val('description'));
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

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------------- submission ---------------- */

  function payload() {
    var e = CFG.entries || {};
    var fd = new FormData();
    function put(key, v) {
      if (e[key] && v !== '' && v != null) fd.append(e[key], v);
    }
    put('requestType', requestType());
    put('name', val('name'));
    put('email', val('email'));
    put('contactAlt', val('contact_alt'));
    put('docName', val('doc_name'));
    put('docLink', val('doc_link'));
    put('description', val('description'));
    put('askingPrice', val('asking_price'));
    put('budget', val('budget'));
    put('influence', val('influence'));
    put('partners', val('partners'));
    put('reputation', val('reputation'));
    put('growth', val('growth'));
    put('doxstox', isSeller() ? doxstox() : '');
    put('notes', val('notes'));
    put('ticket', ticket);
    return fd;
  }

  function emailBody() {
    var lines = [
      'DTO REQUEST — ' + ticket,
      '=========================================',
      'Request type : ' + requestType(),
      'Name/handle  : ' + val('name'),
      'Email        : ' + val('email'),
      'Other contact: ' + (val('contact_alt') || '—'),
      ''
    ];
    if (isSeller()) {
      lines.push(
        'Doc name     : ' + val('doc_name'),
        'Doc link     : ' + val('doc_link'),
        '',
        'Description:',
        val('description'),
        ''
      );
      if (requestType() === 'Full Buyout') {
        var p = parseFloat(val('asking_price')) || 0;
        lines.push(
          'Asking price : $' + p.toFixed(2),
          'DTO fee (' + (FEE * 100) + '%): $' + (p * FEE).toFixed(2),
          'Seller nets  : $' + (p - p * FEE).toFixed(2),
          ''
        );
      }
      lines.push(
        'Self-reported stats (DTO staff verify):',
        '  Influence  : ' + val('influence') + ' / 10',
        '  Partners   : ' + val('partners'),
        '  Reputation : ' + val('reputation') + ' / 10',
        '  Growth     : ' + val('growth') + ' / 10',
        '  Est. DoxStox: ' + doxstox().toLocaleString(),
        ''
      );
    } else {
      lines.push(
        'Budget       : $' + (val('budget') || '—'),
        '',
        'Interests / what they want to buy:',
        val('description'),
        ''
      );
    }
    lines.push('Notes:', val('notes') || 'none');
    return lines.join('\n');
  }

  function mailtoLink() {
    var list = (CFG.emails || []).map(function (e) { return e.address; });
    var to = list[0] || '';
    var cc = list.slice(1).join(',');
    return 'mailto:' + to +
      (cc ? '?cc=' + cc + '&' : '?') +
      'subject=' + encodeURIComponent('DTO Request ' + ticket + ' — ' + requestType()) +
      '&body=' + encodeURIComponent(emailBody());
  }

  function openMail() {
    // An anchor click is more reliable than assigning location.href:
    // it won't trigger an unload of the page in any browser.
    var a = document.createElement('a');
    a.href = mailtoLink();
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { a.remove(); }, 0);
  }

  function succeed(viaEmail) {
    var wrap = document.getElementById('reqWrap');
    var done = document.getElementById('reqDone');
    if (wrap) wrap.hidden = true;
    if (!done) return;
    done.hidden = false;
    var tk = document.getElementById('doneTicket');
    if (tk) tk.textContent = ticket;
    var msg = document.getElementById('doneMsg');
    if (msg && viaEmail) {
      msg.innerHTML = 'Your email app should have opened with the request ready to send. ' +
        '<strong>Press send in your mail app to finish.</strong> If nothing opened, use the copy button below.';
    }
    var rt = document.getElementById('doneTime');
    if (rt) rt.textContent = OPT.responseTime || '24–48 hours';
    done.scrollIntoView({ behavior: 'smooth', block: 'center' });

    var copy = document.getElementById('doneCopy');
    if (copy) {
      copy.onclick = function (ev) {
        ev.preventDefault();
        navigator.clipboard.writeText(emailBody()).then(function () {
          copy.textContent = 'Copied ✓';
          setTimeout(function () { copy.textContent = 'Copy request details'; }, 2000);
        });
      };
    }
    var mail = document.getElementById('doneMail');
    if (mail) mail.href = mailtoLink();
  }

  function submit() {
    if (!validateStep()) return;

    var btn = document.getElementById('reqSubmit');
    var configured = CFG.formId && CFG.entries && CFG.entries.requestType;

    if (!configured) {
      // Fallback: prefilled email to DTO staff
      openMail();
      succeed(true);
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Sending…';

    var url = 'https://docs.google.com/forms/d/e/' + CFG.formId + '/formResponse';

    fetch(url, { method: 'POST', mode: 'no-cors', body: payload() })
      .then(function () { succeed(false); })
      .catch(function () {
        // no-cors normally resolves opaque; reaching here means offline/blocked
        openMail();
        succeed(true);
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

  // Request-type cards
  form.querySelectorAll('[name="request_type"]').forEach(function (r) {
    r.addEventListener('change', function () {
      form.querySelectorAll('.type-card').forEach(function (c) { c.classList.remove('selected'); });
      r.closest('.type-card').classList.add('selected');
      // reveal / hide buyout-only price
      var pw = document.getElementById('priceWrap');
      if (pw) pw.hidden = requestType() !== 'Full Buyout';
      var sellerCopy = document.querySelectorAll('[data-seller-copy]');
      sellerCopy.forEach(function (el) { el.hidden = !isSeller(); });
      var buyerCopy = document.querySelectorAll('[data-buyer-copy]');
      buyerCopy.forEach(function (el) { el.hidden = isSeller(); });
    });
    if (r.checked) r.dispatchEvent(new Event('change'));
  });

  // live previews
  ['influence', 'partners', 'reputation', 'growth'].forEach(function (n) {
    var el = form.querySelector('[name="' + n + '"]');
    if (el) el.addEventListener('input', function () {
      var out = form.querySelector('[data-out="' + n + '"]');
      if (out) out.textContent = el.value;
      updateEstimate();
    });
  });
  var ap = form.querySelector('[name="asking_price"]');
  if (ap) ap.addEventListener('input', updateFee);

  // clear errors as the user types
  form.addEventListener('input', function (e) {
    if (e.target.classList && e.target.classList.contains('invalid')) {
      e.target.classList.remove('invalid');
      var w = e.target.closest('.field-wrap');
      var er = w && w.querySelector('.err');
      if (er) er.remove();
    }
  });

  updateEstimate();
  updateFee();
  show(0);
})();
