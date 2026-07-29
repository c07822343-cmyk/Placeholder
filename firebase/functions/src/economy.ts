import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as logger from 'firebase-functions/logger';
import { initializeApp } from 'firebase-admin/app';
import { FieldValue, Timestamp, getFirestore } from 'firebase-admin/firestore';

initializeApp();
const db = getFirestore();

const ECONOMY = 'economy';
const USERS = 'users';
const DOCS = 'docs';
const TRANSACTIONS = 'transactions';
const BLACKLIST = 'blacklistedPeople';

const DAILY_UTILITY_RATE = 5;
const DAILY_AESTHETIC_RATE = 3;
const REQUIRED_VERIFICATION_GRADE = 5;
const ACTIVITY_DTC_PER_BLOCK = 2;
const ACTIVITY_BLOCK_MS = 5 * 60 * 1000;
const ACTIVITY_IDLE_TIMEOUT_MS = 2 * 60 * 1000;
const ACTIVITY_DAILY_CAP = 50;

interface EconomyDoc {
  userId: string;
  yieldEnabled?: boolean;
  isFlagged?: boolean;
  verificationEligible?: boolean;
  passive?: {
    lastRunAt?: Timestamp | string | null;
    lastAward?: number;
    lifetimeAwarded?: number;
    awardedTodayKey?: string;
  };
  activity?: {
    sessionId?: string | null;
    sessionStart?: Timestamp | string | null;
    lastPing?: Timestamp | string | null;
    lastActivityAt?: Timestamp | string | null;
    pendingActiveMs?: number;
    awardedToday?: number;
    awardedTodayKey?: string;
    lifetimeAwarded?: number;
    lastPage?: string;
    isSessionOpen?: boolean;
  };
  stability?: {
    lifetimeAwarded?: number;
    lastBonusAt?: Timestamp | string | null;
  };
  dividends?: {
    lifetimeAwarded?: number;
    lastDividendAt?: Timestamp | string | null;
  };
  totals?: {
    lifetimeAwarded?: number;
    lastAwardType?: string;
    updatedAt?: Timestamp | string | null;
  };
}

interface UserDoc {
  userId: string;
  email?: string;
  isBlacklisted?: boolean;
  dtcBalance?: number;
}

interface DocAsset {
  ticker: string;
  ownerId?: string;
  ownerEmail?: string;
  utility?: number;
  aesthetics?: number;
  verificationGrade?: number;
  status?: string;
}

function utcDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function asDate(value: Timestamp | string | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Timestamp) return value.toDate();
  if (typeof value === 'string') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

function defaultEconomyState(userId: string): EconomyDoc {
  const now = Timestamp.now();
  const today = utcDayKey(now.toDate());
  return {
    userId,
    yieldEnabled: true,
    isFlagged: false,
    verificationEligible: true,
    passive: {
      lastRunAt: null,
      lastAward: 0,
      lifetimeAwarded: 0,
      awardedTodayKey: ''
    },
    activity: {
      sessionId: null,
      sessionStart: null,
      lastPing: null,
      lastActivityAt: null,
      pendingActiveMs: 0,
      awardedToday: 0,
      awardedTodayKey: today,
      lifetimeAwarded: 0,
      lastPage: '',
      isSessionOpen: false
    },
    stability: {
      lifetimeAwarded: 0,
      lastBonusAt: null
    },
    dividends: {
      lifetimeAwarded: 0,
      lastDividendAt: null
    },
    totals: {
      lifetimeAwarded: 0,
      lastAwardType: '',
      updatedAt: now
    }
  };
}

async function getOrCreateEconomy(uid: string): Promise<EconomyDoc> {
  const ref = db.collection(ECONOMY).doc(uid);
  const snap = await ref.get();
  if (snap.exists) {
    return snap.data() as EconomyDoc;
  }
  const fresh = defaultEconomyState(uid);
  await ref.set(fresh, { merge: true });
  return fresh;
}

async function isBlacklisted(uid: string, userData?: UserDoc): Promise<boolean> {
  if (userData?.isBlacklisted) return true;
  const flag = await db.collection(BLACKLIST).doc(uid).get();
  return flag.exists;
}

function passiveDtcForAsset(asset: DocAsset): number {
  const utility = Number(asset.utility || 0);
  const aesthetics = Number(asset.aesthetics || 0);
  return (utility * DAILY_UTILITY_RATE) + (aesthetics * DAILY_AESTHETIC_RATE);
}

function sumNumbers(values: Array<number | undefined | null>): number {
  return values.reduce((sum, value) => sum + Number(value || 0), 0);
}

export const dailyYield = onSchedule(
  {
    schedule: 'every day 00:10',
    timeZone: 'UTC',
    memory: '512MiB'
  },
  async () => {
    const docsSnap = await db
      .collection(DOCS)
      .where('verificationGrade', '>=', REQUIRED_VERIFICATION_GRADE)
      .get();

    const payoutMap = new Map<string, { email?: string; amount: number; tickers: string[] }>();

    docsSnap.forEach((snap) => {
      const asset = snap.data() as DocAsset;
      if (!asset.ownerId) return;
      const amount = passiveDtcForAsset(asset);
      if (amount <= 0) return;

      const current = payoutMap.get(asset.ownerId) || {
        email: asset.ownerEmail,
        amount: 0,
        tickers: []
      };
      current.amount += amount;
      current.tickers.push(asset.ticker || snap.id);
      payoutMap.set(asset.ownerId, current);
    });

    let awardedUsers = 0;
    let skippedUsers = 0;
    let totalAwarded = 0;
    const todayKey = utcDayKey(new Date());

    for (const [uid, payout] of payoutMap.entries()) {
      const userRef = db.collection(USERS).doc(uid);
      const economyRef = db.collection(ECONOMY).doc(uid);
      const txRef = db.collection(TRANSACTIONS).doc();

      await db.runTransaction(async (tx) => {
        const [userSnap, economySnap, blacklistSnap] = await Promise.all([
          tx.get(userRef),
          tx.get(economyRef),
          tx.get(db.collection(BLACKLIST).doc(uid))
        ]);

        if (!userSnap.exists) {
          skippedUsers += 1;
          return;
        }

        const userData = userSnap.data() as UserDoc;
        const economyData = economySnap.exists
          ? (economySnap.data() as EconomyDoc)
          : defaultEconomyState(uid);

        if (blacklistSnap.exists || userData.isBlacklisted || economyData.yieldEnabled === false || economyData.isFlagged) {
          skippedUsers += 1;
          tx.set(economyRef, {
            userId: uid,
            yieldEnabled: false,
            totals: {
              ...(economyData.totals || {}),
              updatedAt: Timestamp.now(),
              lastAwardType: 'daily_skipped'
            }
          }, { merge: true });
          return;
        }

        const currentBalance = Number(userData.dtcBalance || 0);
        const nextBalance = Number((currentBalance + payout.amount).toFixed(2));
        const passiveLifetime = Number(economyData.passive?.lifetimeAwarded || 0) + payout.amount;
        const totalLifetime = Number(economyData.totals?.lifetimeAwarded || 0) + payout.amount;

        tx.set(economyRef, {
          userId: uid,
          passive: {
            ...(economyData.passive || {}),
            lastRunAt: Timestamp.now(),
            lastAward: payout.amount,
            lifetimeAwarded: passiveLifetime,
            awardedTodayKey: todayKey
          },
          totals: {
            ...(economyData.totals || {}),
            lifetimeAwarded: totalLifetime,
            lastAwardType: 'daily_passive',
            updatedAt: Timestamp.now()
          }
        }, { merge: true });

        tx.update(userRef, {
          dtcBalance: nextBalance,
          updatedAt: Timestamp.now()
        });

        tx.set(txRef, {
          type: 'daily_yield',
          userId: uid,
          email: userData.email || payout.email || '',
          amount: payout.amount,
          tickers: payout.tickers,
          status: 'completed',
          participants: [uid],
          createdAt: Timestamp.now()
        });

        awardedUsers += 1;
        totalAwarded += payout.amount;
      });
    }

    logger.info('dailyYield complete', {
      eligibleOwners: payoutMap.size,
      awardedUsers,
      skippedUsers,
      totalAwarded
    });
  }
);

export const sessionTracker = onCall(async (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError('unauthenticated', 'You must be signed in to track a DTO session.');
  }

  const uid = request.auth.uid;
  const action = String(request.data?.action || '').trim().toLowerCase();
  const page = String(request.data?.page || '').trim().toLowerCase() || 'unknown';
  const clientSessionId = String(request.data?.sessionId || '').trim();
  const hadActivity = request.data?.hadActivity !== false;

  if (!['start', 'ping', 'end'].includes(action)) {
    throw new HttpsError('invalid-argument', 'Action must be start, ping, or end.');
  }

  const userRef = db.collection(USERS).doc(uid);
  const economyRef = db.collection(ECONOMY).doc(uid);
  const blacklistRef = db.collection(BLACKLIST).doc(uid);
  const txRef = db.collection(TRANSACTIONS).doc();

  const result = await db.runTransaction(async (tx) => {
    const [userSnap, economySnap, blacklistSnap] = await Promise.all([
      tx.get(userRef),
      tx.get(economyRef),
      tx.get(blacklistRef)
    ]);

    if (!userSnap.exists) {
      throw new HttpsError('failed-precondition', 'User profile was not found.');
    }

    const userData = userSnap.data() as UserDoc;
    const economyData = economySnap.exists
      ? (economySnap.data() as EconomyDoc)
      : defaultEconomyState(uid);

    if (blacklistSnap.exists || userData.isBlacklisted || economyData.yieldEnabled === false || economyData.isFlagged) {
      tx.set(economyRef, {
        userId: uid,
        yieldEnabled: false,
        totals: {
          ...(economyData.totals || {}),
          updatedAt: Timestamp.now(),
          lastAwardType: 'activity_blocked'
        }
      }, { merge: true });
      throw new HttpsError('permission-denied', 'This account is not eligible for automated DTC yield.');
    }

    const now = Timestamp.now();
    const todayKey = utcDayKey(now.toDate());
    const activity = {
      ...(economyData.activity || {})
    };

    if (activity.awardedTodayKey !== todayKey) {
      activity.awardedTodayKey = todayKey;
      activity.awardedToday = 0;
      activity.pendingActiveMs = 0;
    }

    let awardedDtc = 0;
    let nextPendingMs = Number(activity.pendingActiveMs || 0);
    let awardedToday = Number(activity.awardedToday || 0);
    const priorPing = asDate(activity.lastPing);

    if (action === 'start') {
      const sessionId = clientSessionId || `sess_${uid}_${Date.now()}`;
      tx.set(economyRef, {
        userId: uid,
        yieldEnabled: true,
        activity: {
          ...activity,
          sessionId,
          sessionStart: now,
          lastPing: now,
          lastActivityAt: now,
          pendingActiveMs: 0,
          awardedToday,
          awardedTodayKey: todayKey,
          lastPage: page,
          isSessionOpen: true
        },
        totals: {
          ...(economyData.totals || {}),
          updatedAt: now,
          lastAwardType: 'session_start'
        }
      }, { merge: true });

      return {
        sessionId,
        awardedDtc: 0,
        awardedToday,
        remainingCap: Math.max(0, ACTIVITY_DAILY_CAP - awardedToday),
        pendingActiveMs: 0,
        isSessionOpen: true
      };
    }

    if (!activity.sessionId) {
      throw new HttpsError('failed-precondition', 'No active tracked session exists. Start a session first.');
    }
    if (clientSessionId && activity.sessionId !== clientSessionId) {
      throw new HttpsError('failed-precondition', 'Session ID mismatch. Reload the page and start a new session.');
    }

    if (priorPing && hadActivity) {
      const elapsed = now.toDate().getTime() - priorPing.getTime();
      if (elapsed > 0 && elapsed <= ACTIVITY_IDLE_TIMEOUT_MS) {
        nextPendingMs += elapsed;
      }
    }

    const remainingCap = Math.max(0, ACTIVITY_DAILY_CAP - awardedToday);
    if (remainingCap > 0) {
      const blockCount = Math.floor(nextPendingMs / ACTIVITY_BLOCK_MS);
      const maxBlocks = Math.floor(remainingCap / ACTIVITY_DTC_PER_BLOCK);
      const payableBlocks = Math.min(blockCount, maxBlocks);
      if (payableBlocks > 0) {
        awardedDtc = payableBlocks * ACTIVITY_DTC_PER_BLOCK;
        nextPendingMs -= payableBlocks * ACTIVITY_BLOCK_MS;
        awardedToday += awardedDtc;
      }
    }

    const nextBalance = Number((Number(userData.dtcBalance || 0) + awardedDtc).toFixed(2));
    const nextLifetimeActivity = Number(activity.lifetimeAwarded || 0) + awardedDtc;
    const nextLifetimeTotal = Number(economyData.totals?.lifetimeAwarded || 0) + awardedDtc;
    const isEnding = action === 'end';

    tx.set(economyRef, {
      userId: uid,
      activity: {
        ...activity,
        sessionId: isEnding ? null : activity.sessionId,
        sessionStart: isEnding ? null : (activity.sessionStart || now),
        lastPing: now,
        lastActivityAt: hadActivity ? now : (activity.lastActivityAt || now),
        pendingActiveMs: nextPendingMs,
        awardedToday,
        awardedTodayKey: todayKey,
        lifetimeAwarded: nextLifetimeActivity,
        lastPage: page,
        isSessionOpen: !isEnding
      },
      totals: {
        ...(economyData.totals || {}),
        lifetimeAwarded: nextLifetimeTotal,
        lastAwardType: awardedDtc > 0 ? 'activity_yield' : (isEnding ? 'session_end' : 'session_ping'),
        updatedAt: now
      }
    }, { merge: true });

    if (awardedDtc > 0) {
      tx.update(userRef, {
        dtcBalance: nextBalance,
        updatedAt: now
      });
      tx.set(txRef, {
        type: 'activity_yield',
        userId: uid,
        email: userData.email || '',
        amount: awardedDtc,
        sessionId: activity.sessionId,
        page,
        status: 'completed',
        participants: [uid],
        createdAt: now
      });
    }

    return {
      sessionId: isEnding ? null : activity.sessionId,
      awardedDtc,
      awardedToday,
      remainingCap: Math.max(0, ACTIVITY_DAILY_CAP - awardedToday),
      pendingActiveMs: nextPendingMs,
      isSessionOpen: !isEnding
    };
  });

  return result;
});
