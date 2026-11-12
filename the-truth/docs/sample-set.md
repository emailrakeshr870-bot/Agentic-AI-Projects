# Sample set

The Truth prototype covers **59 institutions**, chosen to test the approach across every type of provider a consumer or bank might compare against. It is **not** a complete or random sample of the US market (about 4,000 FDIC-insured banks and 4,300 federally insured credit unions).

## How institutions were chosen

- **Large national banks** (11): the biggest US banks by assets, plus Discover (now part of Capital One) for credit cards.
- **Regional banks** (9): a spread of regional banks across the Northeast, Midwest, South and West, plus Third Federal for mortgages.
- **Community banks** (6): smaller banks, mostly in California, to test local pricing.
- **Online banks and fintechs** (14): direct banks that often set the high-water mark on deposit rates.
- **Online lenders** (5): non-bank personal loan lenders (Upstart, Upgrade, Best Egg, Avant, Prosper), added for the personal loan product.
- **Credit unions** (14): the largest credit unions by assets, plus Security Service and Redwood.

Asset sizes come from FDIC BankFind (banks) and NCUA call report data (credit unions) as of 30 June 2026, and are listed in [`data/institutions.csv`](../data/institutions.csv).

## Coverage by institution

A ✓ means at least one value was captured for that product on 16 October 2026. A blank means the product isn't offered, the rate isn't published publicly, or it couldn't be read (reasons for each gap are in [`data/coverage_gaps.json`](../data/coverage_gaps.json)).

Key: CD = certificates of deposit · Sav = savings · MM = money market · Chk = checking · Bonus = account-opening bonuses · Auto = auto loans · HE = home equity · PL = personal loans · Card = credit cards · Mtg = mortgages

| Institution | Segment | CD | Sav | MM | Chk | Bonus | Auto | HE | PL | Card | Mtg |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Bank of America | Large national bank |  |  |  | ✓ |  |  |  |  | ✓ |  |
| Capital One | Large national bank | ✓ | ✓ |  | ✓ | ✓ |  |  |  | ✓ |  |
| Chase | Large national bank | ✓ | ✓ |  | ✓ | ✓ | ✓ |  |  | ✓ |  |
| Citi | Large national bank | ✓ |  |  | ✓ |  |  |  | ✓ | ✓ |  |
| Discover | Large national bank |  |  |  |  |  |  |  |  | ✓ |  |
| Fifth Third | Large national bank |  |  |  | ✓ |  |  |  |  |  |  |
| PNC | Large national bank |  |  |  | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |  |
| TD Bank | Large national bank | ✓ |  |  | ✓ | ✓ |  |  | ✓ |  |  |
| Truist | Large national bank | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |  |  |  |
| U.S. Bank | Large national bank | ✓ |  |  | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |  |
| Wells Fargo | Large national bank | ✓ | ✓ |  | ✓ | ✓ |  |  | ✓ | ✓ |  |
| Citizens | Regional bank | ✓ |  |  |  | ✓ |  |  |  |  |  |
| City National Bank | Regional bank | ✓ |  |  |  |  |  |  |  |  |  |
| Frost | Regional bank | ✓ |  |  |  |  | ✓ | ✓ |  |  |  |
| Huntington | Regional bank |  |  |  | ✓ | ✓ | ✓ | ✓ |  |  |  |
| KeyBank | Regional bank | ✓ |  |  | ✓ | ✓ |  |  |  |  |  |
| M&T Bank | Regional bank | ✓ |  |  |  |  |  |  |  |  |  |
| Regions | Regional bank |  |  |  |  |  |  | ✓ | ✓ |  |  |
| Third Federal | Regional bank |  |  |  |  |  |  |  |  |  | ✓ |
| Zions Bank | Regional bank |  |  | ✓ |  |  |  | ✓ |  |  |  |
| Amerant | Community bank | ✓ |  | ✓ |  | ✓ |  |  |  |  |  |
| Apple Bank | Community bank | ✓ | ✓ | ✓ |  |  |  |  |  |  |  |
| Bank of Marin | Community bank |  |  |  |  |  |  |  |  |  |  |
| Fremont Bank | Community bank | ✓ |  |  |  | ✓ |  | ✓ |  |  | ✓ |
| Mechanics Bank | Community bank |  |  | ✓ |  |  |  |  |  |  |  |
| Tri Counties Bank | Community bank | ✓ |  |  |  |  |  |  |  |  |  |
| Ally | Online bank / fintech | ✓ | ✓ | ✓ | ✓ |  |  |  |  |  |  |
| American Express | Online bank / fintech | ✓ | ✓ |  |  |  |  |  |  | ✓ |  |
| Avant | Online lender |  |  |  |  |  |  |  | ✓ |  |  |
| Axos | Online bank / fintech |  |  |  |  | ✓ |  |  |  |  |  |
| Barclays US | Online bank / fintech | ✓ | ✓ |  |  | ✓ |  |  |  |  |  |
| Best Egg | Online lender |  |  |  |  |  |  |  | ✓ |  |  |
| Bread Savings | Online bank / fintech | ✓ | ✓ |  |  |  |  |  |  |  |  |
| CIT Bank | Online bank / fintech | ✓ | ✓ |  |  |  |  |  |  |  |  |
| EverBank | Online bank / fintech | ✓ | ✓ | ✓ |  |  |  |  |  |  |  |
| LendingClub | Online bank / fintech |  |  |  |  |  |  |  | ✓ |  |  |
| Live Oak Bank | Online bank / fintech | ✓ | ✓ |  |  | ✓ |  |  |  |  |  |
| Marcus by Goldman Sachs | Online bank / fintech | ✓ | ✓ |  |  |  |  |  |  |  |  |
| Popular Direct | Online bank / fintech | ✓ | ✓ |  |  |  |  |  |  |  |  |
| Prosper | Online lender |  |  |  |  |  |  |  | ✓ |  |  |
| Sallie Mae | Online bank / fintech | ✓ | ✓ | ✓ |  |  |  |  |  |  |  |
| SoFi | Online bank / fintech |  | ✓ |  | ✓ | ✓ |  |  | ✓ |  |  |
| Synchrony | Online bank / fintech | ✓ | ✓ | ✓ |  |  |  |  |  |  |  |
| Upgrade | Online lender |  |  |  |  |  |  |  | ✓ |  |  |
| Upstart | Online lender |  |  |  |  |  |  |  | ✓ |  |  |
| Alliant | Credit union | ✓ | ✓ |  | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| America First | Credit union | ✓ | ✓ |  |  | ✓ | ✓ | ✓ | ✓ |  | ✓ |
| BECU | Credit union | ✓ |  | ✓ |  | ✓ | ✓ | ✓ | ✓ | ✓ |  |
| First Tech | Credit union | ✓ | ✓ |  |  | ✓ | ✓ | ✓ |  |  | ✓ |
| Golden 1 | Credit union |  |  |  |  | ✓ | ✓ | ✓ | ✓ |  | ✓ |
| Mountain America | Credit union | ✓ | ✓ | ✓ |  | ✓ | ✓ | ✓ | ✓ |  | ✓ |
| Navy Federal | Credit union | ✓ | ✓ | ✓ |  | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| PenFed | Credit union | ✓ | ✓ | ✓ |  |  |  | ✓ |  |  |  |
| RBFCU | Credit union | ✓ |  |  |  |  | ✓ |  |  |  |  |
| Redwood CU | Credit union | ✓ |  |  |  |  | ✓ | ✓ |  |  |  |
| SECU | Credit union | ✓ | ✓ | ✓ | ✓ |  | ✓ |  |  |  |  |
| SchoolsFirst | Credit union | ✓ | ✓ | ✓ |  |  | ✓ | ✓ | ✓ |  | ✓ |
| Security Service | Credit union |  | ✓ |  |  |  |  |  |  |  |  |
| Suncoast | Credit union |  |  |  |  |  | ✓ |  |  |  |  |
