# Methodology

## Principles

1. **Source of truth is the institution's own website.** No comparison sites or aggregators were used as sources. Every value stores the URL it was read from.
2. **Nothing is overwritten.** Every reading is stored as a new, timestamped observation. Observation tables are append-only, enforced by database triggers. Corrections are added as new observations; rejected values are marked in a separate review table and excluded from the dashboard, but stay in the history.
3. **Location is explicit.** Many banks price by market. Each observation records its market (national, a state, or the ZIP code it was captured under).
4. **No personal data.** The collection never signs in, submits applications, or enters personal details. Where a page needed a ZIP code to show rates, a public ZIP (94105, San Francisco) was used.
5. **Rank by the numbers only.** Rankings use a single published figure per product (APY, APR, fee or bonus amount). Nothing else affects order.

## Collection (16 October 2026)

| Step | How |
|---|---|
| Institution list | Selected from FDIC BankFind and NCUA call report rankings (see [sample-set.md](sample-set.md)). |
| Finding rate pages | Web search and a research agent were used to locate each institution's official rate pages. Links outside the institution's own domain were rejected. |
| Reading rates | Plain pages and PDF rate sheets were fetched directly. Pages that load rates with JavaScript were read in a real browser. Where a page required a ZIP code, 94105 was entered. |
| Bulk extraction | For the nine non-CD products, a research agent extracted published terms into a fixed structure. These values are marked **Unverified** in the dashboard unless later re-checked by hand. |
| Storage | Each capture was saved as a JSON file (kept outside this repository) and appended to the SQLite database by the loader scripts in `pipeline/`. |
| Benchmarks | FDIC national average rates (21 Sept 2026) for savings, interest checking, money market and CD terms. |

## Product rules

- **Deposits (CDs, savings, money market):** APY by term and balance tier. Specials and rates that require another account (relationship rates) are labeled; consumers can include or exclude relationship rates.
- **Checking:** monthly fee, fee waiver conditions, minimum opening deposit, overdraft fee, ATM fee reimbursement.
- **Bonuses:** amount, requirements and end date as published. Expired offers were excluded.
- **Auto loans, home equity, personal loans, credit cards:** published APR floors and ranges, fees, intro offers and discounts. "As low as" rates usually assume excellent credit and sometimes autopay; the stated conditions are kept in the notes.
- **Mortgages:** only sample rates the lender publishes with stated assumptions (loan amount, credit score, down payment, points). Lenders that require personal details to show any rate are listed as gaps.

## Verification

- Automated checks on every row: APY between 0% and 7%, APR between 2% and 36% with maximum at or above minimum, a source URL on every row, no duplicate or conflicting values.
- Live re-checks of about 70 values. See [spot-checks.md](spot-checks.md).

## Known limitations

- **Sample, not market.** 59 institutions; results describe this sample only.
- **One-day snapshot.** All values are from 16 October 2026 and will go out of date. The prototype doesn't refresh itself.
- **Geography is approximate.** Large-bank deposit rates were captured for ZIP 94105 (Citizens defaulted to 02919 and KeyBank to 94080). Other markets may see different rates. Region mapping is planned.
- **Published terms, not personal offers.** Loan and card APRs are the published ranges or "as low as" rates; an individual's rate depends on credit and other factors.
- **Unverified values.** Values extracted automatically and not re-checked are labeled. Spot checks found a small number of errors (see spot-checks.md), so unverified values should be treated with care.
- **Gaps.** Some institutions don't publish rates online, require prequalification or personal details, or lend only through dealers. These are listed in `data/coverage_gaps.json` and shown in the bank view.
