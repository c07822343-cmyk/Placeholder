# Connecting the request system to your Google Form

The **Apply** page has a built-in request wizard. Visitors never see or touch Google Forms — they
fill in a form styled like the rest of the site, and their answers land as rows in your Google
Sheet, ready to review.

**It already works right now.** Until you complete the steps below, submissions open a prefilled
email to staff instead. Wiring up the Form is optional but strongly recommended — a spreadsheet is
far easier to work through than an inbox.

Total time: about 10 minutes, one time only.

---

> **Just need the question list to build the form?** See
> **[`FORM-QUESTIONS.md`](FORM-QUESTIONS.md)** — it's the copy-paste version of Step 1.

## Step 1 — Create the Google Form

Go to <https://forms.new> and create a form called **DTO Requests**.

Add the **11 questions** listed in **[`FORM-QUESTIONS.md`](FORM-QUESTIONS.md)** — that file has the
exact titles and field types to copy.

Three rules that will silently break submissions:

- **Leave every question NOT required** — the site legitimately sends some fields blank
- **Short answer / Paragraph types only** — no multiple choice, dropdowns or number validation
- **No response validation** on any question, including the email one

### Two settings to check

In the form's **Settings** tab:

- **Responses → Collect email addresses:** OFF
- **Responses → Limit to 1 response:** OFF (this would require sign-in and block everyone)

---

## Step 2 — Make the form public

Click **Send** → the **link** tab (🔗) → copy the URL.

If your Google account belongs to a school or workplace, you'll also see a
*"Restrict to users in <your org>"* checkbox in Settings — **uncheck it**, or nobody outside your
organisation can submit.

Test it: open the link in a private/incognito window. If it asks you to sign in, it is still
restricted and the website won't be able to submit to it.

---

## Step 3 — Get the entry IDs

Every question has a hidden ID like `entry.123456789`. Run the included helper with your form link:

```bash
python3 tools/get-entry-ids.py "https://docs.google.com/forms/d/e/1FAIpQLS.../viewform"
```

It prints a ready-to-paste config block, for example:

```
Questions found
------------------------------------------------------------
  Request Type                           entry.1845309572
  Name / Handle                          entry.209382743
  ...

============================================================
Paste this into assets/config.js
============================================================

  formId: "1FAIpQLSdXXXXXXXXXXXXXXXXXXXXXXXX",

  entries: {
    requestType:   "entry.1845309572",
    name:          "entry.209382743",
    ...
  },
```

<details>
<summary>Manual method, if the script can't reach your form</summary>

Open the form's public link, right-click → **View page source**, and search for `entry.`. Each
question appears as `"entry.123456789"` in the order the questions are listed. Match them up by
position.

</details>

---

## Step 4 — Paste into `assets/config.js`

Open `assets/config.js` and replace the empty `formId` and `entries` values with what the script
printed. That's the only file you need to change.

Commit and push:

```bash
git add assets/config.js
git commit -m "Connect request form to Google Form"
git push origin arena/019fa143-placeholder
```

Your host redeploys automatically within about a minute.

---

## Step 5 — Test it

1. Open your live site → **Apply**
2. Submit a request with obviously fake details (e.g. name "TEST")
3. Open your Google Form → **Responses** tab — the row should be there

In the Responses tab click the green **Sheets** icon to send everything into a spreadsheet. That
spreadsheet becomes your review queue: add your own columns like *Status*, *Verified Score* and
*Assigned To* off to the right — Google Forms will keep appending new rows without disturbing them.

Delete your test row when you're done.

---

## Getting notified of new requests

In the **Responses** tab, click the **⋮** menu → **Get email notifications for new responses**.
You'll get an email the moment somebody applies.

---

## How it works under the hood

The wizard posts the answers to your form's `/formResponse` endpoint using `fetch` with
`mode: "no-cors"`. This is the standard technique for putting a custom front-end on a Google Form.
Two consequences worth knowing:

- **The browser can't read Google's reply.** The site therefore shows its success screen as soon as
  the request is sent. If a submission ever fails silently, the visitor still has their ticket ID and
  the "Email staff directly" button on the success screen as a backup.
- **It stays free forever.** No server, no database, no third-party form service, no usage limits
  that matter — Google Forms accepts effectively unlimited responses at no cost.

## Troubleshooting

| Symptom | Cause & fix |
|---|---|
| No responses appear | `formId` or the entry IDs are wrong. Re-run the helper script. |
| Some columns are empty | Those specific entry IDs are mismatched — check them against the question order. |
| Nothing works, form asks for sign-in | The form is restricted. Turn off "Limit to 1 response" and any organisation restriction. |
| Submissions open an email instead | `formId` is still `""` in `assets/config.js`. |

## Alternatives

If you'd rather not use Google Forms, the same wizard can post to any endpoint that accepts a form
POST. **Formspree**, **Web3Forms** and **Netlify Forms** all have free tiers — swap the URL and
field names in `assets/requests.js` (the `payload()` and `submit()` functions). Tell me and I'll
wire one up.
