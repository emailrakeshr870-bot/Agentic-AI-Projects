CREATE TABLE institutions(
  id INTEGER PRIMARY KEY, name TEXT NOT NULL, brand TEXT, type TEXT NOT NULL,
  segment TEXT, regulator_id TEXT, hq_state TEXT, total_assets_usd INTEGER,
  assets_as_of TEXT, assets_source TEXT, rates_url TEXT, pricing_model TEXT);

CREATE TABLE rate_observations(
  id INTEGER PRIMARY KEY, institution_id INTEGER NOT NULL REFERENCES institutions(id),
  product_name TEXT, term_months INTEGER NOT NULL, apy REAL NOT NULL,
  min_deposit_usd REAL, max_deposit_usd REAL, is_promo INTEGER DEFAULT 0,
  requires_relationship INTEGER DEFAULT 0, notes TEXT,
  source_url TEXT NOT NULL, captured_at TEXT NOT NULL, market TEXT, capture_zip TEXT);

CREATE TABLE collection_log(
  id INTEGER PRIMARY KEY, institution_id INTEGER, captured_at TEXT, status TEXT, detail TEXT, product_type TEXT DEFAULT 'cd');

CREATE TRIGGER no_update_obs BEFORE UPDATE ON rate_observations
BEGIN SELECT RAISE(ABORT,'rate_observations is append-only'); END;

CREATE TRIGGER no_delete_obs BEFORE DELETE ON rate_observations
BEGIN SELECT RAISE(ABORT,'rate_observations is append-only'); END;

CREATE TABLE markets(
  id INTEGER PRIMARY KEY, institution_id INTEGER NOT NULL REFERENCES institutions(id),
  market_code TEXT NOT NULL, description TEXT, sample_zip TEXT,
  discovered_at TEXT, last_verified_at TEXT, UNIQUE(institution_id, market_code));

CREATE TABLE market_coverage(
  market_id INTEGER NOT NULL REFERENCES markets(id), state TEXT NOT NULL, zip_prefix TEXT,
  PRIMARY KEY(market_id, state, zip_prefix));

CREATE VIEW rates_v AS
SELECT r.*, i.brand, i.type, i.segment, i.hq_state, i.total_assets_usd, i.pricing_model,
  COALESCE(r.market, CASE i.pricing_model WHEN 'national' THEN 'national'
                                          WHEN 'local' THEN 'local:'||i.hq_state
                                          ELSE 'unspecified' END) AS market_resolved
FROM rate_observations r JOIN institutions i ON i.id=r.institution_id;

CREATE TABLE offer_observations(
  id INTEGER PRIMARY KEY, institution_id INTEGER NOT NULL REFERENCES institutions(id),
  product_type TEXT NOT NULL CHECK(product_type IN ('savings','money_market','checking','bonus','auto_loan','heloc','personal_loan','credit_card','mortgage')),
  product_name TEXT,
  apy REAL,                       -- deposits
  apr_min REAL, apr_max REAL,     -- loans/cards (single published rate -> apr_min only)
  rate_basis TEXT,                -- e.g. 'as low as', 'range', 'intro', 'prime + 0.25'
  term_months_min INTEGER, term_months_max INTEGER,
  amount_min REAL, amount_max REAL,  -- balance tier (deposits) or loan/credit amount
  credit_tier TEXT, min_credit_score INTEGER,
  monthly_fee REAL, fee_waiver TEXT, min_opening_deposit REAL, overdraft_fee REAL, atm_reimbursement TEXT,
  annual_fee REAL, origination_fee_min REAL, origination_fee_max REAL, autopay_discount REAL,
  intro_apr REAL, intro_months INTEGER, points REAL,
  bonus_amount REAL, bonus_requirement TEXT, bonus_expires TEXT,
  is_promo INTEGER DEFAULT 0, requires_relationship INTEGER DEFAULT 0, notes TEXT,
  market TEXT, capture_zip TEXT, source_url TEXT NOT NULL, captured_at TEXT NOT NULL);

CREATE TRIGGER no_update_offer BEFORE UPDATE ON offer_observations BEGIN SELECT RAISE(ABORT,'offer_observations is append-only'); END;

CREATE TRIGGER no_delete_offer BEFORE DELETE ON offer_observations BEGIN SELECT RAISE(ABORT,'offer_observations is append-only'); END;

CREATE TABLE benchmarks(
  id INTEGER PRIMARY KEY, source TEXT NOT NULL, product TEXT NOT NULL, term_months INTEGER, value REAL NOT NULL,
  kind TEXT, as_of TEXT, source_url TEXT, captured_at TEXT NOT NULL);

CREATE TABLE observation_flags(id INTEGER PRIMARY KEY, table_name TEXT NOT NULL, observation_id INTEGER NOT NULL,
  flag TEXT NOT NULL, reason TEXT, flagged_at TEXT NOT NULL);
