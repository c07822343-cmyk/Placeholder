import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js';
import {
  getAuth,
  browserLocalPersistence,
  setPersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged,
  reload
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  onSnapshot,
  query,
  where,
  getDocs,
  serverTimestamp,
  runTransaction,
  writeBatch
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js';

const CFG = window.DTO_CONFIG || {};
const FIREBASE = CFG.firebase || {};
const APP_SETTINGS = CFG.app || {};

const REQUIRED_KEYS = ['apiKey', 'authDomain', 'projectId', 'appId'];
const configured = REQUIRED_KEYS.every(function (key) {
  return typeof FIREBASE[key] === 'string' && FIREBASE[key].trim() !== '';
});

let app = null;
let auth = null;
let db = null;
let initError = null;

if (configured) {
  try {
    app = initializeApp(FIREBASE);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (err) {
    initError = err;
  }
}

const ready = configured && auth
  ? setPersistence(auth, browserLocalPersistence).catch(function (err) {
      initError = err;
      throw err;
    })
  : Promise.resolve(false);

export { auth, db, ready };

export const QUALITY_FORMULA = {
  utility: 250,
  aesthetics: 150,
  integration: 100,
  verification: 100
};

export const APP_LIMITS = {
  totalSharesPerDoc: 100,
  highValueThreshold: Number(APP_SETTINGS.highValueThreshold || 5000),
  dtoFeeRate: Number(APP_SETTINGS.dtoFeeRate || 0.07)
};

export function firebaseConfigured() {
  return configured && !!auth && !!db;
}

export function firebaseIssueMessage() {
  if (firebaseConfigured()) return '';
  if (initError) return 'Firebase failed to initialize: ' + initError.message;
  return 'Firebase config is missing. Add window.DTO_CONFIG.firebase in assets/config.js.';
}

export async function ensureFirebase() {
  if (!firebaseConfigured()) {
    throw new Error(firebaseIssueMessage() || 'Firebase is not configured.');
  }
  await ready;
}

export function calculateDoxstox(utility, aesthetics, integration, verificationGrade) {
  if ([utility, aesthetics, integration, verificationGrade].some(function (n) { return n == null; })) return null;
  return (QUALITY_FORMULA.utility * utility) +
    (QUALITY_FORMULA.aesthetics * aesthetics) +
    (QUALITY_FORMULA.integration * integration) +
    (QUALITY_FORMULA.verification * verificationGrade);
}

export function calculateSharePrice(doxstox) {
  if (doxstox == null) return null;
  return Number((doxstox / 100).toFixed(2));
}

export function normalizeStatus(status, verified) {
  const s = String(status || '').trim().toLowerCase();
  if (s === 'active') return 'Active';
  if (s === 'for sale' || s === 'forsale') return 'For Sale';
  if (s === 'under review' || s === 'underreview' || s === 'in review' || s === 'inreview') return 'Under Review';
  if (s === 'sold') return 'Sold';
  if (s === 'frozen') return 'Frozen';
  if (verified === true) return 'Active';
  return 'Under Review';
}

export function normalizeTier(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  const rounded = Math.round(n);
  if (rounded < min || rounded > max) return null;
  return rounded;
}

export function hydrateDocData(data, id) {
  const utility = normalizeTier(data.utility, 1, 10);
  const aesthetics = normalizeTier(data.aesthetics, 1, 10);
  const integration = normalizeTier(data.integration, 1, 10);
  const verificationGrade = normalizeTier(data.verificationGrade, 1, 5);
  const computedDoxstox = calculateDoxstox(utility, aesthetics, integration, verificationGrade);
  const currentDS = computedDoxstox != null ? computedDoxstox : (Number.isFinite(Number(data.currentDS)) ? Number(data.currentDS) : null);
  const currentSP = computedDoxstox != null ? calculateSharePrice(computedDoxstox) : (Number.isFinite(Number(data.currentSP)) ? Number(data.currentSP) : calculateSharePrice(currentDS));
  const totalShares = Number.isFinite(Number(data.totalShares)) ? Number(data.totalShares) : APP_LIMITS.totalSharesPerDoc;
  const availableShares = Number.isFinite(Number(data.availableShares)) ? Number(data.availableShares) : totalShares;
  const weeklyHistory = Array.isArray(data.weeklyHistory)
    ? data.weeklyHistory.map(function (v) { return Number(v); }).filter(function (v) { return Number.isFinite(v); })
    : [];

  return {
    id: id || data.ticker,
    ticker: data.ticker || id,
    title: data.title || data.name || data.ticker || id,
    description: data.description || '',
    utility: utility,
    aesthetics: aesthetics,
    integration: integration,
    verificationGrade: verificationGrade,
    currentDS: currentDS,
    currentSP: currentSP,
    totalShares: totalShares,
    availableShares: availableShares,
    verifiedStatus: data.verifiedStatus || normalizeStatus(data.status, data.verified === true),
    status: normalizeStatus(data.status, data.verified === true),
    ownerId: data.ownerId || '',
    ownerEmail: data.ownerEmail || '',
    weeklyHistory: weeklyHistory,
    weeklyChange: Number.isFinite(Number(data.weeklyChange)) ? Number(data.weeklyChange) : null,
    isMarketOpen: data.isMarketOpen !== false,
    type: data.type || 'stock'
  };
}

export function defaultUserProfile(user) {
  return {
    userId: user.uid,
    email: user.email || '',
    isEmailVerified: !!user.emailVerified,
    isVerifiedBuyer: false,
    isBlacklisted: false,
    dtcBalance: 0,
    ownedDocs: [],
    shareholdings: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
}

export async function ensureUserProfile(user) {
  await ensureFirebase();
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, defaultUserProfile(user));
    return;
  }
  const data = snap.data() || {};
  const patch = {};
  if (data.email !== user.email) patch.email = user.email || '';
  if (data.isEmailVerified !== !!user.emailVerified) patch.isEmailVerified = !!user.emailVerified;
  if (!Array.isArray(data.ownedDocs)) patch.ownedDocs = [];
  if (!Array.isArray(data.shareholdings)) patch.shareholdings = [];
  if (typeof data.isVerifiedBuyer !== 'boolean') patch.isVerifiedBuyer = false;
  if (typeof data.isBlacklisted !== 'boolean') patch.isBlacklisted = false;
  if (!Number.isFinite(Number(data.dtcBalance))) patch.dtcBalance = 0;
  if (Object.keys(patch).length) {
    patch.updatedAt = serverTimestamp();
    await updateDoc(ref, patch);
  }
}

export async function refreshCurrentUser() {
  await ensureFirebase();
  if (!auth.currentUser) return null;
  await reload(auth.currentUser);
  await ensureUserProfile(auth.currentUser);
  return auth.currentUser;
}

export async function registerWithEmail(email, password) {
  await ensureFirebase();
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await ensureUserProfile(cred.user);
  await sendEmailVerification(cred.user);
  return cred.user;
}

export async function loginWithEmail(email, password) {
  await ensureFirebase();
  const cred = await signInWithEmailAndPassword(auth, email, password);
  await ensureUserProfile(cred.user);
  return cred.user;
}

export async function logoutCurrentUser() {
  await ensureFirebase();
  return signOut(auth);
}

export async function sendPasswordReset(email) {
  await ensureFirebase();
  return sendPasswordResetEmail(auth, email);
}

export async function resendVerificationEmail() {
  await ensureFirebase();
  if (!auth.currentUser) throw new Error('No active user session.');
  return sendEmailVerification(auth.currentUser);
}

export function onSessionChange(callback) {
  if (!firebaseConfigured()) {
    callback(null);
    return function () {};
  }
  return onAuthStateChanged(auth, async function (user) {
    if (user) {
      try {
        await ensureUserProfile(user);
      } catch (err) {
        console.error(err);
      }
    }
    callback(user);
  });
}

export function subscribeUserProfile(uid, callback) {
  return onSnapshot(doc(db, 'users', uid), function (snap) {
    callback(snap.exists() ? snap.data() : null);
  });
}

export function subscribeDocs(callback) {
  return onSnapshot(collection(db, 'docs'), function (snap) {
    const rows = snap.docs.map(function (row) {
      return hydrateDocData(row.data(), row.id);
    }).sort(function (a, b) {
      return String(a.ticker || '').localeCompare(String(b.ticker || ''));
    });
    callback(rows);
  });
}

export function subscribeUserTransactions(uid, callback) {
  const q = query(collection(db, 'transactions'), where('participants', 'array-contains', uid));
  return onSnapshot(q, function (snap) {
    const rows = snap.docs.map(function (row) {
      return { id: row.id, ...row.data() };
    }).sort(function (a, b) {
      const aTime = a.createdAt && a.createdAt.seconds ? a.createdAt.seconds : 0;
      const bTime = b.createdAt && b.createdAt.seconds ? b.createdAt.seconds : 0;
      return bTime - aTime;
    });
    callback(rows);
  });
}

export function subscribeAllUsers(callback) {
  return onSnapshot(collection(db, 'users'), function (snap) {
    const rows = snap.docs.map(function (row) {
      return row.data();
    }).sort(function (a, b) {
      return String(a.email || '').localeCompare(String(b.email || ''));
    });
    callback(rows);
  });
}

export function subscribePendingTransactions(callback) {
  const q = query(collection(db, 'transactions'), where('status', '==', 'pending'));
  return onSnapshot(q, function (snap) {
    const rows = snap.docs.map(function (row) {
      return { id: row.id, ...row.data() };
    }).sort(sortTimestampLike);
    callback(rows);
  });
}

export async function getUserProfile(uid) {
  await ensureFirebase();
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

export async function getDocRecord(ticker) {
  await ensureFirebase();
  const snap = await getDoc(doc(db, 'docs', ticker));
  return snap.exists() ? hydrateDocData(snap.data(), snap.id) : null;
}

export async function getUserByEmail(email) {
  await ensureFirebase();
  const q = query(collection(db, 'users'), where('email', '==', email));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const found = snap.docs[0];
  return found.exists() ? found.data() : null;
}

export async function isAdmin(uid) {
  await ensureFirebase();
  const snap = await getDoc(doc(db, 'admins', uid));
  return snap.exists();
}

export async function ensureAdminBootstrap(uid, email) {
  await ensureFirebase();
  const adminsDoc = doc(db, 'admins', uid);
  const snap = await getDoc(adminsDoc);
  if (!snap.exists() && Array.isArray(APP_SETTINGS.bootstrapAdminEmails) && APP_SETTINGS.bootstrapAdminEmails.indexOf(email) !== -1) {
    await setDoc(adminsDoc, {
      uid: uid,
      email: email,
      createdAt: serverTimestamp(),
      note: 'Bootstrap admin created from assets/config.js'
    });
  }
}

export async function upsertDocRecord(ticker, payload) {
  await ensureFirebase();
  const ref = doc(db, 'docs', ticker);
  await setDoc(ref, {
    ticker: ticker,
    ...payload,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function writeTransactionRecord(record) {
  await ensureFirebase();
  const ref = doc(collection(db, 'transactions'));
  await setDoc(ref, {
    ...record,
    createdAt: serverTimestamp()
  });
  return ref.id;
}

export async function updateUserFlags(uid, patch) {
  await ensureFirebase();
  await updateDoc(doc(db, 'users', uid), {
    ...patch,
    updatedAt: serverTimestamp()
  });
}

export async function batchUpdateDocs(docs) {
  await ensureFirebase();
  const batch = writeBatch(db);
  docs.forEach(function (entry) {
    const ref = doc(db, 'docs', entry.ticker);
    batch.set(ref, {
      ...entry,
      updatedAt: serverTimestamp()
    }, { merge: true });
  });
  await batch.commit();
}

export { runTransaction, doc, collection, serverTimestamp, getDoc, updateDoc, setDoc };
