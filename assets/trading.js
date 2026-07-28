import {
  auth,
  db,
  ensureFirebase,
  runTransaction,
  doc,
  collection,
  getDoc,
  getUserByEmail,
  updateUserFlags,
  upsertDocRecord,
  hydrateDocData,
  calculateDoxstox,
  calculateSharePrice,
  normalizeStatus,
  normalizeTier,
  APP_LIMITS,
  isAdmin
} from './db.js';

function nowIso() {
  return new Date().toISOString();
}

function cloneHoldings(list) {
  return Array.isArray(list) ? list.map(function (row) {
    return {
      ticker: row.ticker,
      quantity: Number(row.quantity) || 0,
      purchasePrice: Number(row.purchasePrice) || 0
    };
  }) : [];
}

function cloneOwnedDocs(list) {
  return Array.isArray(list) ? list.slice() : [];
}

function upsertHoldingForBuy(holdings, ticker, quantity, price) {
  const next = cloneHoldings(holdings);
  const existing = next.find(function (row) { return row.ticker === ticker; });
  if (!existing) {
    next.push({ ticker: ticker, quantity: quantity, purchasePrice: Number(price.toFixed(2)) });
    return next;
  }
  const totalCost = (existing.quantity * existing.purchasePrice) + (quantity * price);
  const totalQty = existing.quantity + quantity;
  existing.quantity = totalQty;
  existing.purchasePrice = Number((totalCost / totalQty).toFixed(2));
  return next;
}

function updateHoldingForSell(holdings, ticker, quantity) {
  const next = cloneHoldings(holdings);
  const existing = next.find(function (row) { return row.ticker === ticker; });
  if (!existing || existing.quantity < quantity) {
    throw new Error('You do not own enough shares to complete that sale.');
  }
  existing.quantity -= quantity;
  if (existing.quantity <= 0) {
    return next.filter(function (row) { return row.ticker !== ticker; });
  }
  return next;
}

function requireLoggedInUser() {
  const user = auth && auth.currentUser;
  if (!user) throw new Error('You must be logged in to trade.');
  if (!user.emailVerified) throw new Error('Verify your email address before trading.');
  return user;
}

function validateQuantity(quantity) {
  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty <= 0) {
    throw new Error('Quantity must be a whole number greater than zero.');
  }
  return qty;
}

function marketValue(docData) {
  return Number(((docData.currentSP || 0) * (docData.totalShares || APP_LIMITS.totalSharesPerDoc)).toFixed(2));
}

function ensureTradableProfile(userData) {
  if (!userData) throw new Error('User profile could not be loaded.');
  if (userData.isBlacklisted) throw new Error('This account is restricted from trading.');
}

function createTransactionRef() {
  return doc(collection(db, 'transactions'));
}

export async function buyShares(ticker, quantity) {
  await ensureFirebase();
  const user = requireLoggedInUser();
  const qty = validateQuantity(quantity);
  const userRef = doc(db, 'users', user.uid);
  const docRef = doc(db, 'docs', ticker);
  const txRef = createTransactionRef();

  await runTransaction(db, async function (tx) {
    const userSnap = await tx.get(userRef);
    const docSnap = await tx.get(docRef);
    if (!userSnap.exists()) throw new Error('User profile not found.');
    if (!docSnap.exists()) throw new Error('That ticker was not found.');

    const userData = userSnap.data();
    const docData = hydrateDocData(docSnap.data(), docSnap.id);
    ensureTradableProfile(userData);

    if (!docData.isMarketOpen || docData.status === 'Frozen' || docData.status === 'Sold') {
      throw new Error('This doc is not currently open for share purchases.');
    }
    if (docData.type !== 'stock') {
      throw new Error('This listing is not configured for share purchases.');
    }
    if (!Number.isFinite(docData.currentSP) || docData.currentSP <= 0) {
      throw new Error('Current share price is unavailable.');
    }
    if ((docData.availableShares || 0) < qty) {
      throw new Error('Not enough shares are available right now.');
    }

    const cost = Number((docData.currentSP * qty).toFixed(2));
    if ((Number(userData.dtcBalance) || 0) < cost) {
      throw new Error('Insufficient DTC balance.');
    }

    const nextHoldings = upsertHoldingForBuy(userData.shareholdings, ticker, qty, docData.currentSP);

    tx.update(userRef, {
      dtcBalance: Number((Number(userData.dtcBalance) - cost).toFixed(2)),
      shareholdings: nextHoldings,
      isEmailVerified: true,
      updatedAt: nowIso()
    });

    tx.update(docRef, {
      availableShares: docData.availableShares - qty,
      currentDS: docData.currentDS,
      currentSP: docData.currentSP,
      status: normalizeStatus(docData.status, true),
      updatedAt: nowIso()
    });

    tx.set(txRef, {
      type: 'buy',
      ticker: ticker,
      quantity: qty,
      pricePerShare: docData.currentSP,
      totalPrice: cost,
      buyerId: user.uid,
      buyerEmail: user.email || '',
      participants: [user.uid],
      status: 'completed',
      createdAt: nowIso()
    });
  });
}

export async function sellShares(ticker, quantity) {
  await ensureFirebase();
  const user = requireLoggedInUser();
  const qty = validateQuantity(quantity);
  const userRef = doc(db, 'users', user.uid);
  const docRef = doc(db, 'docs', ticker);
  const txRef = createTransactionRef();

  await runTransaction(db, async function (tx) {
    const userSnap = await tx.get(userRef);
    const docSnap = await tx.get(docRef);
    if (!userSnap.exists() || !docSnap.exists()) {
      throw new Error('The trade could not be prepared.');
    }

    const userData = userSnap.data();
    const docData = hydrateDocData(docSnap.data(), docSnap.id);
    ensureTradableProfile(userData);

    if (!Number.isFinite(docData.currentSP) || docData.currentSP <= 0) {
      throw new Error('Current share price is unavailable.');
    }

    const nextHoldings = updateHoldingForSell(userData.shareholdings, ticker, qty);
    const proceeds = Number((docData.currentSP * qty).toFixed(2));

    tx.update(userRef, {
      dtcBalance: Number((Number(userData.dtcBalance) + proceeds).toFixed(2)),
      shareholdings: nextHoldings,
      updatedAt: nowIso()
    });

    tx.update(docRef, {
      availableShares: Number(docData.availableShares || 0) + qty,
      currentDS: docData.currentDS,
      currentSP: docData.currentSP,
      updatedAt: nowIso()
    });

    tx.set(txRef, {
      type: 'sell',
      ticker: ticker,
      quantity: qty,
      pricePerShare: docData.currentSP,
      totalPrice: proceeds,
      sellerId: user.uid,
      sellerEmail: user.email || '',
      participants: [user.uid],
      status: 'completed',
      createdAt: nowIso()
    });
  });
}

export async function requestBuyout(ticker) {
  await ensureFirebase();
  const user = requireLoggedInUser();
  const buyerRef = doc(db, 'users', user.uid);
  const docRef = doc(db, 'docs', ticker);
  const txRef = createTransactionRef();

  await runTransaction(db, async function (tx) {
    const buyerSnap = await tx.get(buyerRef);
    const docSnap = await tx.get(docRef);
    if (!buyerSnap.exists() || !docSnap.exists()) throw new Error('Could not start the buyout request.');

    const buyerData = buyerSnap.data();
    const docData = hydrateDocData(docSnap.data(), docSnap.id);
    ensureTradableProfile(buyerData);

    if (!docData.ownerId) throw new Error('This doc does not have a registered owner for buyout transfer.');
    if (docData.ownerId === user.uid) throw new Error('You already own this doc.');
    if ((docData.availableShares || 0) !== (docData.totalShares || APP_LIMITS.totalSharesPerDoc)) {
      throw new Error('Full buyouts are restricted to docs with no distributed shares.');
    }
    if (docData.status === 'Frozen') throw new Error('This doc is currently frozen.');
    if (docData.currentDS >= APP_LIMITS.highValueThreshold && !buyerData.isVerifiedBuyer) {
      throw new Error('Only verified buyers may initiate a buyout for high-value docs.');
    }

    const finalPrice = Number(marketValue(docData).toFixed(2));
    const fee = Number((finalPrice * APP_LIMITS.dtoFeeRate).toFixed(2));

    tx.set(txRef, {
      type: 'buyout_request',
      ticker: ticker,
      buyerId: user.uid,
      buyerEmail: user.email || '',
      sellerId: docData.ownerId,
      sellerEmail: docData.ownerEmail || '',
      totalPrice: finalPrice,
      feeAmount: fee,
      netToSeller: Number((finalPrice - fee).toFixed(2)),
      participants: [user.uid, docData.ownerId],
      status: 'pending',
      createdAt: nowIso()
    });
  });
}

export async function requestShareTransfer(ticker, quantity, recipientEmail) {
  await ensureFirebase();
  const user = requireLoggedInUser();
  const qty = validateQuantity(quantity);
  const userRef = doc(db, 'users', user.uid);
  const txRef = createTransactionRef();

  await runTransaction(db, async function (tx) {
    const userSnap = await tx.get(userRef);
    if (!userSnap.exists()) throw new Error('User profile not found.');
    const userData = userSnap.data();
    ensureTradableProfile(userData);
    updateHoldingForSell(userData.shareholdings, ticker, qty);

    tx.set(txRef, {
      type: 'share_transfer_request',
      ticker: ticker,
      quantity: qty,
      fromUserId: user.uid,
      fromEmail: user.email || '',
      toEmail: String(recipientEmail || '').trim().toLowerCase(),
      participants: [user.uid],
      status: 'pending',
      createdAt: nowIso()
    });
  });
}

async function requireAdminAction() {
  await ensureFirebase();
  const user = requireLoggedInUser();
  const allowed = await isAdmin(user.uid);
  if (!allowed) throw new Error('Admin access required.');
  return user;
}

export async function setVerifiedBuyer(uid, nextValue) {
  await requireAdminAction();
  await updateUserFlags(uid, {
    isVerifiedBuyer: !!nextValue
  });
}

export async function setBlacklisted(uid, nextValue) {
  await requireAdminAction();
  await updateUserFlags(uid, {
    isBlacklisted: !!nextValue
  });
}

export async function adjustUserBalance(uid, delta) {
  const adminUser = await requireAdminAction();
  const userRef = doc(db, 'users', uid);
  const logRef = createTransactionRef();
  const amount = Number(delta);
  if (!Number.isFinite(amount) || amount === 0) throw new Error('Enter a non-zero DTC adjustment.');

  await runTransaction(db, async function (tx) {
    const snap = await tx.get(userRef);
    if (!snap.exists()) throw new Error('User not found.');
    const userData = snap.data();
    const nextBalance = Number((Number(userData.dtcBalance || 0) + amount).toFixed(2));
    if (nextBalance < 0) throw new Error('Adjustment would create a negative balance.');

    tx.update(userRef, {
      dtcBalance: nextBalance,
      updatedAt: nowIso()
    });

    tx.set(logRef, {
      type: 'admin_balance_adjustment',
      amount: amount,
      targetUserId: uid,
      targetEmail: userData.email || '',
      performedBy: adminUser.uid,
      participants: [uid, adminUser.uid],
      status: 'completed',
      createdAt: nowIso()
    });
  });
}

function normalizeTotalShares(totalShares) {
  const total = Number(totalShares || APP_LIMITS.totalSharesPerDoc);
  if (!Number.isFinite(total) || total <= 0) {
    throw new Error('Total shares must be a positive number.');
  }
  return Math.round(total);
}

function normalizeAvailableShares(availableShares, totalShares) {
  const available = Number(availableShares != null ? availableShares : totalShares);
  if (!Number.isFinite(available) || available < 0 || available > totalShares) {
    throw new Error('Share counts are invalid.');
  }
  return Math.round(available);
}

async function buildDocPayload(ticker, patch) {
  const utility = normalizeTier(patch.utility, 1, 10);
  const aesthetics = normalizeTier(patch.aesthetics, 1, 10);
  const integration = normalizeTier(patch.integration, 1, 10);
  const verificationGrade = normalizeTier(patch.verificationGrade, 1, 5);
  if ([utility, aesthetics, integration, verificationGrade].some(function (v) { return v == null; })) {
    throw new Error('Utility, Aesthetics and Integration must be 1–10. Verification Grade must be 1–5.');
  }

  const currentDS = calculateDoxstox(utility, aesthetics, integration, verificationGrade);
  const currentSP = calculateSharePrice(currentDS);
  const totalShares = normalizeTotalShares(patch.totalShares);
  const availableShares = normalizeAvailableShares(patch.availableShares, totalShares);

  return {
    ticker: ticker,
    title: patch.title || ticker,
    description: patch.description || '',
    type: patch.type || 'stock',
    utility: utility,
    aesthetics: aesthetics,
    integration: integration,
    verificationGrade: verificationGrade,
    currentDS: currentDS,
    currentSP: currentSP,
    status: normalizeStatus(patch.status, patch.verified === true),
    verifiedStatus: patch.verifiedStatus || normalizeStatus(patch.status, patch.verified === true),
    verified: patch.verified === true,
    totalShares: totalShares,
    availableShares: availableShares,
    ownerId: patch.ownerId || '',
    ownerEmail: patch.ownerEmail || '',
    isMarketOpen: patch.isMarketOpen !== false
  };
}

export async function saveDocProfile(ticker, patch) {
  await requireAdminAction();
  const payload = await buildDocPayload(ticker, patch);
  await upsertDocRecord(ticker, payload);
}

export async function syncDocProfileFromSheet(row) {
  await requireAdminAction();
  const ticker = String(row.ticker || '').trim().toUpperCase();
  if (!ticker) throw new Error('Sheet row is missing a Ticker.');

  const existingSnap = await getDoc(doc(db, 'docs', ticker));
  const existing = existingSnap.exists() ? hydrateDocData(existingSnap.data(), existingSnap.id) : null;

  const totalShares = normalizeTotalShares(row.totalShares);
  let ownerEmail = String(row.ownerEmail || '').trim();
  let ownerId = existing && existing.ownerId ? existing.ownerId : '';

  if (ownerEmail) {
    const ownerProfile = await getUserByEmail(ownerEmail);
    if (ownerProfile) ownerId = ownerProfile.userId || ownerId;
  } else if (existing) {
    ownerEmail = existing.ownerEmail || '';
  }

  const availableShares = existing
    ? Math.min(Number(existing.availableShares || totalShares), totalShares)
    : totalShares;

  const payload = await buildDocPayload(ticker, {
    title: row.title,
    description: row.description,
    type: row.type,
    utility: row.utility,
    aesthetics: row.aesthetics,
    integration: row.integration,
    verificationGrade: row.verificationGrade,
    status: row.status,
    verified: true,
    totalShares: totalShares,
    availableShares: availableShares,
    ownerId: ownerId,
    ownerEmail: ownerEmail,
    isMarketOpen: true
  });

  await upsertDocRecord(ticker, payload);
  return { ticker: ticker, existed: !!existing };
}

export async function approvePendingTransaction(transactionId) {
  const adminUser = await requireAdminAction();
  const txRef = doc(db, 'transactions', transactionId);
  const txSnap = await getDoc(txRef);
  if (!txSnap.exists()) throw new Error('Transaction request not found.');
  const txData = txSnap.data();

  if (txData.type === 'buyout_request') {
    const buyerRef = doc(db, 'users', txData.buyerId);
    const sellerRef = doc(db, 'users', txData.sellerId);
    const docRef = doc(db, 'docs', txData.ticker);

    await runTransaction(db, async function (tx) {
      const requestSnap = await tx.get(txRef);
      const buyerSnap = await tx.get(buyerRef);
      const sellerSnap = await tx.get(sellerRef);
      const docSnap = await tx.get(docRef);
      if (!requestSnap.exists() || !buyerSnap.exists() || !sellerSnap.exists() || !docSnap.exists()) {
        throw new Error('Buyout approval prerequisites are missing.');
      }

      const requestData = requestSnap.data();
      const buyerData = buyerSnap.data();
      const sellerData = sellerSnap.data();
      const docData = hydrateDocData(docSnap.data(), docSnap.id);
      ensureTradableProfile(buyerData);

      if (requestData.status !== 'pending') throw new Error('This buyout request was already reviewed.');
      if ((docData.availableShares || 0) !== (docData.totalShares || APP_LIMITS.totalSharesPerDoc)) {
        throw new Error('Buyout approval failed because shares are already distributed.');
      }

      const finalPrice = Number(requestData.totalPrice || marketValue(docData));
      const fee = Number((finalPrice * APP_LIMITS.dtoFeeRate).toFixed(2));
      const netToSeller = Number((finalPrice - fee).toFixed(2));
      if ((Number(buyerData.dtcBalance) || 0) < finalPrice) {
        throw new Error('Buyer no longer has enough DTC.');
      }

      const nextBuyerOwnedDocs = cloneOwnedDocs(buyerData.ownedDocs);
      if (nextBuyerOwnedDocs.indexOf(docData.ticker) === -1) nextBuyerOwnedDocs.push(docData.ticker);
      const nextSellerOwnedDocs = cloneOwnedDocs(sellerData.ownedDocs).filter(function (row) {
        return row !== docData.ticker;
      });

      tx.update(buyerRef, {
        dtcBalance: Number((Number(buyerData.dtcBalance) - finalPrice).toFixed(2)),
        ownedDocs: nextBuyerOwnedDocs,
        updatedAt: nowIso()
      });
      tx.update(sellerRef, {
        dtcBalance: Number((Number(sellerData.dtcBalance || 0) + netToSeller).toFixed(2)),
        ownedDocs: nextSellerOwnedDocs,
        updatedAt: nowIso()
      });
      tx.update(docRef, {
        ownerId: buyerData.userId,
        ownerEmail: buyerData.email,
        status: 'Sold',
        verifiedStatus: 'Sold',
        availableShares: 0,
        updatedAt: nowIso()
      });
      tx.update(txRef, {
        status: 'approved',
        approvedBy: adminUser.uid,
        approvedAt: nowIso(),
        feeAmount: fee,
        netToSeller: netToSeller
      });
    });
    return;
  }

  if (txData.type === 'share_transfer_request') {
    const recipient = await getUserByEmail(txData.toEmail || '');
    if (!recipient) throw new Error('Recipient email was not found.');

    const senderRef = doc(db, 'users', txData.fromUserId);
    const recipientRef = doc(db, 'users', recipient.userId);

    await runTransaction(db, async function (tx) {
      const requestSnap = await tx.get(txRef);
      const senderSnap = await tx.get(senderRef);
      const recipientSnap = await tx.get(recipientRef);
      if (!requestSnap.exists() || !senderSnap.exists() || !recipientSnap.exists()) {
        throw new Error('Transfer approval prerequisites are missing.');
      }
      const requestData = requestSnap.data();
      const senderData = senderSnap.data();
      const recipientData = recipientSnap.data();
      if (requestData.status !== 'pending') throw new Error('This transfer request was already reviewed.');
      ensureTradableProfile(senderData);
      ensureTradableProfile(recipientData);

      const nextSenderHoldings = updateHoldingForSell(senderData.shareholdings, requestData.ticker, Number(requestData.quantity));
      const nextRecipientHoldings = upsertHoldingForBuy(recipientData.shareholdings, requestData.ticker, Number(requestData.quantity), 0);

      tx.update(senderRef, {
        shareholdings: nextSenderHoldings,
        updatedAt: nowIso()
      });
      tx.update(recipientRef, {
        shareholdings: nextRecipientHoldings,
        updatedAt: nowIso()
      });
      tx.update(txRef, {
        status: 'approved',
        approvedBy: adminUser.uid,
        approvedAt: nowIso(),
        participants: [requestData.fromUserId, recipient.userId]
      });
    });
    return;
  }

  throw new Error('This transaction type does not require admin approval.');
}

export async function rejectPendingTransaction(transactionId, note) {
  const adminUser = await requireAdminAction();
  const txRef = doc(db, 'transactions', transactionId);
  const snap = await getDoc(txRef);
  if (!snap.exists()) throw new Error('Transaction request not found.');
  const data = snap.data();
  if (data.status !== 'pending') throw new Error('This request was already reviewed.');
  await runTransaction(db, async function (tx) {
    const requestSnap = await tx.get(txRef);
    if (!requestSnap.exists()) throw new Error('Transaction request not found.');
    tx.update(txRef, {
      status: 'rejected',
      rejectedBy: adminUser.uid,
      rejectedAt: nowIso(),
      adminNote: String(note || '').trim()
    });
  });
}
