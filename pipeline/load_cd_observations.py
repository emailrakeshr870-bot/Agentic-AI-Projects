"""Append CD rate observations from JSON capture files.

Usage: python3 pipeline/load_cd_observations.py data/raw/cd/<file>.json [...]
JSON: {"brand":..., "source_url":..., "page_as_of":..., "rows":[{term_months, apy, min, max, product, promo, rel, notes}]}"""
import json, sys
from common import connect, utc_now

db = connect()
now = utc_now()
for path in sys.argv[1:]:
    d = json.load(open(path))
    iid = db.execute("SELECT id FROM institutions WHERE brand=?", (d["brand"],)).fetchone()[0]
    if d.get("source_url") and not d.get("skip_url_update"):
        db.execute("UPDATE institutions SET rates_url=? WHERE id=?", (d["source_url"], iid))
    for r in d.get("rows", []):
        note = r.get("notes") or ""
        if d.get("page_as_of"): note = (note + "; " if note else "") + "page rates as of " + d["page_as_of"]
        db.execute("""INSERT INTO rate_observations(institution_id,product_name,term_months,apy,min_deposit_usd,
            max_deposit_usd,is_promo,requires_relationship,notes,source_url,captured_at,market,capture_zip) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (iid, r.get("product"), r["term_months"], r["apy"], r.get("min"), r.get("max"),
             int(r.get("promo",0)), int(r.get("rel",0)), note or None, r.get("source_url", d["source_url"]), now, r.get("market", d.get("market")), r.get("capture_zip", d.get("capture_zip"))))
    db.execute("INSERT INTO collection_log(institution_id,captured_at,status,detail) VALUES(?,?,?,?)",
               (iid, now, d.get("status","ok"), d.get("detail")))
    print(d["brand"], len(d.get("rows",[])), "rows", d.get("status","ok"))
db.commit()
