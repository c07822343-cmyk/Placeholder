# Google Form questions — copy this exactly

Create the form at <https://forms.new>, title it **DTO Requests**, then add these **16 questions in
this exact order**.

Order matters more than wording — the site maps answers by position and by ID. Keeping the titles
identical makes the auto-mapping script work perfectly, so copy them exactly if you can.

---

## The 16 questions

| # | Question title (copy exactly) | Question type |
|---|---|---|
| 1 | `Request Type` | Short answer |
| 2 | `Name / Handle` | Short answer |
| 3 | `Contact Email` | Short answer |
| 4 | `Discord or other contact` | Short answer |
| 5 | `Doc Name` | Short answer |
| 6 | `Doc Link` | Short answer |
| 7 | `Description` | **Paragraph** |
| 8 | `Asking Price` | Short answer |
| 9 | `Budget` | Short answer |
| 10 | `Influence` | Short answer |
| 11 | `Partners` | Short answer |
| 12 | `Reputation` | Short answer |
| 13 | `Growth` | Short answer |
| 14 | `Estimated DoxStox` | Short answer |
| 15 | `Notes` | **Paragraph** |
| 16 | `Ticket ID` | Short answer |

Only #7 and #15 are **Paragraph**. Everything else is **Short answer**.

---

## Three rules that will break it if ignored

**1. Leave every question NOT required.**
The website validates before submitting. If Google marks a question required and the site sends it
empty (e.g. Budget is blank for a seller), Google rejects the whole submission silently.

**2. Use only Short answer / Paragraph.**
No multiple choice, no dropdowns, no linear scale, no number validation. Those types reject values
that don't match their options exactly. `Request Type` in particular *looks* like it should be
multiple choice — keep it Short answer.

**3. Don't add response validation.**
Skip the ⋮ → "Response validation" option on every question, including `Contact Email`. The site
already checks email and URL formats.

---

## Settings to change

Open the form's **Settings** tab:

| Setting | Set to | Why |
|---|---|---|
| Responses → **Collect email addresses** | **Off** | Forces sign-in otherwise |
| Responses → **Limit to 1 response** | **Off** | Forces sign-in, blocks repeat applicants |
| Responses → **Allow response editing** | Off | Not needed |
| Presentation → **Show progress bar** | Off | Nobody sees the Google form anyway |

If your Google account is through a school or workplace, there will also be a
**"Restrict to users in <your org>"** checkbox — **uncheck it**, or nobody outside your school can
submit.

---

## Check it's public before sending me the link

Open the form link in a **private/incognito window**. If it asks you to sign in, it's still
restricted and the website won't be able to submit to it. Fix the settings above and re-check.

---

## What to send me

Click **Send** → the link tab (🔗) → **Copy**, and paste it to me. It looks like:

```
https://docs.google.com/forms/d/e/1FAIpQLSd.../viewform
```

I'll pull the entry IDs, wire them into `assets/config.js`, test a submission end-to-end, and push.
Then requests from the website land straight in your spreadsheet.

---

## Which questions get filled per request type

Not every request fills every field — that's expected, blanks are normal.

| Field | Stock Listing | Full Buyout | Verified Buyer | Valuation Only |
|---|:-:|:-:|:-:|:-:|
| Request Type | ✅ | ✅ | ✅ | ✅ |
| Name / Handle | ✅ | ✅ | ✅ | ✅ |
| Contact Email | ✅ | ✅ | ✅ | ✅ |
| Discord or other contact | optional | optional | optional | optional |
| Doc Name | ✅ | ✅ | — | ✅ |
| Doc Link | ✅ | ✅ | — | ✅ |
| Description | ✅ | ✅ | ✅ *(what they want to buy)* | ✅ |
| Asking Price | — | ✅ | — | — |
| Budget | — | — | ✅ | — |
| Influence / Partners / Reputation / Growth | ✅ | ✅ | — | ✅ |
| Estimated DoxStox | ✅ | ✅ | — | ✅ |
| Notes | optional | optional | optional | optional |
| Ticket ID | ✅ | ✅ | ✅ | ✅ |

`Description` is reused for buyers — it holds what kind of docs they're hunting for.

---

## After it's connected

In the form's **Responses** tab:

- Click the green **Sheets** icon to pipe everything into a spreadsheet — that becomes your review
  queue. Add your own columns (Status, Verified Score, Assigned To) to the right; new responses
  won't disturb them.
- Click **⋮ → Get email notifications for new responses** so you know the moment someone applies.
