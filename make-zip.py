#!/usr/bin/env python3
"""Rebuild the site and package it into dto-website.zip.

Usage:  python3 make-zip.py

Runs build.py first so the HTML is always current, then zips everything.
Drag the result onto your site's Deploys tab on Netlify to publish an update
without changing your URL.  (Dropping it on app.netlify.com/drop instead would
create a NEW site with a new URL.)
"""
import pathlib
import subprocess
import sys
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
    # Always regenerate the HTML first so the zip can't ship stale pages.
    build = ROOT / "build.py"
    if build.exists():
        print("Rebuilding pages...")
        r = subprocess.run([sys.executable, str(build)], cwd=str(ROOT),
                           capture_output=True, text=True)
        if r.returncode != 0:
            print("build.py failed:\n" + r.stderr)
            sys.exit(1)
        print("  %d pages rebuilt" % r.stdout.count("wrote"))

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
    print("To publish an update WITHOUT changing your URL:")
    print("  app.netlify.com -> your site -> Deploys tab -> drag the zip there")
    print()
    print("(First time only: app.netlify.com/drop, then claim the site.)")


if __name__ == "__main__":
    main()
