#!/usr/bin/env python3
"""Package the site into dto-website.zip for drag-and-drop hosting.

Usage:  python3 make-zip.py

Then drag the resulting dto-website.zip onto https://app.netlify.com/drop
"""
import os
import pathlib
import zipfile

ROOT = pathlib.Path(__file__).parent
OUT = ROOT / "dto-website.zip"

# Files/dirs that belong in the deployed site
INCLUDE_FILES = ["robots.txt", "sitemap.xml", "_headers", "netlify.toml",
                 "vercel.json", ".nojekyll"]
INCLUDE_DIRS = ["assets", "data"]

# Never ship these
SKIP = {".DS_Store", "__pycache__", ".pyc"}


def main():
    if OUT.exists():
        OUT.unlink()

    count = 0
    with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as z:
        for p in sorted(ROOT.glob("*.html")):
            z.write(p, p.name)
            count += 1

        for name in INCLUDE_FILES:
            p = ROOT / name
            if p.exists():
                z.write(p, name)
                count += 1

        for d in INCLUDE_DIRS:
            base = ROOT / d
            if not base.is_dir():
                continue
            for p in sorted(base.rglob("*")):
                if not p.is_file():
                    continue
                if any(s in str(p) for s in SKIP):
                    continue
                rel = p.relative_to(ROOT).as_posix()
                z.write(p, rel)
                count += 1

    size = OUT.stat().st_size / 1024
    print("Created %s" % OUT.name)
    print("  %d files, %.0f KB" % (count, size))
    print()
    print("Next: drag it onto https://app.netlify.com/drop")


if __name__ == "__main__":
    main()
