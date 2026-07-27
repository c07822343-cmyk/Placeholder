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
    return t === 'Stock Listing' || t === 'Full Buyout' || t === 'Valuation Only';
  }

  /* ---------------- step navigation ---------------- */

  function relevantSteps() {
    // Step visibility depends on the chosen request type
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

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------------- submission ---------------- */

  function payloadValues() {
    var type = requestType();
    return {
      requestType: type,
      name: val('name'),
      email: val('email'),
      contactAlt: val('contact_alt') || '—',
      docName: val('doc_name'),
      docLink: val('doc_link'),
      description: val('description'),
      partners: val('partners') || 'None provided',
      askingPrice: type === 'Full Buyout' ? (val('asking_price') || '0') : 'N/A',
      notes: val('notes') || 'None',
      ticket: ticket
    };
  }

  function payloadPairs() {
    var e = CFG.entries || {};
    var values = payloadValues();
    var pairs = [];
    Object.keys(values).forEach(function (key) {
      if (e[key]) pairs.push([e[key], String(values[key])]);
    });
    return pairs;
  }

  function requestSummary() {
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
        'Background for DTO staff valuation:',
        '',
        'Partnerships:',
        '  ' + (val('partners') || '—'),
        ''
      );
    }
    lines.push('Notes:', val('notes') || 'none');
    return lines.join('\n');
  }

  function buildExtraPairs(mode, fbzx) {
    if (mode === 'partial') {
      return [
        ['fvv', '1'],
        ['pageHistory', '0'],
        ['partialResponse', '[null,null,"' + fbzx + '"]'],
        ['fbzx', fbzx]
      ];
    }
    if (mode === 'draft') {
      return [
        ['fvv', '1'],
        ['pageHistory', '0'],
        ['draftResponse', '[]'],
        ['fbzx', fbzx]
      ];
    }
    return [
      ['usp', 'pp_url'],
      ['submit', 'Submit'],
      ['fbzx', fbzx]
    ];
  }

  function attemptFormPost(mode) {
    return new Promise(function (resolve, reject) {
      try {
        var fbzx = String(Date.now()) + String(Math.floor(Math.random() * 100000));
        var url = 'https://docs.google.com/forms/d/e/' + CFG.formId + '/formResponse?usp=pp_url';
        var targetName = 'dtoFormTarget_' + mode + '_' + fbzx;
        var iframe = document.createElement('iframe');
        iframe.name = targetName;
        iframe.title = 'Hidden Google Forms target';
        iframe.hidden = true;

        var tempForm = document.createElement('form');
        tempForm.method = 'POST';
        tempForm.action = url;
        tempForm.target = targetName;
        tempForm.enctype = 'application/x-www-form-urlencoded';
        tempForm.acceptCharset = 'UTF-8';
        tempForm.style.display = 'none';

        payloadPairs().concat(buildExtraPairs(mode, fbzx)).forEach(function (pair) {
          var input = document.createElement('input');
          input.type = 'hidden';
          input.name = pair[0];
          input.value = pair[1];
          tempForm.appendChild(input);
        });

        var submitted = false;
        var settled = false;
        var timeout = setTimeout(function () {
          if (settled) return;
          settled = true;
          cleanup();
          reject(new Error('Timed out waiting for Google Forms (' + mode + ')'));
        }, 8000);

        function cleanup() {
          clearTimeout(timeout);
          setTimeout(function () {
            tempForm.remove();
            iframe.remove();
          }, 50);
        }

        iframe.addEventListener('load', function () {
          if (!submitted || settled) return;
          settled = true;
          cleanup();
          resolve(mode);
        });

        document.body.appendChild(iframe);
        document.body.appendChild(tempForm);

        setTimeout(function () {
          submitted = true;
          tempForm.submit();
        }, 50);
      } catch (err) {
        reject(err);
      }
    });
  }

  function buildGetUrl() {
    var fbzx = String(Date.now()) + String(Math.floor(Math.random() * 100000));
    var params = new URLSearchParams();
    payloadPairs().forEach(function (pair) {
      params.append(pair[0], pair[1]);
    });
    buildExtraPairs('get', fbzx).forEach(function (pair) {
      params.append(pair[0], pair[1]);
    });
    return 'https://docs.google.com/forms/d/e/' + CFG.formId + '/formResponse?' + params.toString();
  }

  function attemptGetRequest() {
    return new Promise(function (resolve, reject) {
      try {
        var iframe = document.createElement('iframe');
        iframe.title = 'Hidden Google Forms target';
        iframe.hidden = true;
        var url = buildGetUrl();
        var settled = false;
        var timeout = setTimeout(function () {
          if (settled) return;
          settled = true;
          cleanup();
          reject(new Error('Timed out waiting for Google Forms (get)'));
        }, 8000);

        function cleanup() {
          clearTimeout(timeout);
          setTimeout(function () { iframe.remove(); }, 50);
        }

        iframe.addEventListener('load', function () {
          if (settled) return;
          settled = true;
          cleanup();
          resolve('get');
        });

        document.body.appendChild(iframe);
        iframe.src = url;
      } catch (err) {
        reject(err);
      }
    });
  }

  function attemptPopupGet() {
    return new Promise(function (resolve, reject) {
      try {
        var url = buildGetUrl();
        var popup = window.open(url, 'dtoFormSubmitWindow', 'popup,width=560,height=720');
        if (!popup) {
          reject(new Error('Popup blocked'));
          return;
        }
        setTimeout(function () {
          try { popup.close(); } catch (e) {}
          resolve('popup');
        }, 1500);
      } catch (err) {
        reject(err);
      }
    });
  }

  function hardRedirectSubmit() {
    window.location.href = buildGetUrl();
  }

  function postToGoogleForm() {
    return attemptPopupGet()
      .catch(function () { return attemptFormPost('partial'); })
      .catch(function () { return attemptFormPost('draft'); })
      .catch(function () { return attemptGetRequest(); });
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
    if (msg) {
      msg.innerHTML = 'Submitting your request to DTO… please wait a moment.';
    }
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
      msg.innerHTML = 'Your request was sent straight to DTO\'s Google Form and added to the review queue. Staff will get back to you within <strong>' +
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

    if (!isConfigured()) {
      showBanner('<strong>Google Form not connected.</strong> Add the live form ID and entry IDs in <code>assets/config.js</code> before accepting requests.');
      return;
    }

    if ('onLine' in navigator && !navigator.onLine) {
      showBanner('<strong>You appear to be offline.</strong> Reconnect to the internet and try submitting again.');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Sending…';
    showPending();

    postToGoogleForm()
      .then(function () { succeed(); })
      .catch(function () {
        hardRedirectSubmit();
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
    });
    if (r.checked) r.dispatchEvent(new Event('change'));
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

  if (isConfigured()) {
    showBanner('<strong>Connected:</strong> requests on this page go straight into DTO\'s Google Form and linked Google Sheet.');
  } else {
    showBanner('<strong>Google Form not connected yet.</strong> This page needs a live form ID and entry IDs in <code>assets/config.js</code>.');
  }

  updateFee();
  show(0);
})();
