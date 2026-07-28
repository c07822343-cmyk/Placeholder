# DTO Firebase Setup

This project stays **static HTML/CSS/JS**, but the account + portfolio trading system uses:

- **Firebase Auth** — email/password, verification, reset, sessions
- **Cloud Firestore** — users, docs, transactions, admin access
- **Netlify Forms** — DTO request wizard on `apply.html`

## Folder structure

```text
assets/
  app.js          # public listings + listing detail UI
  auth.js         # account page auth flows
  db.js           # Firebase init + shared database helpers
  trading.js      # buy / sell / buyout / admin trading actions
  portfolio.js    # portfolio dashboard UI
  admin.js        # admin panel UI
  requests.js     # Netlify Forms request wizard
  config.js       # Firebase + app config + listings sheet config
  style.css       # shared styling

account.html      # register / login / verify / reset UI
portfolio.html    # live portfolio + trading dashboard
admin.html        # admin-only controls
apply.html        # DTO request wizard (Netlify Forms)
listing-details.html
firebase/
  firestore.rules # example Firestore rules
```

## 1. Create Firebase project

1. Go to <https://console.firebase.google.com>
2. Create a project
3. Add a **Web App**
4. Copy the web config into `assets/config.js` under `window.DTO_CONFIG.firebase`

Required keys:

```js
firebase: {
  apiKey: '',
  authDomain: '',
  projectId: '',
  appId: '',
  storageBucket: '',
  messagingSenderId: ''
}
```

## 2. Enable authentication

In Firebase Console:

- **Authentication → Sign-in method**
- Enable **Email/Password**

Optional but recommended:
- Customize email templates for verification + password reset

## 3. Create Firestore database

In Firebase Console:

- **Firestore Database**
- Create database in production mode
- Publish the rules from `firebase/firestore.rules`

## 4. Collections used by DTO

### `/users/{uid}`

```json
{
  "userId": "uid",
  "email": "user@email.com",
  "isEmailVerified": true,
  "isVerifiedBuyer": false,
  "isBlacklisted": false,
  "dtcBalance": 0,
  "ownedDocs": ["DOC1"],
  "shareholdings": [
    {
      "ticker": "DOC1",
      "quantity": 10,
      "purchasePrice": 25
    }
  ]
}
```

### `/docs/{ticker}`

```json
{
  "ticker": "DOC1",
  "title": "Doc name",
  "description": "What the doc does",
  "type": "stock",
  "utility": 8,
  "aesthetics": 7,
  "integration": 9,
  "verificationGrade": 5,
  "currentDS": 4550,
  "currentSP": 45.5,
  "totalShares": 100,
  "availableShares": 60,
  "status": "For Sale",
  "verifiedStatus": "Verified",
  "ownerId": "seller_uid",
  "ownerEmail": "seller@email.com",
  "weeklyChange": 4.2,
  "weeklyHistory": [40.5, 41.0, 42.1, 45.5]
}
```

### `/transactions/{id}`

Used for:
- completed buys
- completed sells
- pending buyout requests
- pending share transfer requests
- admin balance adjustments

### `/admins/{uid}`

If this document exists, the user can open `admin.html`.

Example:

```json
{
  "uid": "admin_uid",
  "email": "admin@email.com"
}
```

## 5. Admin bootstrap

In `assets/config.js` you can optionally pre-allow certain emails to self-bootstrap once:

```js
app: {
  highValueThreshold: 5000,
  dtoFeeRate: 0.07,
  bootstrapAdminEmails: ['owner@example.com']
}
```

After first login, remove the bootstrap email if you want stricter control.

## 6. Trading rules built into the client

### DoxStox formula

```text
DS = (250 × U) + (150 × A) + (100 × I) + (100 × V)
SP = DS / 100
```

Where:
- `Utility` = 1–10
- `Aesthetics` = 1–10
- `Integration` = 1–10
- `Verification Grade` = 1–5

### High-value buyouts

Configured in `assets/config.js`:

```js
highValueThreshold: 5000
```

If `currentDS >= highValueThreshold`, only `isVerifiedBuyer === true` may request the buyout.

## 7. Netlify Forms setup for `apply.html`

The application wizard is separate from Firebase.

After deploying on Netlify:
- go to **Site → Forms**
- confirm that the hidden form named `dto-request` appears
- submit one live test request

## 8. Deployment options

### Netlify
Recommended if you want both:
- static hosting
- Netlify Forms for `apply.html`

### Vercel / Firebase Hosting
The account + portfolio system works there too, but `apply.html`'s Netlify form workflow will only work on Netlify.

## 9. Smoke test checklist

After deployment:

1. Register a user in `account.html`
2. Verify the email from inbox
3. Login again
4. Confirm `users/{uid}` exists in Firestore
5. Seed one `docs/{ticker}` document
6. Open `portfolio.html`
7. Confirm live balances / docs load
8. Buy one share
9. Confirm:
   - user balance decreases
   - `availableShares` decreases
   - transaction is logged
10. Open `admin.html`
11. Add an `/admins/{uid}` document if needed
12. Approve one pending buyout request

## 10. Important production note

This implementation is fully static and uses serverless cloud services only.

For the **strongest possible anti-manipulation guarantees**, production DTO should eventually move final trade settlement into a serverless trusted layer such as:
- Firebase Callable Functions
- Supabase Edge Functions

That is not required for the site to run, but it is the next step for hardened market security.
