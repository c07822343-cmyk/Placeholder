/* ============================================================
   DTO — SITE CONFIGURATION
   ============================================================
   Netlify Forms handles request submissions on the deployed site.
   The settings below cover staff contact, the public listings
   source, and general site options.
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
    provider: 'netlify',
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
     The Listings page pulls approved listings directly from a
     public Google Sheet, so staff can publish rows without a site
     redeploy. Keep the header names in that sheet aligned with the
     values below.                                              */
  listings: {
    provider: 'google-sheets',
    sheetId: '1A3aUwjhhhj5oHFRhDoOqAj9eFA_m-Hz-8DssDaQSEpM',
    gid: '0',
    headers: {
      name: 'Doc Name',
      description: 'Description',
      type: 'Type',
      doxstox: 'DoxStox',
      sharePrice: 'Share Price',
      askingPrice: 'Asking Price',
      verified: 'Verified',
      status: 'Status',
      published: 'Published',
      email: 'Email',
      discord: 'Discord',
      docLink: 'Doc Link'
    }
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
