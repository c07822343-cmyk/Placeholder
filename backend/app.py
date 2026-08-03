from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

import requests
from flask import Flask, jsonify, request, send_from_directory

BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR

AIRTABLE_TOKEN = os.getenv("AIRTABLE_TOKEN", "")
AIRTABLE_BASE_ID = os.getenv("AIRTABLE_BASE_ID", "")
AIRTABLE_TABLE_NAME = os.getenv("AIRTABLE_TABLE_NAME", "DTO Requests")
AIRTABLE_API_URL = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{AIRTABLE_TABLE_NAME}" if AIRTABLE_BASE_ID else ""

app = Flask(__name__, static_folder=None)

REQUIRED_FIELDS = {
    "requestType": "Request Type",
    "name": "Applicant Name",
    "email": "Contact Email",
    "docName": "Doc Name",
    "docLink": "Doc Link",
    "description": "Description",
    "ticket": "Ticket ID",
}

REVIEW_DEFAULTS = {
    "Review Status": "Under Review",
    "Admin Utility": None,
    "Admin Aesthetics": None,
    "Admin Integration": None,
    "Admin Verification Grade": None,
    "Final DoxStox": None,
    "Final Share Price": None,
    "Decision Notes": "",
}


def airtable_ready() -> bool:
    return bool(AIRTABLE_TOKEN and AIRTABLE_BASE_ID and AIRTABLE_TABLE_NAME)


def normalize_request_payload(payload: dict[str, Any]) -> dict[str, Any]:
    errors: list[str] = []
    for key, label in REQUIRED_FIELDS.items():
        if not str(payload.get(key, "")).strip():
            errors.append(label)
    if errors:
        raise ValueError("Missing required fields: " + ", ".join(errors))

    request_type = str(payload.get("requestType", "")).strip()
    asking_price = str(payload.get("askingPrice", "")).strip()
    if request_type == "Full Buyout" and not asking_price:
        raise ValueError("Asking Price is required for Full Buyout requests.")

    fields = {
        "Ticket ID": str(payload.get("ticket", "")).strip(),
        "Request Type": request_type,
        "Applicant Name": str(payload.get("name", "")).strip(),
        "Contact Email": str(payload.get("email", "")).strip(),
        "Contact Alt": str(payload.get("contactAlt", "")).strip(),
        "Doc Name": str(payload.get("docName", "")).strip(),
        "Doc Link": str(payload.get("docLink", "")).strip(),
        "Description": str(payload.get("description", "")).strip(),
        "Asking Price": asking_price,
        "Partnerships": str(payload.get("partners", "")).strip(),
        "Notes": str(payload.get("notes", "")).strip(),
        "Submitted At": str(payload.get("submittedAt", "")).strip(),
        "Raw Request Summary": str(payload.get("requestSummary", "")).strip(),
    }
    fields.update(REVIEW_DEFAULTS)
    return fields


def create_airtable_record(fields: dict[str, Any]) -> dict[str, Any]:
    if not airtable_ready():
        raise RuntimeError("Airtable is not configured. Set AIRTABLE_TOKEN, AIRTABLE_BASE_ID and AIRTABLE_TABLE_NAME.")

    response = requests.post(
        AIRTABLE_API_URL,
        headers={
            "Authorization": f"Bearer {AIRTABLE_TOKEN}",
            "Content-Type": "application/json",
        },
        json={"records": [{"fields": fields}]},
        timeout=20,
    )
    if response.status_code >= 400:
        raise RuntimeError(f"Airtable request failed: {response.status_code} {response.text}")
    return response.json()


@app.get("/api/health")
def health() -> Any:
    return jsonify({
        "ok": True,
        "airtableConfigured": airtable_ready(),
        "table": AIRTABLE_TABLE_NAME,
    })


@app.post("/api/requests")
def submit_request() -> Any:
    try:
        payload = request.get_json(force=True, silent=False) or {}
        fields = normalize_request_payload(payload)
        result = create_airtable_record(fields)
        return jsonify({
            "ok": True,
            "message": "Request submitted to DTO review workspace.",
            "airtable": result,
        })
    except ValueError as exc:
        return jsonify({"ok": False, "error": str(exc)}), 400
    except Exception as exc:  # pragma: no cover - defensive runtime guard
        return jsonify({"ok": False, "error": str(exc)}), 500


@app.get("/")
def root() -> Any:
    return send_from_directory(STATIC_DIR, "index.html")


@app.get("/<path:path>")
def static_proxy(path: str) -> Any:
    target = STATIC_DIR / path
    if target.is_file():
        return send_from_directory(STATIC_DIR, path)
    if "." not in path:
        html = STATIC_DIR / f"{path}.html"
        if html.is_file():
            return send_from_directory(STATIC_DIR, f"{path}.html")
    return send_from_directory(STATIC_DIR, "404.html"), 404


if __name__ == "__main__":
    app.run(debug=True)
