# Adaptive Next-Best-Action Framework

A lifecycle framework for small-business lending products (lines of credit, term loans, business credit cards) using owned channels: in-product, email, push and SMS.

## Thesis

Static journeys send on a schedule. Adaptive journeys listen. After every interaction the engine chooses the right next touch, or decides not to touch at all. The goal is **incremental, risk-adjusted value**, not applications or clicks.

## The adaptive loop

1. **Sense:** capture every click, dismissal, visit, application step and non-response window.
2. **Interpret:** update the customer's state: intent, channel affinity, timing, likely concern, fatigue, opt-out risk.
3. **Decide:** pick channel, time and message, or deliberately wait.
4. **Act:** send within caps and consent.
5. **Observe:** wait out the response window and record what did and didn't happen.

Triggers (a new cash gap, a started application, a risk event) can interrupt the loop at any time.

## Decision engine

| Step | What happens |
|---|---|
| Eligibility gate | Risk-approved eligibility, suppressions (delinquency, hardship, recent decline, snooze), consent, weekly cap |
| Candidates | Every consented channel at every allowed hour, plus "wait" |
| Score | Uplift × risk-adjusted value, timed to the customer's rhythm and business calendar, minus cadence, fatigue and opt-out costs |
| Arbitrate | Highest net value wins the slot across products and services |
| Execute & learn | Bandit over approved creative; measured against a holdout |

## Channels

| Channel | Requirement | Best use |
|---|---|---|
| In-product | Logged in | Discovery at the moment of need (main channel) |
| Email | CAN-SPAM opt-out honored | Education, nurture, abandonment recovery |
| Push | App opt-in | Time-sensitive steps: approved, funds ready, card ready |
| SMS | Prior express written consent for marketing (TCPA) | Highest-intent moments and servicing; quiet hours |

## Stage playbooks

### 1. Acquisition (prequalified → applied → approved)

North star: incremental funded dollars per 1,000 eligible customers.

| Strategy group | Who | Default next-best action |
|---|---|---|
| High-need prequalified | Forecast cash gap in 30–45 days | Cash-flow page card, then email, then push |
| Invoice-heavy | Large unpaid invoices | Invoice-advance prompt on the Invoices page |
| Growth mode | Revenue up, hiring, big purchases | Term loan "fund your growth" with payment examples |
| Seasonal | History of a seasonal dip | Line-of-credit message 30–45 days before the dip |
| Browser | Viewed lending page, didn't apply | Objection handling: soft pull, no fees, fast decision |
| Card: other cards | Bank feed shows other-issuer payments | Expenses page: 2% back plus auto-categorization |
| Not yet eligible | Below thresholds | No credit offer; business-health content |
| Recently declined | Cooling-off period | Suppress; route to a partner marketplace |

### 2. Onboarding (accepted → funded / card in wallet)

Verification nudges, "funds arrived" push, repayment schedule and autopay, recording the loan in the books, adding the virtual card to a wallet. Autopay is a portfolio-health lever.

### 3. Activation (first draw, first payment, first spend)

Line of credit approved but never drawn: prompt only on a need trigger. First payment: reminder 5 days before; if a shortfall is forecast, hand off to Servicing. Card: first-spend nudges and a bonus progress tracker, tested against a holdout on month 4–6 spend, not just bonus completion.

### 4. Utilization

Invoice-advance prompts for healthy repeat drawers; suppress draw promotion when utilization is high and cash flow is worsening. Card: move recurring vendor bills to the card, issue employee cards, earn more back on platform subscriptions. Credit-line increases and pricing are Risk's decision.

### 5. Retention

Renewal for good-standing term loans (as Risk allows), line-of-credit prequalification after payoff, rewards recaps after a card bonus, dormancy win-back. Any risk signal stops promotion and hands off to Servicing.

## How responses reshape each stage

| Stage | Engaged → next touch | Silent or negative → next touch |
|---|---|---|
| Acquisition | Calculator viewed twice → shorter cadence | 3 ignored impressions → new surface, then pause |
| Onboarding | Opens funding email → autopay prompt same day | Verification not done in 24 h → push, then servicing SMS |
| Activation | Card added to wallet → "3 bills to move" email | No spend by day 3 → push; day 7 bonus tracker email |
| Utilization | Draws after invoice prompt → repeat on next large invoice | Ignores 3 draw prompts → need-triggered prompts only |
| Retention | Opens rewards recap → offer employee cards | No login 30 days → value recap, then win-back |

## Measurement

- **Randomized holdout** at the customer level (5–10% global, plus per-journey holdouts).
- **Primary metric:** incremental risk-adjusted funded dollars (and card spend) per eligible customer at 30/60/90 days.
- **Guardrails:** opt-out rate, complaints, 90-day delinquency, overall product engagement.
- **Diagnostics only:** click-through, landing-page conversion, multi-touch attribution, channel mix.

Every parameter (ignores before switching, weekly cap, snooze length, attribution windows, intent decay) is a starting assumption tested in cells against control, read by segment, and changed only when a cell wins on net value with guardrails intact.

## Compliance by design

Pre-approved creative library; "prequalified", never "approved"; no guaranteed outcomes or rate promises; accurate personal-guarantee disclosure; "subject to credit review" with any amount; fair-lending review of targeting models; TCPA consent and quiet hours for SMS; an audit log for every decision.

## Rollout

Shadow (decide and log, send nothing) → Recommend (Marketing and Risk approve) → Autopilot on in-product and email within caps → expand to push and SMS. Rules and precomputed segment policies handle most decisions; LLM reasoning is reserved for high-value cases and in-product conversation.
