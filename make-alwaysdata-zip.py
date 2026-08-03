#!/usr/bin/env python3
"""Package the project for alwaysdata deployment.

Includes the Flask backend, static site files, and setup docs needed for
Airtable-backed request intake on alwaysdata.
"""
import pathlib
import zipfile

ROOT = pathlib.Path(__file__).parent
OUT = ROOT / "dto-alwaysdata-package.zip"

INCLUDE_FILES = [
    ".gitignore",
    ".nojekyll",
    "404.html",
    "AIRTABLE-REVIEW-SETUP.md",
    "DEPLOY.md",
    "FIREBASE-SETUP.md",
    "README.md",
    "START-HERE.md",
    "UPDATING.md",
    "_headers",
    "account.html",
    "admin.html",
    "apply.html",
    "buyouts.html",
    "doxstox.html",
    "how-it-works.html",
    "index.html",
    "listing-details.html",
    "listings.html",
    "portfolio.html",
    "robots.txt",
    "sitemap.xml",
    "vercel.json",
    "netlify.toml",
]
INCLUDE_DIRS = ["assets", "backend", "alwaysdata", "firebase", "data"]
SKIP_PARTS = {"__pycache__", ".DS_Store", ".git", "node_modules"}


def should_skip(path: pathlib.Path) -> bool:
    parts = set(path.parts)
    return any(part in parts for part in SKIP_PARTS)


def main() -> None:
    if OUT.exists():
        OUT.unlink()

    count = 0
    with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as zf:
        for name in INCLUDE_FILES:
            path = ROOT / name
            if path.is_file():
                zf.write(path, path.relative_to(ROOT).as_posix())
                count += 1

        for dirname in INCLUDE_DIRS:
            base = ROOT / dirname
            if not base.exists():
                continue
            for path in sorted(base.rglob("*")):
                if not path.is_file() or should_skip(path):
                    continue
                zf.write(path, path.relative_to(ROOT).as_posix())
                count += 1

    size_kb = OUT.stat().st_size / 1024
    print(f"Created {OUT.name}")
    print(f"  {count} files, {size_kb:.0f} KB")


if __name__ == "__main__":
    main()
