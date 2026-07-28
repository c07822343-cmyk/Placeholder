import {
  auth,
  firebaseConfigured,
  firebaseIssueMessage,
  onSessionChange,
  registerWithEmail,
  loginWithEmail,
  logoutCurrentUser,
  sendPasswordReset,
  resendVerificationEmail,
  refreshCurrentUser,
  subscribeUserProfile,
  ensureAdminBootstrap
} from './db.js';

const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const resetForm = document.getElementById('resetForm');
const stateEl = document.getElementById('accountState');
const resendBtn = document.getElementById('resendVerifyBtn');
const refreshBtn = document.getElementById('refreshVerifyBtn');
const logoutBtn = document.getElementById('logoutBtn');
const noticeEl = document.getElementById('firebaseNotice');

let profileUnsub = null;

function showNotice(html, type) {
  if (!noticeEl) return;
  noticeEl.innerHTML = html;
  noticeEl.hidden = !html;
  noticeEl.classList.toggle('warn', type === 'warn');
}

function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function renderLoggedOut() {
  if (stateEl) {
    stateEl.innerHTML = '<p class="section-sub mb-0">You are logged out. Create an account or sign in to continue.</p>';
  }
  resendBtn.hidden = true;
  refreshBtn.hidden = true;
  logoutBtn.hidden = true;
}

function badge(label, className) {
  return '<span class="badge ' + className + '">' + escapeHtml(label) + '</span>';
}

function renderLoggedIn(user, profile) {
  if (!stateEl) return;
  const badges = [
    user.emailVerified ? badge('Email Verified', 'status-active') : badge('Email Unverified', 'status-under-review')
  ];
  if (profile && profile.isVerifiedBuyer) badges.push(badge('Verified Buyer', 'verified'));
  if (profile && profile.isBlacklisted) badges.push(badge('Restricted', 'status-frozen'));

  stateEl.innerHTML =
    '<div class="summary-list">' +
      '<div class="rev-row"><span>Email</span><b>' + escapeHtml(user.email || '') + '</b></div>' +
      '<div class="rev-row"><span>UID</span><b>' + escapeHtml(user.uid) + '</b></div>' +
      '<div class="rev-row"><span>Badges</span><b>' + badges.join(' ') + '</b></div>' +
      '<div class="rev-row"><span>DTC Balance</span><b>' + escapeHtml((profile && Number(profile.dtcBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00')) + ' DTC</b></div>' +
    '</div>';

  resendBtn.hidden = !!user.emailVerified;
  refreshBtn.hidden = false;
  logoutBtn.hidden = false;
}

async function handleRegister(ev) {
  ev.preventDefault();
  const data = new FormData(registerForm);
  const email = String(data.get('email') || '').trim();
  const password = String(data.get('password') || '');
  const confirm = String(data.get('confirm') || '');
  if (!email || !password) {
    showNotice('<strong>Missing info.</strong> Enter an email address and password.', 'warn');
    return;
  }
  if (password !== confirm) {
    showNotice('<strong>Password mismatch.</strong> Make sure both password fields match.', 'warn');
    return;
  }

  try {
    await registerWithEmail(email, password);
    showNotice('<strong>Account created.</strong> Check your inbox for the verification email before trading.');
    registerForm.reset();
  } catch (err) {
    showNotice('<strong>Registration failed.</strong> ' + escapeHtml(err.message), 'warn');
  }
}

async function handleLogin(ev) {
  ev.preventDefault();
  const data = new FormData(loginForm);
  try {
    await loginWithEmail(String(data.get('email') || '').trim(), String(data.get('password') || ''));
    showNotice('<strong>Logged in.</strong> Your session is active on this device.');
    loginForm.reset();
  } catch (err) {
    showNotice('<strong>Login failed.</strong> ' + escapeHtml(err.message), 'warn');
  }
}

async function handleReset(ev) {
  ev.preventDefault();
  const data = new FormData(resetForm);
  try {
    await sendPasswordReset(String(data.get('email') || '').trim());
    showNotice('<strong>Password reset sent.</strong> Check your email for the reset link.');
    resetForm.reset();
  } catch (err) {
    showNotice('<strong>Reset failed.</strong> ' + escapeHtml(err.message), 'warn');
  }
}

async function refreshVerification() {
  try {
    await refreshCurrentUser();
    showNotice('<strong>Verification refreshed.</strong> If you already clicked the email link, your account status should update now.');
  } catch (err) {
    showNotice('<strong>Refresh failed.</strong> ' + escapeHtml(err.message), 'warn');
  }
}

async function resendVerification() {
  try {
    await resendVerificationEmail();
    showNotice('<strong>Verification email sent.</strong> Check your inbox and spam folder.');
  } catch (err) {
    showNotice('<strong>Could not send verification email.</strong> ' + escapeHtml(err.message), 'warn');
  }
}

async function logout() {
  try {
    await logoutCurrentUser();
    showNotice('<strong>Logged out.</strong> Session cleared on this device.');
  } catch (err) {
    showNotice('<strong>Logout failed.</strong> ' + escapeHtml(err.message), 'warn');
  }
}

function bindProfile(user) {
  if (profileUnsub) profileUnsub();
  profileUnsub = null;
  if (!user) {
    renderLoggedOut();
    return;
  }
  profileUnsub = subscribeUserProfile(user.uid, function (profile) {
    renderLoggedIn(user, profile);
  });
}

function init() {
  if (!firebaseConfigured()) {
    showNotice('<strong>Firebase setup required.</strong> ' + escapeHtml(firebaseIssueMessage()), 'warn');
    renderLoggedOut();
    if (registerForm) registerForm.querySelectorAll('input, button').forEach(function (el) { el.disabled = true; });
    if (loginForm) loginForm.querySelectorAll('input, button').forEach(function (el) { el.disabled = true; });
    if (resetForm) resetForm.querySelectorAll('input, button').forEach(function (el) { el.disabled = true; });
    return;
  }

  if (registerForm) registerForm.addEventListener('submit', handleRegister);
  if (loginForm) loginForm.addEventListener('submit', handleLogin);
  if (resetForm) resetForm.addEventListener('submit', handleReset);
  if (resendBtn) resendBtn.addEventListener('click', resendVerification);
  if (refreshBtn) refreshBtn.addEventListener('click', refreshVerification);
  if (logoutBtn) logoutBtn.addEventListener('click', logout);

  onSessionChange(async function (user) {
    if (!user) {
      bindProfile(null);
      return;
    }
    try {
      await ensureAdminBootstrap(user.uid, user.email || '');
    } catch (err) {
      console.warn(err);
    }
    bindProfile(user);
  });
}

init();
