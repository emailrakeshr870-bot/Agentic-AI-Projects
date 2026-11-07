"""Create a new, empty database from data/schema.sql and seed it with the sample institutions
in data/institutions.csv. Use this to start your own collection without the October 2026 snapshot.

Usage: python3 pipeline/create_empty_db.py path/to/new.db
"""
import csv
import pathlib
import sqlite3
import sys

from common import DATA

if len(sys.argv) != 2:
    raise SystemExit(__doc__)
target = pathlib.Path(sys.argv[1])
if target.exists():
    raise SystemExit(f"{target} already exists; refusing to overwrite (observations are append-only by design).")
db = sqlite3.connect(target)
db.executescript((DATA / "schema.sql").read_text())
with open(DATA / "institutions.csv", newline="") as fh:
    rows = list(csv.DictReader(fh))
cols = list(rows[0].keys())
db.executemany(f"INSERT INTO institutions({','.join(cols)}) VALUES({','.join('?' * len(cols))})",
               [[r[c] or None for c in cols] for r in rows])
db.commit()
print(f"created {target} with {len(rows)} institutions")
