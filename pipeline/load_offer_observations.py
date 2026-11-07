"""Append observations for non-CD products (savings, checking, loans, cards...) from JSON capture files.

Usage: python3 pipeline/load_offer_observations.py data/raw/offers/<file>.json [...]
JSON: {brand, product_type, source_url, page_as_of?, market?, capture_zip?, status?, detail?, rows:[{...offer columns}]}
Unknown brands are created as institutions when 'new_inst' is given: {name, type, segment, hq_state}."""
import json, sys
from common import connect, utc_now

db = connect()
now = utc_now()
COLS=[r[1] for r in db.execute("pragma table_info(offer_observations)")][1:]
for path in sys.argv[1:]:
    docs=json.load(open(path)); docs=docs if isinstance(docs,list) else [docs]
    for d in docs:
        row=db.execute("SELECT id FROM institutions WHERE brand=?", (d["brand"],)).fetchone()
        if not row:
            n=d.get("new_inst") or {}
            db.execute("INSERT INTO institutions(name,brand,type,segment,hq_state,pricing_model) VALUES(?,?,?,?,?,?)",
                (n.get("name",d["brand"]),d["brand"],n.get("type","nonbank lender"),n.get("segment","online/fintech"),n.get("hq_state"),"national"))
            row=db.execute("SELECT id FROM institutions WHERE brand=?", (d["brand"],)).fetchone()
        iid=row[0]; n=0
        for r in d.get("rows",[]):
            v=dict(r); v.setdefault("product_type",d["product_type"]); v["institution_id"]=iid
            v.setdefault("source_url",d["source_url"]); v["captured_at"]=now
            v.setdefault("market",d.get("market")); v.setdefault("capture_zip",d.get("capture_zip"))
            if d.get("page_as_of"): v["notes"]=((v.get("notes")+"; ") if v.get("notes") else "")+"page as of "+d["page_as_of"]
            bad=set(v)-set(COLS)
            if bad: raise SystemExit(f"{d['brand']}: unknown fields {bad}")
            ks=list(v); db.execute(f"INSERT INTO offer_observations({','.join(ks)}) VALUES({','.join('?'*len(ks))})",[v[k] for k in ks]); n+=1
        db.execute("INSERT INTO collection_log(institution_id,captured_at,status,detail,product_type) VALUES(?,?,?,?,?)",
                   (iid,now,d.get("status","ok"),d.get("detail"),d["product_type"]))
        print(f"{d['brand']:<22} {d['product_type']:<14} {n:>3} rows {d.get('status','ok')}")
db.commit()
