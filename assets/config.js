/* ============================================================
   DTO — SITE CONFIGURATION
   ============================================================
   Netlify Forms handles request submissions on the deployed site.
   The settings below cover staff contact, the public listings
   source, and general site options.
   ============================================================ */

window.DTO_CONFIG = {

  /* ---- 1. Request submission provider ----------------------- */
  submissions: {
    provider: 'netlify',
    formName: 'dto-request',
    botField: 'bot-field'
  },

  /* ---- 2. Staff contact ------------------------------------- */
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
      published: 'Published',
      email: 'Email',
      discord: 'Discord',
      docLink: 'Doc Link'
    }
  },

  /* ---- 4. Options -------------------------------------------
     Note: doc values are assigned by DTO staff during review.
     There is no public formula and nothing is auto-calculated. */
  options: {
    feeRate: 0.07,
    ticketPrefix: 'DTO',
    responseTime: '24–48 hours'
  }
};
