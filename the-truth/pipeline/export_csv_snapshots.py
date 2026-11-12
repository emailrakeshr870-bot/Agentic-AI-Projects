"""Write one CSV per product (latest values, rejected observations excluded) to data/snapshots/<date>/,
so the data can be read without SQLite.

Usage: python3 pipeline/export_csv_snapshots.py [snapshot-date]
"""
import csv
import sys

from common import DATA, connect

date = sys.argv[1] if len(sys.argv) > 1 else "2026-10-16"
out = DATA / "snapshots" / date
out.mkdir(parents=True, exist_ok=True)
db = connect()
NOT_REJECTED = "id NOT IN (SELECT observation_id FROM observation_flags WHERE table_name='{t}' AND flag='rejected')"

cur = db.execute(f"""SELECT i.brand AS institution, i.segment, i.hq_state, r.product_name, r.term_months, r.apy,
    r.min_deposit_usd, r.max_deposit_usd, r.is_promo, r.requires_relationship, r.market, r.capture_zip, r.notes, r.source_url, r.captured_at
    FROM rate_observations r JOIN institutions i ON i.id = r.institution_id
    WHERE r.{NOT_REJECTED.format(t='rate_observations')} ORDER BY i.brand, r.term_months, r.id""")
with open(out / "cd.csv", "w", newline="") as fh:
    w = csv.writer(fh); w.writerow([c[0] for c in cur.description]); w.writerows(cur.fetchall())

cols = [r[1] for r in db.execute("PRAGMA table_info(offer_observations)") if r[1] not in ("id", "institution_id")]
for (pt,) in db.execute("SELECT DISTINCT product_type FROM offer_observations ORDER BY 1").fetchall():
    cur = db.execute(f"""SELECT i.brand AS institution, i.segment, i.hq_state, {', '.join('o.' + c for c in cols)}
        FROM offer_observations o JOIN institutions i ON i.id = o.institution_id
        WHERE o.product_type = ? AND o.{NOT_REJECTED.format(t='offer_observations')} ORDER BY i.brand, o.id""", (pt,))
    rows = cur.fetchall()
    keep = [k for k, name in enumerate(c[0] for c in cur.description) if any(r[k] is not None for r in rows)]
    with open(out / f"{pt}.csv", "w", newline="") as fh:
        w = csv.writer(fh); w.writerow([cur.description[k][0] for k in keep]); w.writerows([[r[k] for k in keep] for r in rows])
print("wrote", sorted(p.name for p in out.iterdir()))
