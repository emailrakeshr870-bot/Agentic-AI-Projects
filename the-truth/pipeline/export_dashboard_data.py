"""Export the latest observation for every product from the database into
data/dashboard_data.json, the file the dashboard is built from.

Rules:
- Only the most recent capture of each product is shown; history stays in the database.
- Observations flagged as rejected in observation_flags are excluded.
- Coverage gaps (institutions that could not be tracked, and why) come from data/coverage_gaps.json.

Usage: python3 pipeline/export_dashboard_data.py
"""
import json
import sqlite3

from common import DATA, connect


def market(m, inst_state):
    """Normalise the stored market to 'US' (national) or a two-letter state."""
    m = m or ""
    if m in ("", "national"):
        return "US"
    if m.startswith("zip:94"):
        return "CA"
    if m.startswith("zip:02"):
        return "RI"
    if m.startswith("local:"):
        return m.split(":")[1]
    if len(m) == 2:
        return m
    return inst_state or "US"


def main():
    db = connect()
    db.row_factory = sqlite3.Row
    inst = {r["id"]: dict(id=r["id"], name=r["brand"], type=r["type"], seg=r["segment"], state=r["hq_state"],
                          assets=r["total_assets_usd"], pricing=r["pricing_model"])
            for r in db.execute("SELECT * FROM institutions")}
    rejected = {(r[0], r[1]) for r in db.execute("SELECT table_name, observation_id FROM observation_flags WHERE flag='rejected'")}

    def mk_cd(r):
        i = inst[r["institution_id"]]
        m = r["market"] or ""
        if not m and i["pricing"] == "national":
            return "US"
        return market(m, i["state"])

    # CDs: latest row per product key, then keep only the latest capture of each (institution, product, term)
    cd_rows = db.execute("""SELECT * FROM rate_observations WHERE id IN (
        SELECT max(id) FROM rate_observations GROUP BY institution_id, product_name, term_months,
        ifnull(min_deposit_usd,-1), ifnull(max_deposit_usd,-1), is_promo, requires_relationship)""").fetchall()
    cd_rows = [r for r in cd_rows if ("rate_observations", r["id"]) not in rejected]
    latest = {}
    for r in cd_rows:
        k = (r["institution_id"], r["product_name"], r["term_months"])
        latest[k] = max(latest.get(k, ""), r["captured_at"])
    cd = [dict(i=r["institution_id"], p=r["product_name"], t=r["term_months"], apy=r["apy"], mn=r["min_deposit_usd"],
               mx=r["max_deposit_usd"], promo=r["is_promo"], rel=r["requires_relationship"], note=r["notes"], src=r["source_url"],
               at=r["captured_at"], mk=mk_cd(r), zip=r["capture_zip"])
          for r in cd_rows if r["captured_at"] == latest[(r["institution_id"], r["product_name"], r["term_months"])]]

    # Other products: latest row per key; drop products superseded by a later capture
    by_key = {}
    for r in db.execute("SELECT * FROM offer_observations ORDER BY id"):
        if ("offer_observations", r["id"]) in rejected:
            continue
        k = (r["institution_id"], r["product_type"], r["product_name"], r["term_months_min"], r["term_months_max"], r["amount_min"])
        by_key[k] = r
    last_cap = {}
    for r in by_key.values():
        k = (r["institution_id"], r["product_type"], r["product_name"])
        last_cap[k] = max(last_cap.get(k, ""), r["captured_at"])
    offers = []
    for r in by_key.values():
        if r["captured_at"] != last_cap[(r["institution_id"], r["product_type"], r["product_name"])]:
            continue
        o = dict(pt=r["product_type"], i=r["institution_id"], p=r["product_name"], apy=r["apy"], lo=r["apr_min"], hi=r["apr_max"],
                 basis=r["rate_basis"], tmin=r["term_months_min"], tmax=r["term_months_max"], amin=r["amount_min"], amax=r["amount_max"],
                 fee=r["monthly_fee"], waiver=r["fee_waiver"], open=r["min_opening_deposit"], od=r["overdraft_fee"], atm=r["atm_reimbursement"],
                 afee=r["annual_fee"], ofmin=r["origination_fee_min"], ofmax=r["origination_fee_max"], auto=r["autopay_discount"],
                 ia=r["intro_apr"], im=r["intro_months"], pts=r["points"], bamt=r["bonus_amount"], breq=r["bonus_requirement"],
                 bexp=r["bonus_expires"], promo=r["is_promo"], rel=r["requires_relationship"], note=r["notes"], src=r["source_url"],
                 at=r["captured_at"], mk=market(r["market"], inst[r["institution_id"]]["state"]),
                 ver=0 if (r["notes"] or "").startswith("extracted by Exa agent") else 1)
        offers.append({k: v for k, v in o.items() if v is not None})

    bench = [dict(p=r["product"], t=r["term_months"], v=r["value"], kind=r["kind"], asof=r["as_of"], src=r["source_url"])
             for r in db.execute("SELECT * FROM benchmarks WHERE kind='national_rate'")]
    gaps = json.load(open(DATA / "coverage_gaps.json"))
    for i in inst.values():
        i.pop("pricing", None)
    out = dict(generated="2026-10-16", inst=list(inst.values()), cd=cd, offers=offers, bench=bench, gaps=gaps)
    (DATA / "dashboard_data.json").write_text(json.dumps(out, separators=(",", ":")))
    print(f"exported {len(cd)} CD rates, {len(offers)} other offers, {len(inst)} institutions")


if __name__ == "__main__":
    main()
