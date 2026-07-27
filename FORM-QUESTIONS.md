# Google Form questions — copy this exactly

Create the form at <https://forms.new>, title it **DTO Requests**, then add these **15 questions in
this exact order**.

Order matters more than wording — the site maps answers by position and by ID. Keeping the titles
identical makes the auto-mapping script work perfectly, so copy them exactly if you can.

> **Updated:** the old "Estimated DoxStox" question has been removed, and the four stat questions are
> now written answers instead of numbers. Doc values are assigned by DTO staff during review — the
> site never calculates anything.

---

## The 15 questions

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
| 10 | `Community Influence` | **Paragraph** |
| 11 | `Partnerships` | **Paragraph** |
| 12 | `Reputation and History` | **Paragraph** |
| 13 | `Recent Growth` | **Paragraph** |
| 14 | `Notes` | **Paragraph** |
| 15 | `Ticket ID` | Short answer |

**Paragraph:** #7, #10, #11, #12, #13, #14 — six of them.
**Short answer:** #1, #2, #3, #4, #5, #6, #8, #9, #15 — nine of them.

Questions 10–13 receive written descriptions now (e.g. *"Referenced by most study docs, around 4
active partners"*), so they need the room a Paragraph field gives.

---

## Three rules that will break it if ignored

**1. Leave every question NOT required.**
The website validates before submitting. If Google marks a question required and the site sends it
empty (Budget is blank for a seller, Doc Link is blank for a buyer), Google rejects the whole
submission silently.

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
restricted and the website won't be able to submit to it.

---

## What to send me

Click **Send** → the link tab (🔗) → **Copy**, and paste it to me. It looks like:

```
https://docs.google.com/forms/d/e/1FAIpQLSd.../viewform
```

I'll pull the entry IDs, wire them into `assets/config.js`, test a submission end-to-end, and push.

---

## Which questions get filled per request type

Not every request fills every field — blanks are normal and expected.

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
| Community Influence | ✅ | ✅ | — | ✅ |
| Partnerships | optional | optional | — | optional |
| Reputation and History | optional | optional | — | optional |
| Recent Growth | optional | optional | — | optional |
| Notes | optional | optional | optional | optional |
| Ticket ID | ✅ | ✅ | ✅ | ✅ |

`Description` is reused for buyers — it holds what kind of docs they're hunting for.

---

## Reviewing requests

In the form's **Responses** tab:

- Click the green **Sheets** icon to pipe everything into a spreadsheet — that becomes your review
  queue.
- Add your own columns to the right for the values **you** decide:
  **`DoxStox Score`**, **`Share Price (DTC)`**, **`Status`**, **`Reviewed By`**.
  New responses append below without disturbing them.
- Click **⋮ → Get email notifications for new responses** so you know the moment someone applies.

When you've settled on a score, add the doc to `data/listings.json` on the site with the values you
assigned:

```json
{
  "name": "Study Vault",
  "description": "High-traffic notes archive.",
  "type": "stock",
  "doxstox": 1875,
  "sharePrice": 18.75,
  "verified": true,
  "askingPrice": null
}
```

Both `doxstox` and `sharePrice` are yours to set — the site displays exactly what you put there and
calculates nothing. Use `null` for either while review is still pending, and the listing shows
"Pending" / "Not yet set".
