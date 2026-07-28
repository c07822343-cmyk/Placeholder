import {
  firebaseConfigured,
  firebaseIssueMessage,
  onSessionChange,
  subscribeUserProfile,
  subscribeDocs,
  subscribeUserTransactions,
  isAdmin
} from './db.js';
import { buyShares, sellShares, requestBuyout } from './trading.js';

const noticeEl = document.getElementById('portfolioNotice');
const gateEl = document.getElementById('portfolioAuthGate');
const netValueOut = document.getElementById('netValueOut');
const netValueDelta = document.getElementById('netValueDelta');
const balanceOut = document.getElementById('balanceOut');
const holdingsCountOut = document.getElementById('holdingsCountOut');
const badgesEl = document.getElementById('accountBadges');
const badgeHintEl = document.getElementById('accountBadgeHint');
const summaryEl = document.getElementById('portfolioProfileSummary');
const ownedDocsRows = document.getElementById('ownedDocsRows');
const holdingsRows = document.getElementById('holdingsRows');
const marketRows = document.getElementById('marketRows');
const transactionRows = document.getElementById('transactionRows');
const tickerSelect = document.getElementById('performanceTicker');
const chartCanvas = document.getElementById('performanceChart');

let currentUser = null;
let currentProfile = null;
let docsCache = [];
let txCache = [];
let lastNetValue = null;
let chart = null;
let unsubProfile = null;
let unsubDocs = null;
let unsubTransactions = null;

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

function currencyDtc(n) {
  return Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + ' DTC';
}

function docByTicker(ticker) {
  return docsCache.find(function (row) { return row.ticker === ticker; }) || null;
}

function netPortfolioValue(profile) {
  if (!profile) return 0;
  let total = Number(profile.dtcBalance || 0);
  (profile.shareholdings || []).forEach(function (holding) {
    const docData = docByTicker(holding.ticker);
    if (!docData || !Number.isFinite(docData.currentSP)) return;
    total += Number(holding.quantity || 0) * Number(docData.currentSP || 0);
  });
  return Number(total.toFixed(2));
}

function renderBadges(profile, user) {
  if (!badgesEl || !badgeHintEl) return;
  badgesEl.innerHTML = '';
  if (!user) {
    badgeHintEl.textContent = 'Login required';
    return;
  }
  const badges = [];
  badges.push(user.emailVerified
    ? '<span class="badge status-active">Email Verified</span>'
    : '<span class="badge status-under-review">Email Unverified</span>');
  if (profile && profile.isVerifiedBuyer) badges.push('<span class="badge verified">Verified Buyer</span>');
  if (profile && profile.isBlacklisted) badges.push('<span class="badge status-frozen">Blacklisted</span>');
  badgesEl.innerHTML = badges.join(' ');
  badgeHintEl.textContent = profile && profile.isVerifiedBuyer
    ? 'High-value buyout access enabled'
    : 'Admin must enable verified buyer access';
}

function renderSummary(profile, user) {
  if (!summaryEl) return;
  if (!user || !profile) {
    summaryEl.innerHTML = '<p class="section-sub mb-0">Login to load your DTO portfolio profile.</p>';
    return;
  }
  summaryEl.innerHTML =
    '<div class="rev-row"><span>Email</span><b>' + escapeHtml(user.email || '') + '</b></div>' +
    '<div class="rev-row"><span>Account status</span><b>' + (profile.isBlacklisted ? 'Restricted' : 'Active') + '</b></div>' +
    '<div class="rev-row"><span>Verified buyer</span><b>' + (profile.isVerifiedBuyer ? 'Enabled' : 'Disabled') + '</b></div>' +
    '<div class="rev-row"><span>Owned docs</span><b>' + Number((profile.ownedDocs || []).length) + '</b></div>' +
    '<div class="rev-row"><span>Share positions</span><b>' + Number((profile.shareholdings || []).length) + '</b></div>';
}

function renderMetrics(profile) {
  const nextValue = netPortfolioValue(profile);
  if (netValueOut) netValueOut.textContent = currencyDtc(nextValue);
  if (balanceOut) balanceOut.textContent = currencyDtc(profile ? profile.dtcBalance : 0);
  if (holdingsCountOut) holdingsCountOut.textContent = String(profile && profile.shareholdings ? profile.shareholdings.length : 0);
  if (netValueDelta) {
    if (lastNetValue == null) {
      netValueDelta.textContent = 'Live mark-to-market value';
      netValueDelta.style.color = 'var(--muted)';
    } else {
      const delta = Number((nextValue - lastNetValue).toFixed(2));
      netValueDelta.textContent = (delta >= 0 ? '▲ ' : '▼ ') + currencyDtc(Math.abs(delta)) + ' since last refresh';
      netValueDelta.style.color = delta >= 0 ? 'var(--green)' : 'var(--red)';
    }
  }
  lastNetValue = nextValue;
}

function renderOwnedDocs(profile) {
  if (!ownedDocsRows) return;
  if (!currentUser || !profile) {
    ownedDocsRows.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:26px">Login to load ownership records.</td></tr>';
    return;
  }
  const rows = (profile.ownedDocs || []).map(function (ticker) {
    const docData = docByTicker(ticker);
    if (!docData) return null;
    return '<tr>' +
      '<td>' + escapeHtml(docData.ticker) + '</td>' +
      '<td>' + escapeHtml(docData.title || docData.ticker) + '</td>' +
      '<td>' + window.DTO.statusBadge(docData.status) + '</td>' +
      '<td class="score">' + escapeHtml(Number(docData.currentDS || 0).toLocaleString()) + '</td>' +
      '<td>' + escapeHtml(currencyDtc(docData.currentSP || 0).replace(' DTC', '')) + ' / share</td>' +
      '</tr>';
  }).filter(Boolean);
  ownedDocsRows.innerHTML = rows.length
    ? rows.join('')
    : '<tr><td colspan="5" style="text-align:center;padding:26px">No full ownership docs yet.</td></tr>';
}

function renderHoldings(profile) {
  if (!holdingsRows) return;
  if (!currentUser || !profile) {
    holdingsRows.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:26px">Login to load shareholdings.</td></tr>';
    return;
  }
  const rows = (profile.shareholdings || []).map(function (holding) {
    const docData = docByTicker(holding.ticker);
    const currentSP = docData && Number.isFinite(docData.currentSP) ? docData.currentSP : 0;
    const marketValue = Number((currentSP * Number(holding.quantity || 0)).toFixed(2));
    return '<tr>' +
      '<td>' + escapeHtml(holding.ticker) + '</td>' +
      '<td>' + escapeHtml(String(holding.quantity)) + '</td>' +
      '<td>' + escapeHtml(currencyDtc(holding.purchasePrice).replace(' DTC', '')) + '</td>' +
      '<td>' + escapeHtml(currencyDtc(currentSP).replace(' DTC', '')) + '</td>' +
      '<td>' + escapeHtml(currencyDtc(marketValue)) + '</td>' +
      '<td>' +
        '<div class="trade-inline">' +
          '<input class="trade-qty" type="number" min="1" step="1" value="1" data-sell-ticker="' + escapeHtml(holding.ticker) + '">' +
          '<button class="btn btn-ghost trade-btn" data-action="sell" data-ticker="' + escapeHtml(holding.ticker) + '">Sell</button>' +
        '</div>' +
      '</td>' +
      '</tr>';
  });
  holdingsRows.innerHTML = rows.length
    ? rows.join('')
    : '<tr><td colspan="6" style="text-align:center;padding:26px">No shareholdings yet.</td></tr>';
}

function renderMarketplace(profile) {
  if (!marketRows) return;
  if (!docsCache.length) {
    marketRows.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:26px">No docs are currently listed.</td></tr>';
    return;
  }
  const restricted = !!(profile && profile.isBlacklisted);
  marketRows.innerHTML = docsCache.map(function (row) {
    const buyDisabled = !currentUser || restricted || row.type !== 'stock' || !row.isMarketOpen || row.status === 'Frozen' || row.status === 'Sold';
    const buyoutDisabled = !currentUser || restricted || !row.ownerId || row.ownerId === (currentUser && currentUser.uid) || row.status === 'Frozen';
    return '<tr>' +
      '<td>' + escapeHtml(row.ticker) + '</td>' +
      '<td>' + escapeHtml(row.title || row.ticker) + '</td>' +
      '<td class="score">' + escapeHtml(row.currentDS != null ? Number(row.currentDS).toLocaleString() : 'Pending') + '</td>' +
      '<td>' + escapeHtml(row.currentSP != null ? currencyDtc(row.currentSP).replace(' DTC', '') : 'Pending') + '</td>' +
      '<td>' + escapeHtml(String(row.availableShares || 0)) + ' / ' + escapeHtml(String(row.totalShares || 0)) + '</td>' +
      '<td>' + window.DTO.statusBadge(row.status) + '</td>' +
      '<td>' +
        '<div class="trade-inline stack-on-mobile">' +
          '<input class="trade-qty" type="number" min="1" step="1" value="1" data-buy-ticker="' + escapeHtml(row.ticker) + '">' +
          '<button class="btn btn-ghost trade-btn" data-action="buy" data-ticker="' + escapeHtml(row.ticker) + '"' + (buyDisabled ? ' disabled' : '') + '>Buy</button>' +
          '<button class="btn btn-ghost trade-btn" data-action="buyout" data-ticker="' + escapeHtml(row.ticker) + '"' + (buyoutDisabled ? ' disabled' : '') + '>Request Buyout</button>' +
          '<a class="btn btn-ghost trade-btn" href="' + escapeHtml(window.DTO.listingHref(row)) + '">View</a>' +
        '</div>' +
      '</td>' +
      '</tr>';
  }).join('');
}

function renderTransactions() {
  if (!transactionRows) return;
  if (!currentUser) {
    transactionRows.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:26px">Login to load transactions.</td></tr>';
    return;
  }
  transactionRows.innerHTML = txCache.length
    ? txCache.map(function (row) {
        return '<tr>' +
          '<td>' + escapeHtml(row.type || '') + '</td>' +
          '<td>' + escapeHtml(row.ticker || '—') + '</td>' +
          '<td>' + escapeHtml(row.quantity != null ? String(row.quantity) : '—') + '</td>' +
          '<td>' + escapeHtml(row.totalPrice != null ? currencyDtc(row.totalPrice) : '—') + '</td>' +
          '<td>' + escapeHtml(row.status || '') + '</td>' +
          '<td>' + escapeHtml(row.createdAt || 'Pending timestamp') + '</td>' +
          '</tr>';
      }).join('')
    : '<tr><td colspan="6" style="text-align:center;padding:26px">No transactions recorded yet.</td></tr>';
}

function buildChartOptions() {
  const options = [];
  docsCache.forEach(function (row) {
    if (row.weeklyHistory && row.weeklyHistory.length) {
      options.push(row.ticker);
    }
  });
  if (!tickerSelect) return;
  tickerSelect.innerHTML = options.length
    ? options.map(function (ticker) { return '<option value="' + escapeHtml(ticker) + '">' + escapeHtml(ticker) + '</option>'; }).join('')
    : '<option value="">No chart data available</option>';
}

function renderChart() {
  if (!chartCanvas || !tickerSelect || !window.Chart) return;
  const ticker = tickerSelect.value;
  const docData = docByTicker(ticker);
  const labels = docData && docData.weeklyHistory ? docData.weeklyHistory.map(function (_, idx) { return 'Week ' + (idx + 1); }) : [];
  const data = docData && docData.weeklyHistory ? docData.weeklyHistory : [];

  if (!chart) {
    chart = new window.Chart(chartCanvas.getContext('2d'), {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Weekly structural price history',
          data: data,
          borderColor: '#f5c542',
          backgroundColor: 'rgba(245, 197, 66, 0.12)',
          fill: true,
          tension: 0.25,
          pointRadius: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#e9eefb' } } },
        scales: {
          x: { ticks: { color: '#93a3c2' }, grid: { color: 'rgba(35,50,79,.4)' } },
          y: { ticks: { color: '#93a3c2' }, grid: { color: 'rgba(35,50,79,.4)' } }
        }
      }
    });
    return;
  }

  chart.data.labels = labels;
  chart.data.datasets[0].data = data;
  chart.update();
}

function refreshUi() {
  renderBadges(currentProfile, currentUser);
  renderSummary(currentProfile, currentUser);
  renderMetrics(currentProfile);
  renderOwnedDocs(currentProfile);
  renderHoldings(currentProfile);
  renderMarketplace(currentProfile);
  renderTransactions();
  buildChartOptions();
  renderChart();
}

function clearSubscriptions() {
  if (unsubProfile) unsubProfile();
  if (unsubDocs) unsubDocs();
  if (unsubTransactions) unsubTransactions();
  unsubProfile = null;
  unsubDocs = null;
  unsubTransactions = null;
}

async function handleTradeAction(ev) {
  const btn = ev.target.closest('[data-action]');
  if (!btn) return;
  const action = btn.getAttribute('data-action');
  const ticker = btn.getAttribute('data-ticker');
  const input = btn.parentElement && btn.parentElement.querySelector('.trade-qty');
  const qty = input ? input.value : '1';
  btn.disabled = true;
  const original = btn.textContent;
  btn.textContent = 'Working…';
  try {
    if (action === 'buy') await buyShares(ticker, qty);
    if (action === 'sell') await sellShares(ticker, qty);
    if (action === 'buyout') await requestBuyout(ticker);
    showNotice('<strong>Success.</strong> The requested trade action was submitted.', '');
  } catch (err) {
    showNotice('<strong>Trade blocked.</strong> ' + escapeHtml(err.message), 'warn');
  } finally {
    btn.disabled = false;
    btn.textContent = original;
  }
}

function init() {
  if (!firebaseConfigured()) {
    showNotice('<strong>Firebase setup required.</strong> ' + escapeHtml(firebaseIssueMessage()), 'warn');
    showGate('This dashboard is inactive until Firebase Auth and Firestore are configured in <code>assets/config.js</code>.');
    return;
  }

  showNotice('<strong>Connected:</strong> portfolio mode is listening for real-time account and pricing updates.');

  if (holdingsRows) holdingsRows.addEventListener('click', handleTradeAction);
  if (marketRows) marketRows.addEventListener('click', handleTradeAction);
  if (tickerSelect) tickerSelect.addEventListener('change', renderChart);

  onSessionChange(async function (user) {
    clearSubscriptions();
    currentUser = user;
    currentProfile = null;
    txCache = [];

    if (!user) {
      showGate('Login required. Open <a href="account.html">Account</a> to access DTO trading.');
      refreshUi();
      return;
    }

    showGate('');
    const admin = await isAdmin(user.uid).catch(function () { return false; });
    if (admin) {
      showNotice('<strong>Connected:</strong> portfolio mode is live. You also have admin access at <a href="admin.html">admin.html</a>.');
    }

    unsubProfile = subscribeUserProfile(user.uid, function (profile) {
      currentProfile = profile;
      refreshUi();
    });
    unsubDocs = subscribeDocs(function (rows) {
      docsCache = rows;
      refreshUi();
    });
    unsubTransactions = subscribeUserTransactions(user.uid, function (rows) {
      txCache = rows;
      refreshUi();
    });
  });
}

init();
