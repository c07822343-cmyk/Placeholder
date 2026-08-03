# DTO on alwaysdata (Flask + Airtable review queue)

This setup keeps the website files in this repository but serves them through a small Flask app on alwaysdata.
The public request wizard (`apply.html`) posts to `/api/requests`, and the backend sends every request into
an **Airtable** base where staff can review, score, accept or deny it.

## What this setup does
- Hosts the website on alwaysdata with Python/Flask
- Uses Airtable as the third-party review workspace
- Lets staff review requests in Airtable instead of juggling raw free-text inboxes
- Keeps request intake separate from the public site

## 1. Create an Airtable base
Create a new Airtable base called **DTO Requests**.
Use a table called **DTO Requests**.

### Recommended Airtable fields
Use these exact field names:

| Field name | Suggested Airtable type |
|---|---|
| `Ticket ID` | Single line text |
| `Request Type` | Single select |
| `Applicant Name` | Single line text |
| `Contact Email` | Email |
| `Contact Alt` | Single line text |
| `Doc Name` | Single line text |
| `Doc Link` | URL |
| `Description` | Long text |
| `Asking Price` | Currency or single line text |
| `Partnerships` | Long text |
| `Notes` | Long text |
| `Submitted At` | Date/time |
| `Raw Request Summary` | Long text |
| `Review Status` | Single select |
| `Admin Utility` | Number |
| `Admin Aesthetics` | Number |
| `Admin Integration` | Number |
| `Admin Verification Grade` | Number |
| `Final DoxStox` | Number |
| `Final Share Price` | Number |
| `Decision Notes` | Long text |

### Suggested `Review Status` options
- `Under Review`
- `Needs Info`
- `Accepted`
- `Denied`
- `Added to Market`

## 2. Create an Airtable token
1. Open Airtable developer/personal access tokens page
2. Create a token with access to the DTO Requests base
3. Copy:
   - Airtable token
   - Airtable base ID
   - table name (`DTO Requests`)

## 3. Upload the repo to alwaysdata
In alwaysdata:
1. Create a Python site / WSGI app
2. Upload this repository to your alwaysdata workspace
3. Put the Flask app inside a Python virtualenv

## 4. Install Python dependencies
Inside the alwaysdata shell:

```bash
cd path/to/project/backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## 5. Configure environment variables in alwaysdata
Set these variables for the WSGI app:

- `AIRTABLE_TOKEN`
- `AIRTABLE_BASE_ID`
- `AIRTABLE_TABLE_NAME=DTO Requests`

## 6. WSGI entrypoint
Point alwaysdata at:

- `backend/wsgi.py`

This exposes:
- `/` → `index.html`
- `/account` or `/account.html`
- `/portfolio.html`
- `/admin.html`
- `/api/health`
- `/api/requests`

## 7. How the request flow works
1. Visitor fills in `apply.html`
2. Front-end posts JSON to `/api/requests`
3. Flask validates the request
4. Flask sends the record to Airtable
5. Staff review in Airtable and set `Review Status`

## 8. Admin review workflow in Airtable
When a new request arrives:
1. Set `Review Status` to `Under Review`
2. Fill in:
   - `Admin Utility`
   - `Admin Aesthetics`
   - `Admin Integration`
   - `Admin Verification Grade`
3. Calculate or input:
   - `Final DoxStox`
   - `Final Share Price`
4. Set final status:
   - `Accepted` or `Denied`
5. If approved and published, create the market doc from `admin.html` on the site

## 9. Quick health test
Visit:

```text
https://yourdomain.example/api/health
```

Expected response:

```json
{
  "ok": true,
  "airtableConfigured": true,
  "table": "DTO Requests"
}
```

## 10. Notes
- This setup replaces the current Netlify Forms request intake path
- Airtable is only the review workspace; Firestore remains the system of record for market docs and trading
- Staff do not need to micro-manage raw submissions inside code once Airtable is connected
