# DTO Economy Collection Schema

This document defines the **`economy`** collection used by the automated DTC yield system.
It is designed for Firebase Cloud Functions and a static front-end that talks to Firebase Auth + Firestore.

## Collection: `/economy`

Use one document per user, keyed by the user's Firebase Auth UID.

### `/economy/{uid}`

```json
{
  "userId": "uid_123",
  "yieldEnabled": true,
  "isFlagged": false,
  "verificationEligible": true,

  "passive": {
    "lastRunAt": "2026-08-01T00:00:00.000Z",
    "lastAward": 49,
    "lifetimeAwarded": 1240,
    "awardedTodayKey": "2026-08-01"
  },

  "activity": {
    "sessionId": "sess_abc123",
    "sessionStart": "2026-08-01T14:00:00.000Z",
    "lastPing": "2026-08-01T14:04:10.000Z",
    "lastActivityAt": "2026-08-01T14:04:10.000Z",
    "pendingActiveMs": 250000,
    "awardedToday": 18,
    "awardedTodayKey": "2026-08-01",
    "lifetimeAwarded": 460,
    "lastPage": "ticker",
    "isSessionOpen": true
  },

  "stability": {
    "lifetimeAwarded": 300,
    "lastBonusAt": "2026-07-28T00:00:00.000Z"
  },

  "dividends": {
    "lifetimeAwarded": 55,
    "lastDividendAt": "2026-07-30T18:22:00.000Z"
  },

  "totals": {
    "lifetimeAwarded": 2055,
    "lastAwardType": "activity",
    "updatedAt": "2026-08-01T14:04:10.000Z"
  }
}
```

## Optional control documents in the same collection

### `/economy/__config__`

```json
{
  "dailyPassive": {
    "utilityRate": 5,
    "aestheticRate": 3,
    "minVerificationGrade": 5
  },
  "activity": {
    "dtcPerBlock": 2,
    "blockMinutes": 5,
    "idleTimeoutMinutes": 2,
    "dailyCap": 50
  },
  "stability": {
    "bonusAmount": 100,
    "requiredHourlyChecks": 168
  },
  "dividend": {
    "treasuryShare": 0.06,
    "activeUserShare": 0.01
  }
}
```

### `/economy/__treasury__`

```json
{
  "dtcBalance": 0,
  "lastUpdatedAt": "2026-08-01T00:00:00.000Z"
}
```

## Other collections referenced by the Cloud Functions

### `/users/{uid}`
Expected fields used by the functions:

```json
{
  "userId": "uid_123",
  "email": "user@example.com",
  "isEmailVerified": true,
  "isVerifiedBuyer": false,
  "isBlacklisted": false,
  "dtcBalance": 120,
  "ownedDocs": ["DOC1"],
  "shareholdings": []
}
```

### `/docs/{ticker}`
Expected asset fields:

```json
{
  "ticker": "DOC1",
  "title": "Doc Name",
  "ownerId": "uid_123",
  "ownerEmail": "user@example.com",
  "utility": 8,
  "aesthetics": 7,
  "integration": 9,
  "verificationGrade": 5,
  "currentDS": 4550,
  "currentSP": 45.5,
  "totalShares": 100,
  "availableShares": 100,
  "status": "Active",
  "isMarketOpen": true,
  "siteUrl": "https://example.com"
}
```

### `/transactions/{txId}`
Used for audit logging of yield payouts and trade events.

### `/blacklistedPeople/{uid}`
If a matching document exists, the user is excluded from automated yield.

```json
{
  "reason": "Manual fraud flag",
  "createdAt": "2026-08-01T00:00:00.000Z"
}
```

## Notes
- `yieldEnabled = false` overrides all automated DTC generation.
- `verificationEligible = true` can be used as an additional soft gate if desired.
- `awardedTodayKey` is a UTC date string used to reset daily activity caps safely.
- `pendingActiveMs` accrues only when pings stay inside the anti-idle threshold.
- `totals.lifetimeAwarded` should mirror all four award streams combined.
