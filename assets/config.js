/* ============================================================
   DTO — SITE CONFIGURATION
   ============================================================
   The live site can run behind a small Flask backend on alwaysdata.
   Request submissions post to a backend endpoint, which forwards
   them into an Airtable review workspace for staff processing.
   ============================================================ */

window.DTO_CONFIG = {

  /* ---- 1. Firebase / serverless app config ------------------
     Fill this with your Firebase web app credentials.
     The account + trading system remains static because Firebase
     provides Auth + Firestore as serverless services.          */
  firebase: {
    apiKey: 'AIzaSyBbbjPtQhmh5rQf7pn7Wjtl8I3r9eZLx_g',
    authDomain: 'dto-official.firebaseapp.com',
    projectId: 'dto-official',
    appId: '1:819752098156:web:29f8aa244db48391aa3b49',
    storageBucket: 'dto-official.firebasestorage.app',
    messagingSenderId: '819752098156',
    measurementId: 'G-B9H9MWQZ20'
  },

  /* ---- 1b. App-level trading settings ----------------------- */
  app: {
    highValueThreshold: 5000,
    dtoFeeRate: 0.07,
    bootstrapAdminEmails: ['c07822343@gmail.com', 'the.crypt1c.core@gmail.com']
  },

  /* ---- 2. Request submission provider ----------------------- */
  submissions: {
    provider: 'alwaysdata-airtable',
    endpoint: '/api/requests',
    formName: 'dto-request',
    botField: 'bot-field'
  },

  /* ---- 3. Staff contact ------------------------------------- */
  emails: [
    { address: 'the.crypt1c.core@gmail.com', note: 'Primary — fastest response' },
    { address: '494325@bsd48.org',           note: 'Secondary inbox' },
    { address: 'Calderman@icloud.com',       note: 'Secondary inbox' }
  ],

  /* ---- 3. Public listings source ----------------------------
     Public listings, listing details and the trading dashboard
     all read directly from Firestore `docs` records now.
     No Google Sheet is required.                               */
  listings: {
    provider: 'firestore',
    collection: 'docs'
  },

  /* ---- 4. Options -------------------------------------------
     The site can calculate DoxStox and share price from the new
     quality-first rubric when staff provide the four tier values.
     Staff still assign and review everything manually.           */
  options: {
    feeRate: 0.07,
    ticketPrefix: 'DTO',
    responseTime: '24–48 hours'
  }
};
