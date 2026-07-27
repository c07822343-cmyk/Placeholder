/* ============================================================
   DTO — SITE CONFIGURATION
   ============================================================
   This is the ONLY file you need to edit to connect the on-site
   request system to your Google Form.

   Step-by-step instructions: see SETUP-GOOGLE-FORM.md

   Until you fill in formId + entry IDs below, the request form
   still works perfectly — it falls back to opening a prefilled
   email to DTO staff instead of posting to the Form.
   ============================================================ */

window.DTO_CONFIG = {

  /* ---- 1. Your Google Form ID -------------------------------
     From the form's URL:
     https://docs.google.com/forms/d/e/<<<THIS PART>>>/viewform
     Leave as "" to use the email fallback.                     */
  formId: "",

  /* ---- 2. Entry IDs for each question -----------------------
     Run:  python3 tools/get-entry-ids.py <your form URL>
     and paste the output here.                                 */
  entries: {
    requestType:   "",   // Request Type
    name:          "",   // Name / Handle
    email:         "",   // Contact Email
    contactAlt:    "",   // Discord / other contact
    docName:       "",   // Doc Name
    docLink:       "",   // Doc Link
    description:   "",   // Description
    askingPrice:   "",   // Asking Price (USD)
    budget:        "",   // Budget (USD)
    influence:     "",   // Community Influence
    partners:      "",   // Partnerships
    reputation:    "",   // Reputation & History
    growth:        "",   // Recent Growth
    notes:         "",   // Notes
    ticket:        ""    // Ticket ID
  },

  /* ---- 3. Staff contact -------------------------------------- */
  emails: [
    { address: "the.crypt1c.core@gmail.com", note: "Primary — fastest response" },
    { address: "494325@bsd48.org",           note: "Secondary inbox" },
    { address: "Calderman@icloud.com",       note: "Secondary inbox" }
  ],

  /* ---- 4. Options --------------------------------------------
     Note: doc values are assigned by DTO staff during review.
     There is no public formula and nothing is auto-calculated.   */
  options: {
    feeRate: 0.07,              // DTO transaction fee
    ticketPrefix: "DTO",        // Ticket IDs look like DTO-7F3K2A
    responseTime: "24–48 hours" // Shown on the confirmation screen
  }
};
