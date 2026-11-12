# Data dictionary

Database: `data/the_truth.db` (SQLite). Schema: `data/schema.sql`. The CSVs in `data/snapshots/` contain the same observations joined to institution names.

## `benchmarks`

Official reference rates: FDIC national rates and national rate caps.

| Column | Type | Meaning |
|---|---|---|
| `id` | INTEGER |  |
| `source` | TEXT |  |
| `product` | TEXT |  |
| `term_months` | INTEGER | CD term in months |
| `value` | REAL |  |
| `kind` | TEXT |  |
| `as_of` | TEXT |  |
| `source_url` | TEXT | Page the value was read from |
| `captured_at` | TEXT | UTC time the value was read |

## `collection_log`

One row per capture attempt, including failures (status such as needs_zip, page_moved, not_published).

| Column | Type | Meaning |
|---|---|---|
| `id` | INTEGER |  |
| `institution_id` | INTEGER |  |
| `captured_at` | TEXT | UTC time the value was read |
| `status` | TEXT |  |
| `detail` | TEXT |  |
| `product_type` | TEXT |  |

## `institutions`

The sample of 59 institutions with FDIC/NCUA identity and asset size.

| Column | Type | Meaning |
|---|---|---|
| `id` | INTEGER |  |
| `name` | TEXT |  |
| `brand` | TEXT |  |
| `type` | TEXT |  |
| `segment` | TEXT | large national, regional, community, online/fintech, credit union |
| `regulator_id` | TEXT | FDIC certificate number (banks) |
| `hq_state` | TEXT |  |
| `total_assets_usd` | INTEGER | Total assets in US dollars |
| `assets_as_of` | TEXT |  |
| `assets_source` | TEXT |  |
| `rates_url` | TEXT |  |
| `pricing_model` | TEXT | national, regional or local |

## `market_coverage`

States or ZIP prefixes each market covers (for future region mapping).

| Column | Type | Meaning |
|---|---|---|
| `market_id` | INTEGER |  |
| `state` | TEXT |  |
| `zip_prefix` | TEXT |  |

## `markets`

Pricing regions discovered for banks that price by market (started with Chase California).

| Column | Type | Meaning |
|---|---|---|
| `id` | INTEGER |  |
| `institution_id` | INTEGER |  |
| `market_code` | TEXT |  |
| `description` | TEXT |  |
| `sample_zip` | TEXT |  |
| `discovered_at` | TEXT |  |
| `last_verified_at` | TEXT |  |

## `observation_flags`

Review decisions on individual observations (for example 'rejected' with a reason). Used to exclude bad values without deleting history.

| Column | Type | Meaning |
|---|---|---|
| `id` | INTEGER |  |
| `table_name` | TEXT |  |
| `observation_id` | INTEGER |  |
| `flag` | TEXT |  |
| `reason` | TEXT |  |
| `flagged_at` | TEXT |  |

## `offer_observations`

Every reading for the other nine products (savings, money market, checking, bonus, auto_loan, heloc, personal_loan, credit_card, mortgage). Append-only; unused columns are null for a given product.

| Column | Type | Meaning |
|---|---|---|
| `id` | INTEGER |  |
| `institution_id` | INTEGER |  |
| `product_type` | TEXT |  |
| `product_name` | TEXT |  |
| `apy` | REAL | Annual percentage yield, % |
| `apr_min` | REAL | Lowest published APR, % (or the single sample APR) |
| `apr_max` | REAL | Highest published APR, % |
| `rate_basis` | TEXT | How the rate is published, e.g. 'as low as', 'range', 'sample; rate 6.75%' |
| `term_months_min` | INTEGER | Shortest term the rate applies to |
| `term_months_max` | INTEGER | Longest term the rate applies to |
| `amount_min` | REAL | Minimum balance tier or loan/line amount |
| `amount_max` | REAL | Maximum balance tier or loan/line amount |
| `credit_tier` | TEXT |  |
| `min_credit_score` | INTEGER |  |
| `monthly_fee` | REAL | Account monthly fee in dollars |
| `fee_waiver` | TEXT |  |
| `min_opening_deposit` | REAL |  |
| `overdraft_fee` | REAL | Per-item overdraft fee in dollars |
| `atm_reimbursement` | TEXT |  |
| `annual_fee` | REAL | Card annual fee in dollars |
| `origination_fee_min` | REAL | Lowest origination fee, % of loan |
| `origination_fee_max` | REAL | Highest origination fee, % of loan |
| `autopay_discount` | REAL | APR discount for autopay, percentage points |
| `intro_apr` | REAL | Introductory APR, % |
| `intro_months` | INTEGER | Length of intro period |
| `points` | REAL | Mortgage discount points (negative = lender credit) |
| `bonus_amount` | REAL | Bonus in dollars |
| `bonus_requirement` | TEXT |  |
| `bonus_expires` | TEXT |  |
| `is_promo` | INTEGER | 1 for specials and limited-time offers |
| `requires_relationship` | INTEGER | 1 if another account (e.g. checking) is required for this rate |
| `notes` | TEXT | Conditions and provenance. Values beginning 'extracted by Exa agent' are unverified |
| `market` | TEXT | 'national', a state code, 'local:XX', or 'zip:NNNNN' |
| `capture_zip` | TEXT | ZIP entered on the site when capturing, if any |
| `source_url` | TEXT | Page the value was read from |
| `captured_at` | TEXT | UTC time the value was read |

## `rate_observations`

Every CD rate reading. Append-only.

| Column | Type | Meaning |
|---|---|---|
| `id` | INTEGER |  |
| `institution_id` | INTEGER |  |
| `product_name` | TEXT |  |
| `term_months` | INTEGER | CD term in months |
| `apy` | REAL | Annual percentage yield, % |
| `min_deposit_usd` | REAL | Minimum deposit for this rate |
| `max_deposit_usd` | REAL | Maximum deposit for this tier |
| `is_promo` | INTEGER | 1 for specials and limited-time offers |
| `requires_relationship` | INTEGER | 1 if another account (e.g. checking) is required for this rate |
| `notes` | TEXT | Conditions and provenance. Values beginning 'extracted by Exa agent' are unverified |
| `source_url` | TEXT | Page the value was read from |
| `captured_at` | TEXT | UTC time the value was read |
| `market` | TEXT | 'national', a state code, 'local:XX', or 'zip:NNNNN' |
| `capture_zip` | TEXT | ZIP entered on the site when capturing, if any |

## Views

`rates_v`: CD observations joined to institution details, with a resolved market for older rows captured before the market column existed.
