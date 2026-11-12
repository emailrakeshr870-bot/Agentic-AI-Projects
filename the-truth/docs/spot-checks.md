# Spot checks

All checks were run on 16 October 2026, about one to six hours after capture.

## CDs

- Automated checks on all CD rows: pass.
- Statistical outliers (more than 2.5 points from the term average) were reviewed: all were genuine large-bank standard CDs at 0.05–0.25% APY and CIT Bank long terms at 0.40–0.50%.
- Live re-check of Sallie Mae, Popular Direct, Live Oak Bank, CIT Bank and Capital One: **37 of 37 APYs matched**.
- One gap fixed: CIT Bank's $1,000 minimum deposit was missing and was added as a new observation.

## Other products

About 35 automatically extracted values were re-checked against live pages:

| Check | Result |
|---|---|
| SoFi personal loan APR range 6.99–35.49% | Match |
| Wells Fargo personal loan from 6.74%, $3k–$100k, 12–84 months | Match |
| Mountain America: HELOC intro 3.74% then 7.25%, home equity loan 7.24%, 30-yr mortgage 6.375% (6.507% APR), 15-yr 5.625% (5.838% APR), auto from 4.99%, savings 0.05% | Match |
| SchoolsFirst auto loans, 10 rates by term and vehicle | Match (18.00% ceiling added) |
| Truist HELOC intro 5.49% for 9 months, then 7.25–13.85% | Match |
| Ally savings 3.10% | Match |
| Chase Freedom Unlimited and Sapphire Preferred maximum APR | **Mismatch, corrected.** The agent read the 29.99% cap inside Chase's APR formula as the maximum; actual maximums are 27.99% and 27.74%. |
| Live Oak Bank savings | **Wrong source, corrected.** The agent used a look-alike domain (3.9%); the official site shows 4.00%. |
| Suncoast savings 4.50% | **Rejected.** The cited page doesn't exist and the official rates page shows no figure. Flagged and excluded. |
| Citi Double Cash terms | Not verifiable: terms don't render even in a browser. Left marked Unverified. |

## Lessons applied

- Parse issuer APR formulas explicitly; never accept a range without checking which number is the cap.
- Accept sources only on the institution's own verified domain.
- Match every source to the institution's FDIC certificate or NCUA charter, since names collide (Mechanics Bank in California vs Mechanics Cooperative Bank in Massachusetts) and brands change (LendingClub's rate page is now branded Happen Bank).
