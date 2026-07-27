/* ============================================================
   DTO — SITE CONFIGURATION
   ============================================================
   This is the ONLY file you need to edit to connect the on-site
   request system to your Google Form.

   Step-by-step instructions: see SETUP-GOOGLE-FORM.md

   Until you fill in formId + entry IDs below, submissions are
   blocked on the site. Once connected, requests post straight
   into your Google Form.
   ============================================================ */

window.DTO_CONFIG = {

  /* ---- 1. Your Google Form ID -------------------------------
     From the form's URL:
     https://docs.google.com/forms/d/e/<<<THIS PART>>>/viewform
     Leave as "" only if you want submissions disabled until
     the form is configured.                                     */
  formId: "1FAIpQLScfH4oX7zVdHpvpW1QbHtzyqSfLmyB8cby2hQvo2cGzxMxh3A",

  /* ---- 2. Entry IDs for each question -----------------------
     Run:  python3 tools/get-entry-ids.py <your form URL>
     and paste the output here.                                 */
  entries: {
    requestType:   "entry.656105687",   // Request Type
    name:          "entry.1725491539",   // Name / Handle
    email:         "entry.785274658",   // Contact Email
    contactAlt:    "entry.168688796",   // Discord / other contact
    docName:       "entry.606101997",   // Doc Name
    docLink:       "entry.1592773863",   // Doc Link
    description:   "entry.833256481",   // Description
    askingPrice:   "entry.1832918922",   // Asking Price (USD)
    partners:      "entry.1335171348",   // Partnerships
    notes:         "entry.1443836936",   // Notes
    ticket:        "entry.100421319"    // Ticket ID
  },

  /* ---- 3. Staff contact -------------------------------------- */
  emails: [
    { address: "the.crypt1c.core@gmail.com", note: "Primary — fastest response" },
    { address: "494325@bsd48.org",           note: "Secondary inbox" },
    { address: "Calderman@icloud.com",       note: "Secondary inbox" }
  ],

  /* ---- 4. Public listings source ------------------------------
     The Listings page can pull approved listings directly from a
     public Google Sheet, so staff can publish rows without a site
     redeploy. Keep the header names in that sheet aligned with the
     values below.                                              */
  listings: {
    provider: "google-sheets",
    sheetId: "1A3aUwjhhhj5oHFRhDoOqAj9eFA_m-Hz-8DssDaQSEpM",
    gid: "0",
    headers: {
      name: "Doc Name",
      description: "Description",
      type: "Type",
      doxstox: "DoxStox",
      sharePrice: "Share Price",
      askingPrice: "Asking Price",
      verified: "Verified",
      published: "Published"
    }
  },

  /* ---- 5. Options --------------------------------------------
     Note: doc values are assigned by DTO staff during review.
     There is no public formula and nothing is auto-calculated.   */
  options: {
    feeRate: 0.07,              // DTO transaction fee
    ticketPrefix: "DTO",        // Ticket IDs look like DTO-7F3K2A
    responseTime: "24–48 hours" // Shown on the confirmation screen
  }
};
