# DTO Firebase Functions

## Files
- `src/economy.ts` — `dailyYield` scheduled function + `sessionTracker` callable
- `src/index.ts` — exports
- `package.json` — function dependencies
- `tsconfig.json` — TypeScript compiler config

## Install

```bash
cd firebase/functions
npm install
npm run build
```

## Deploy

```bash
firebase deploy --only functions
```

## Front-end integration notes

### `sessionTracker`
Call as a Firebase Callable Function from the client with one of:

```ts
{ action: 'start', sessionId: 'sess_123', page: 'ticker' }
{ action: 'ping', sessionId: 'sess_123', page: 'ticker', hadActivity: true }
{ action: 'end', sessionId: 'sess_123', page: 'ticker', hadActivity: false }
```

Recommended behavior:
- send `start` once when a tracked page opens
- send `ping` every 30–60 seconds while user is active
- if no mouse/keyboard activity for 2 minutes, stop sending active pings or send `hadActivity: false`
- send `end` on page close/navigation when possible

### `dailyYield`
No client integration required.
It runs on the server once every 24 hours.
