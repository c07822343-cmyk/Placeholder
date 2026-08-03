# DTO Airtable Review Workspace Setup

DTO request intake can post to Airtable through the alwaysdata Flask backend.
Admins then review, score, accept or deny requests directly inside Airtable.

## Base setup
Create an Airtable base called:

- `DTO Requests`

Create one table called:

- `DTO Requests`

## Required Airtable fields
Use these exact field names and suggested types:

| Field name | Type |
|---|---|
| `Ticket ID` | Single line text |
| `Request Type` | Single select |
| `Applicant Name` | Single line text |
| `Contact Email` | Email |
| `Contact Alt` | Single line text |
| `Doc Name` | Single line text |
| `Doc Link` | URL |
| `Description` | Long text |
| `Asking Price` | Single line text or currency |
| `Partnerships` | Long text |
| `Notes` | Long text |
| `Submitted At` | Date + time |
| `Raw Request Summary` | Long text |
| `Review Status` | Single select |
| `Admin Utility` | Number |
| `Admin Aesthetics` | Number |
| `Admin Integration` | Number |
| `Admin Verification Grade` | Number |
| `Final DoxStox` | Number |
| `Final Share Price` | Number |
| `Decision Notes` | Long text |

## Suggested `Review Status` options
- `Under Review`
- `Needs Info`
- `Accepted`
- `Denied`
- `Added to Market`

## Recommended Airtable views
### 1. New Requests
Filter:
- `Review Status` = `Under Review`

### 2. Accepted
Filter:
- `Review Status` = `Accepted`

### 3. Denied
Filter:
- `Review Status` = `Denied`

### 4. Ready for Market`
Filter:
- `Review Status` = `Added to Market`

## Admin workflow
1. A request is submitted from `apply.html`
2. The alwaysdata backend writes the request into Airtable
3. Staff open Airtable and review the row
4. Staff fill in:
   - `Admin Utility`
   - `Admin Aesthetics`
   - `Admin Integration`
   - `Admin Verification Grade`
   - `Final DoxStox`
   - `Final Share Price`
   - `Decision Notes`
5. Staff set `Review Status` to:
   - `Accepted` or `Denied`
6. If accepted, staff create the market doc from `admin.html`

## Airtable API credentials needed by the backend
You will need:
- Airtable Personal Access Token
- Airtable Base ID
- Airtable Table Name (`DTO Requests`)

These go into alwaysdata environment variables:
- `AIRTABLE_TOKEN`
- `AIRTABLE_BASE_ID`
- `AIRTABLE_TABLE_NAME`
