#!/usr/bin/env python3
"""
Pull the entry IDs out of a Google Form so you can paste them into
assets/config.js.

Usage:
    python3 tools/get-entry-ids.py "https://docs.google.com/forms/d/e/1FAI.../viewform"

The form must be set to "Anyone can respond" (no sign-in required).
"""
import json
import re
import sys
import urllib.request

UA = "Mozilla/5.0 (compatible; DTO-setup/1.0)"

# Question title -> config.js key. Matching is case-insensitive substring.
HINTS = [
    ("request type",  "requestType"),
    ("name / handle", "name"),
    ("your name",     "name"),
    ("handle",        "name"),
    ("contact email", "email"),
    ("email",         "email"),
    ("discord",       "contactAlt"),
    ("doc name",      "docName"),
    ("doc link",      "docLink"),
    ("description",   "description"),
    ("asking price",  "askingPrice"),

    ("partnership",   "partners"),
    ("partner",       "partners"),
    ("note",          "notes"),
    ("ticket",        "ticket"),
]


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", "replace")


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    url = sys.argv[1].strip()

    m = re.search(r"/forms/d/e/([A-Za-z0-9_-]+)", url)
    if not m:
        m = re.search(r"/forms/d/([A-Za-z0-9_-]+)", url)
    form_id = m.group(1) if m else None

    if "viewform" not in url:
        url = url.rstrip("/") + "/viewform"

    print("Fetching form…")
    try:
        html = fetch(url)
    except Exception as e:
        print("ERROR: could not fetch the form: %s" % e)
        print("Make sure the form is public ('Anyone can respond').")
        sys.exit(1)

    m = re.search(r"FB_PUBLIC_LOAD_DATA_\s*=\s*(\[.*?\]);\s*</script>", html, re.S)
    if not m:
        print("ERROR: could not find form data. Is the form public?")
        sys.exit(1)

    data = json.loads(m.group(1))

    try:
        items = data[1][1]
    except Exception:
        print("ERROR: unexpected form structure.")
        sys.exit(1)

    found = []
    for it in items:
        try:
            title = (it[1] or "").strip()
            entry = it[4][0][0]
        except Exception:
            continue
        found.append((title, "entry.%s" % entry))

    if not found:
        print("No questions found on that form.")
        sys.exit(1)

    print("\nQuestions found\n" + "-" * 60)
    for title, entry in found:
        print("  %-38s %s" % (title[:38], entry))

    # Try to auto-map
    mapping = {}
    for title, entry in found:
        low = title.lower()
        for hint, key in HINTS:
            if hint in low and key not in mapping:
                mapping[key] = entry
                break

    keys = ["requestType", "name", "email", "contactAlt", "docName", "docLink",
            "description", "askingPrice", "partners",
            "notes", "ticket"]

    print("\n" + "=" * 60)
    print("Paste this into assets/config.js")
    print("=" * 60 + "\n")
    print("  formId: \"%s\"," % (form_id or "PASTE_FORM_ID"))
    print("\n  entries: {")
    for i, k in enumerate(keys):
        val = mapping.get(k, "")
        comma = "," if i < len(keys) - 1 else ""
        flag = "" if val else "   // <-- not matched, fill manually"
        print("    %-14s \"%s\"%s%s" % (k + ":", val, comma, flag))
    print("  },")

    missing = [k for k in keys if k not in mapping]
    if missing:
        print("\nNote: could not auto-match: %s" % ", ".join(missing))
        print("Match them by hand from the question list above.")
    print()


if __name__ == "__main__":
    main()
