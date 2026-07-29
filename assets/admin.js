import {
  firebaseConfigured,
  firebaseIssueMessage,
  onSessionChange,
  subscribeAllUsers,
  subscribePendingTransactions,
  subscribeDocs,
  isAdmin,
  getUserProfile,
  getUserByEmail
} from './db.js';
import {
  setVerifiedBuyer,
  setBlacklisted,
  adjustUserBalance,
  approvePendingTransaction,
  rejectPendingTransaction,
  saveDocProfile,
  syncDocProfileFromSheet
} from './trading.js';

const noticeEl = document.getElementById('adminNotice');
const gateEl = document.getElementById('adminAuthGate');
const createDocForm = document.getElementById('createDocForm');
const userRows = document.getElementById('adminUserRows');
const txRows = document.getElementById('adminTransactionRows');
const docRows = document.getElementById('adminDocsRows');

let currentUser = null;
let userCache = [];
let txCache = [];
let docsCache = [];
let unsubUsers = null;
let unsubTx = null;
let unsubDocs = null;

function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function showNotice(html, type) {
  if (!noticeEl) return;
  noticeEl.innerHTML = html;
  noticeEl.hidden = !html;
  noticeEl.classList.toggle('warn', type === 'warn');
}

function showGate(html) {
  if (!gateEl) return;
  gateEl.hidden = !html;
  gateEl.innerHTML = html || '';
}

function clearSubscriptions() {
  if (unsubUsers) unsubUsers();
  if (unsubTx) unsubTx();
  if (unsubDocs) unsubDocs();
  unsubUsers = null;
  unsubTx = null;
  unsubDocs = null;
}

function normalizeHeader(s) {
  return String(s || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function loadSheetRows() {
  return new Promise(function (resolve, reject) {
    const cfg = (window.DTO_CONFIG || {}).listings || {};
    const headers = cfg.headers || {};
    if (!cfg.sheetId) {
      reject(new Error('Google Sheet ID is missing from assets/config.js.'));
      return;
    }

    const expected = {
      ticker: normalizeHeader(headers.ticker || 'Ticker'),
      name: normalizeHeader(headers.name || 'Doc Name'),
      description: normalizeHeader(headers.description || 'Description'),
      type: normalizeHeader(headers.type || 'Type'),
      utility: normalizeHeader(headers.utility || 'Utility'),
      aesthetics: normalizeHeader(headers.aesthetics || 'Aesthetics'),
      integration: normalizeHeader(headers.integration || 'Integration'),
      verificationGrade: normalizeHeader(headers.verificationGrade || 'Verification Grade'),
      totalShares: normalizeHeader(headers.totalShares || 'Total Shares'),
      ownerEmail: normalizeHeader(headers.ownerEmail || 'Owner Email'),
      published: normalizeHeader(headers.published || 'Published'),
      email: normalizeHeader(headers.email || 'Email'),
      discord: normalizeHeader(headers.discord || 'Discord'),
      docLink: normalizeHeader(headers.docLink || 'Doc Link'),
      status: normalizeHeader(headers.status || 'Status')
    };

    const cbName = '__dtoAdminSheetSync_' + Date.now();
    const script = document.createElement('script');
    const timeout = setTimeout(function () {
      cleanup();
      reject(new Error('Timed out loading the Google Sheet.'));
    }, 10000);

    function cleanup() {
      clearTimeout(timeout);
      try { delete window[cbName]; } catch (e) { window[cbName] = undefined; }
      if (script.parentNode) script.parentNode.removeChild(script);
    }

    function parseRows(table) {
      const rows = (table.rows || []).map(function (row) {
        return (row.c || []).map(function (cell) {
          return cell && cell.v != null ? String(cell.v) : '';
        });
      });
      const labels = (table.cols || []).map(function (col) {
        return normalizeHeader((col && (col.label || col.id)) || '');
      });
      let headerRow = labels;
      let startIndex = 0;
      if (headerRow.indexOf(expected.ticker) === -1) {
        const headerIndex = rows.findIndex(function (row) {
          return row.map(normalizeHeader).indexOf(expected.ticker) !== -1;
        });
        if (headerIndex === -1) return [];
        headerRow = rows[headerIndex].map(normalizeHeader);
        startIndex = headerIndex + 1;
      }

      const col = {};
      Object.keys(expected).forEach(function (key) {
        col[key] = headerRow.indexOf(expected[key]);
      });

      const seen = new Map();
      rows.slice(startIndex).forEach(function (row) {
        function at(key) {
          const idx = col[key];
          return idx >= 0 ? String(row[idx] || '').trim() : '';
        }
        const ticker = at('ticker').toUpperCase();
        const published = String(at('published')).trim().toLowerCase();
        if (!ticker) return;
        if (!(published === 'true' || published === 'yes' || published === 'y' || published === '1')) return;
        seen.set(ticker, {
          ticker: ticker,
          title: at('name'),
          description: at('description'),
          type: at('type') || 'stock',
          utility: at('utility'),
          aesthetics: at('aesthetics'),
          integration: at('integration'),
          verificationGrade: at('verificationGrade'),
          totalShares: at('totalShares') || '100',
          ownerEmail: at('ownerEmail'),
          status: at('status') || 'For Sale',
          email: at('email'),
          discord: at('discord'),
          docLink: at('docLink')
        });
      });
      return Array.from(seen.values());
    }

    window[cbName] = function (response) {
      cleanup();
      try {
        resolve(parseRows(response.table || {}));
      } catch (err) {
        reject(err);
      }
    };

    script.onerror = function () {
      cleanup();
      reject(new Error('Could not load the Google Sheet. Check sharing permissions.'));
    };

    script.src = 'https://docs.google.com/spreadsheets/d/' + encodeURIComponent(cfg.sheetId) +
      '/gviz/tq?gid=' + encodeURIComponent(cfg.gid || '0') + '&headers=0&tqx=out:json;responseHandler:' + cbName;
    document.body.appendChild(script);
  });
}

function renderUsers() {
  if (!userRows) return;
  userRows.innerHTML = userCache.length
    ? userCache.map(function (user) {
        return '<tr>' +
          '<td>' + escapeHtml(user.email || user.userId) + '</td>' +
          '<td>' + (user.isVerifiedBuyer ? '<span class="badge verified">Enabled</span>' : '<span class="badge status-under-review">Disabled</span>') + '</td>' +
          '<td>' + (user.isBlacklisted ? '<span class="badge status-frozen">Yes</span>' : '<span class="badge status-active">No</span>') + '</td>' +
          '<td>' + escapeHtml(Number(user.dtcBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })) + ' DTC</td>' +
          '<td>' +
            '<div class="trade-inline stack-on-mobile">' +
              '<button class="btn btn-ghost trade-btn" data-admin-action="toggle-buyer" data-user-id="' + escapeHtml(user.userId) + '">' + (user.isVerifiedBuyer ? 'Remove Buyer' : 'Grant Buyer') + '</button>' +
              '<button class="btn btn-ghost trade-btn" data-admin-action="toggle-blacklist" data-user-id="' + escapeHtml(user.userId) + '">' + (user.isBlacklisted ? 'Unblacklist' : 'Blacklist') + '</button>' +
              '<input class="trade-qty" type="number" step="1" placeholder="± DTC" data-balance-user="' + escapeHtml(user.userId) + '">' +
              '<button class="btn btn-ghost trade-btn" data-admin-action="adjust-balance" data-user-id="' + escapeHtml(user.userId) + '">Apply</button>' +
            '</div>' +
          '</td>' +
          '</tr>';
      }).join('')
    : '<tr><td colspan="5" style="text-align:center;padding:26px">No users loaded.</td></tr>';
}

function renderTransactions() {
  if (!txRows) return;
  txRows.innerHTML = txCache.length
    ? txCache.map(function (tx) {
        const actor = tx.buyerEmail || tx.fromEmail || tx.sellerEmail || tx.toEmail || 'Unknown';
        const amount = tx.totalPrice != null ? Number(tx.totalPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' DTC' : (tx.quantity || '—');
        return '<tr>' +
          '<td>' + escapeHtml(tx.type || '') + '</td>' +
          '<td>' + escapeHtml(tx.ticker || '—') + '</td>' +
          '<td>' + escapeHtml(actor) + '</td>' +
          '<td>' + escapeHtml(String(amount)) + '</td>' +
          '<td><span class="badge status-under-review">' + escapeHtml(tx.status || 'pending') + '</span></td>' +
          '<td>' +
            '<div class="trade-inline stack-on-mobile">' +
              '<button class="btn btn-ghost trade-btn" data-admin-action="approve-tx" data-tx-id="' + escapeHtml(tx.id) + '">Approve</button>' +
              '<button class="btn btn-ghost trade-btn" data-admin-action="reject-tx" data-tx-id="' + escapeHtml(tx.id) + '">Reject</button>' +
            '</div>' +
          '</td>' +
          '</tr>';
      }).join('')
    : '<tr><td colspan="6" style="text-align:center;padding:26px">No pending approvals.</td></tr>';
}

function renderDocs() {
  if (!docRows) return;
  docRows.innerHTML = docsCache.length
    ? docsCache.map(function (row) {
        return '<tr>' +
          '<td><strong>' + escapeHtml(row.ticker) + '</strong><br><small>' + escapeHtml(row.title || row.ticker) + '</small></td>' +
          '<td><input class="trade-qty" type="number" min="1" max="10" value="' + escapeHtml(row.utility != null ? String(row.utility) : '') + '" data-doc-field="utility" data-doc-ticker="' + escapeHtml(row.ticker) + '"></td>' +
          '<td><input class="trade-qty" type="number" min="1" max="10" value="' + escapeHtml(row.aesthetics != null ? String(row.aesthetics) : '') + '" data-doc-field="aesthetics" data-doc-ticker="' + escapeHtml(row.ticker) + '"></td>' +
          '<td><input class="trade-qty" type="number" min="1" max="10" value="' + escapeHtml(row.integration != null ? String(row.integration) : '') + '" data-doc-field="integration" data-doc-ticker="' + escapeHtml(row.ticker) + '"></td>' +
          '<td><input class="trade-qty" type="number" min="1" max="5" value="' + escapeHtml(row.verificationGrade != null ? String(row.verificationGrade) : '') + '" data-doc-field="verificationGrade" data-doc-ticker="' + escapeHtml(row.ticker) + '"></td>' +
          '<td>' +
            '<select class="trade-qty" data-doc-field="status" data-doc-ticker="' + escapeHtml(row.ticker) + '">' +
              ['Active', 'For Sale', 'Under Review', 'Sold', 'Frozen'].map(function (status) {
                return '<option value="' + status + '"' + (row.status === status ? ' selected' : '') + '>' + status + '</option>';
              }).join('') +
            '</select>' +
          '</td>' +
          '<td>' +
            '<div class="trade-inline stack-on-mobile">' +
              '<input class="trade-qty" type="number" min="1" step="1" value="' + escapeHtml(String(row.totalShares || 100)) + '" data-doc-field="totalShares" data-doc-ticker="' + escapeHtml(row.ticker) + '">' +
              '<input class="trade-qty" type="number" min="0" step="1" value="' + escapeHtml(String(row.availableShares || 0)) + '" data-doc-field="availableShares" data-doc-ticker="' + escapeHtml(row.ticker) + '">' +
            '</div>' +
          '</td>' +
          '<td><button class="btn btn-gold trade-btn" data-admin-action="save-doc" data-doc-ticker="' + escapeHtml(row.ticker) + '">Save</button></td>' +
          '</tr>';
      }).join('')
    : '<tr><td colspan="8" style="text-align:center;padding:26px">No docs loaded.</td></tr>';
}

function docFieldValue(ticker, field) {
  const selector = '[data-doc-ticker="' + CSS.escape(ticker) + '"][data-doc-field="' + CSS.escape(field) + '"]';
  const el = document.querySelector(selector);
  return el ? el.value : '';
}

async function handleCreateDoc(ev) {
  ev.preventDefault();
  if (!createDocForm) return;
  const btn = createDocForm.querySelector('button[type="submit"]');
  const original = btn ? btn.textContent : 'Create market doc';
  const data = new FormData(createDocForm);
  const ticker = String(data.get('ticker') || '').trim().toUpperCase();
  if (!ticker) {
    showNotice('<strong>Create failed.</strong> A ticker is required.', 'warn');
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Creating…';
  }

  try {
    const ownerEmail = String(data.get('ownerEmail') || '').trim();
    let ownerId = '';
    if (ownerEmail) {
      const ownerProfile = await getUserByEmail(ownerEmail);
      if (ownerProfile) ownerId = ownerProfile.userId || '';
      if (String(data.get('type') || 'stock').trim() === 'buyout' && !ownerId) {
        throw new Error('For buyout docs, owner email must belong to an existing DTO account.');
      }
    }

    const totalShares = String(data.get('totalShares') || '100');
    await saveDocProfile(ticker, {
      title: String(data.get('title') || '').trim(),
      description: String(data.get('description') || '').trim(),
      type: String(data.get('type') || 'stock').trim(),
      ownerEmail: ownerEmail,
      ownerId: ownerId,
      verified: true,
      utility: data.get('utility'),
      aesthetics: data.get('aesthetics'),
      integration: data.get('integration'),
      verificationGrade: data.get('verificationGrade'),
      status: data.get('status'),
      totalShares: totalShares,
      availableShares: totalShares
    });

    createDocForm.reset();
    ['newUtility', 'newAesthetics', 'newIntegration'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.value = '5';
    });
    var vg = document.getElementById('newVerificationGrade');
    if (vg) vg.value = '3';
    var ts = document.getElementById('newTotalShares');
    if (ts) ts.value = '100';
    showNotice('<strong>Market doc created.</strong> ' + escapeHtml(ticker) + ' was added to Firestore and should appear live immediately.', '');
  } catch (err) {
    showNotice('<strong>Create failed.</strong> ' + escapeHtml(err.message), 'warn');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = original;
    }
  }
}

async function handleAdminClick(ev) {
  const btn = ev.target.closest('[data-admin-action]');
  if (!btn) return;
  const action = btn.getAttribute('data-admin-action');
  const userId = btn.getAttribute('data-user-id');
  const txId = btn.getAttribute('data-tx-id');
  const ticker = btn.getAttribute('data-doc-ticker');

  btn.disabled = true;
  const original = btn.textContent;
  btn.textContent = 'Working…';

  try {
    if (action === 'toggle-buyer') {
      const user = userCache.find(function (row) { return row.userId === userId; });
      await setVerifiedBuyer(userId, !(user && user.isVerifiedBuyer));
    }
    if (action === 'toggle-blacklist') {
      const user = userCache.find(function (row) { return row.userId === userId; });
      await setBlacklisted(userId, !(user && user.isBlacklisted));
    }
    if (action === 'adjust-balance') {
      const input = document.querySelector('[data-balance-user="' + CSS.escape(userId) + '"]');
      await adjustUserBalance(userId, input ? input.value : '0');
      if (input) input.value = '';
    }
    if (action === 'approve-tx') {
      await approvePendingTransaction(txId);
    }
    if (action === 'reject-tx') {
      const note = window.prompt('Optional rejection note', '');
      await rejectPendingTransaction(txId, note || 'Rejected by admin');
    }
    if (action === 'save-doc') {
      const existing = docsCache.find(function (row) { return row.ticker === ticker; });
      await saveDocProfile(ticker, {
        title: existing && existing.title,
        description: existing && existing.description,
        type: existing && existing.type,
        ownerId: existing && existing.ownerId,
        ownerEmail: existing && existing.ownerEmail,
        verified: true,
        utility: docFieldValue(ticker, 'utility'),
        aesthetics: docFieldValue(ticker, 'aesthetics'),
        integration: docFieldValue(ticker, 'integration'),
        verificationGrade: docFieldValue(ticker, 'verificationGrade'),
        status: docFieldValue(ticker, 'status'),
        totalShares: docFieldValue(ticker, 'totalShares'),
        availableShares: docFieldValue(ticker, 'availableShares')
      });
    }
    showNotice('<strong>Admin update complete.</strong> Cloud data has been updated.', '');
  } catch (err) {
    showNotice('<strong>Admin action failed.</strong> ' + escapeHtml(err.message), 'warn');
  } finally {
    btn.disabled = false;
    btn.textContent = original;
  }
}

async function initAdminSession(user) {
  clearSubscriptions();
  currentUser = user;
  userCache = [];
  txCache = [];
  docsCache = [];

  if (!user) {
    showGate('Login required. Open <a href="account.html">Account</a>, then return with an admin-approved UID.');
    renderUsers();
    renderTransactions();
    renderDocs();
    return;
  }

  const allowed = await isAdmin(user.uid).catch(function () { return false; });
  if (!allowed) {
    const profile = await getUserProfile(user.uid).catch(function () { return null; });
    showGate('This account does not currently have admin access. Ask an existing admin to add an <code>/admins/' + escapeHtml(user.uid) + '</code> document.' + (profile ? ' Logged in as ' + escapeHtml(profile.email || user.uid) + '.' : ''));
    renderUsers();
    renderTransactions();
    renderDocs();
    return;
  }

  showGate('');
  showNotice('<strong>Admin mode active.</strong> All actions here sync directly with Firestore in real time.');

  unsubUsers = subscribeAllUsers(function (rows) {
    userCache = rows;
    renderUsers();
  });
  unsubTx = subscribePendingTransactions(function (rows) {
    txCache = rows;
    renderTransactions();
  });
  unsubDocs = subscribeDocs(function (rows) {
    docsCache = rows;
    renderDocs();
  });
}

function init() {
  if (!firebaseConfigured()) {
    showNotice('<strong>Firebase setup required.</strong> ' + escapeHtml(firebaseIssueMessage()), 'warn');
    showGate('This admin panel is disabled until Firebase Auth and Firestore are configured.');
    return;
  }

  if (createDocForm) createDocForm.addEventListener('submit', handleCreateDoc);
  if (syncSheetBtn) syncSheetBtn.addEventListener('click', handleSyncSheet);
  if (userRows) userRows.addEventListener('click', handleAdminClick);
  if (txRows) txRows.addEventListener('click', handleAdminClick);
  if (docRows) docRows.addEventListener('click', handleAdminClick);

  onSessionChange(function (user) {
    initAdminSession(user).catch(function (err) {
      showNotice('<strong>Admin load failed.</strong> ' + escapeHtml(err.message), 'warn');
    });
  });
}

init();
