# Capital Lifecycle Agent

An interactive concept demo of an **adaptive next-best-action (NBA) engine** for small-business lending lifecycle marketing: lines of credit, term loans and business credit cards.

Every customer action, and every inaction, is a signal. After each touch the engine waits out a response window, updates the customer's state, and decides the next touch (channel, time, message) or decides to wait. It weighs cadence, fatigue and opt-out risk, keeps every message compliant with lending marketing rules, and shows how each rule would be tested against a holdout.

> **Concept demo.** Synthetic customers, illustrative numbers. Not affiliated with or endorsed by Intuit or any lender. The scoring is a transparent rule set, not a trained model.

![Journey simulator](docs/screenshots/03-abandonment-branch.png)

---

## Quick start

No build step and no dependencies. It's one HTML file.

```bash
git clone https://github.com/emailrakeshr870-bot/Agentic-AI-Projects.git
cd Agentic-AI-Projects/capital-lifecycle-agent
open index.html            # macOS  (or double-click it, or: python3 -m http.server)
```

To host it, turn on **GitHub Pages** for the repository (Settings → Pages → Deploy from branch → `main` / root). The demo is then live at `https://emailrakeshr870-bot.github.io/Agentic-AI-Projects/capital-lifecycle-agent/`.

Run the engine tests (Node 18+):

```bash
npm test
```

---

## What's in the demo

### 1. Journey simulator

Pick one of three synthetic businesses and play out what the customer does. The engine responds after every signal.

| Customer | Product | Trigger |
|---|---|---|
| Greenline Landscaping | Line of credit | Cash-flow forecast shows an $18K gap before Nov 20 |
| Northbeam Design Studio | Business credit card | ~$6,200/month paid to other card issuers, 7 recurring software bills |
| Harbor Coffee Roasters | Term loan | Revenue up 32%, $48K roaster quote saved in Bills |

- **Left:** customer facts, trigger, engagement rhythm heatmap (day × time), business calendar (payroll, bills), consent.
- **Center:** the current touch (in-product card, email, push or SMS), the customer's possible responses, and a ledger of every action and inaction.
- **Right:** customer state (intent, channel affinity, likely concern, fatigue, opt-out risk), the next-best action with its explanation and compliance badge, and the full decision trace.

Three scripted paths play automatically: **Engaged**, **Silent** and **Risk event**.

| | |
|---|---|
| ![Start](docs/screenshots/01-simulator-start.png) | ![Landing-page miss](docs/screenshots/02-landing-page-miss.png) |
| Start: trigger detected, first touch timed to the customer's rhythm | Clicked but left the landing page: the message and page are flagged, the next touch switches theme |
| ![Silent path](docs/screenshots/05-silent-path-paused.png) | ![Not now](docs/screenshots/06-not-now-reasons.png) |
| Silent path: channel switches, themes rotate, then the engine waits | "Not now" asks why in one tap; each reason has its own snooze |
| ![Risk](docs/screenshots/07-risk-suppressed.png) | ![Complete](docs/screenshots/04-engaged-complete.png) |
| Late payment: all promotion suppressed, hand-off to Servicing | Engaged path: application submitted after an abandonment save |

### 2. Experiments

How every rule gets tested, with **illustrative simulated results**: a 90/10 treated-vs-holdout read on incremental risk-adjusted funded dollars with guardrails, a weekly-cap test (in this run 3 beats the default 4), when to switch channels, snooze length by "Not now" reason, and the click-to-application curve that sets the attribution window and intent decay.

![Experiments](docs/screenshots/08-experiments.png)

### 3. Compliance check

Paste any message to check it against lending marketing rules ("approved" vs. "prequalified", guarantees, rate promises, superlatives, no-risk claims, pressure tactics, missing "subject to credit review", SMS consent, quiet hours and opt-out language). It suggests a fixed version. A drafting panel produces subject lines that pass the same rules.

![Compliance](docs/screenshots/09-compliance-check.png)

### 4. How it works

Signals, scoring formula, cadence rules, snooze logic and channel protection on one page.

![How it works](docs/screenshots/10-how-it-works.png)

### 5. Workflow view

The same journey drawn as an n8n-style workflow: trigger, eligibility gate, state update, scoring, send-or-wait, compliance, channel routing, response window and signal classification, with branches for landing pages, applications, abandonment, snoozes, opt-outs and risk. Run a path and watch each node execute along a dashed green route; the pulsing node is where the customer is now. Every node shows how many times it ran, and clicking a node opens its live output (for example the scoring table or the compliance result). You can drive the customer's responses from this tab too, and it stays in sync with the simulator.

![Workflow view](docs/screenshots/13-workflow-view.png)

![Workflow, abandonment branch](docs/screenshots/14-workflow-abandonment.png)

| Dark mode | Mobile |
|---|---|
| ![Dark](docs/screenshots/11-dark-mode.png) | ![Mobile](docs/screenshots/12-mobile.png) |

---

## Workflow walkthrough deck

The Workflow view is also saved as a 14-slide deck by Rakesh R. Iyer, one snapshot per step of the journey, with a short signal → engine → next caption on each slide:

- [`docs/decks/workflow-walkthrough.pdf`](docs/decks/workflow-walkthrough.pdf) (PDF, renders right on GitHub)
- [`docs/decks/workflow-frames/`](docs/decks/workflow-frames) (the 11 workflow images on their own, PNG)

| Section | Slides |
|---|---|
| Overview | Title · one loop from need signal to response · how to read the workflow |
| Engaged path | Click lands on the landing page · leaving the page re-plans the message · abandonment save · one reminder inside 24 hours · submitted → onboarding |
| Silent and negative paths | Silence switches the channel · three misses → wait · “Not now” snooze by reason · opt-out removes the channel · risk event overrides everything |
| Close | Every action or inaction re-enters the loop |

Rebuild the frames and the deck after changing the demo:

```bash
npm i -D playwright pptxgenjs && npx playwright install chromium
npm run frames      # captures docs/decks/workflow-frames/*.png from index.html
npm run deck        # builds a local .pptx (gitignored); export it to PDF to update the committed deck
```

---

## How the engine decides

```
Sense → Interpret → Decide → Act → Observe → back to Sense
```

1. **Gate:** eligibility, suppressions (risk, snooze), consent, weekly cap.
2. **Candidates:** every consented channel at every allowed hour over the next 4 days, plus "wait".
3. **Score:**

```
benefit  = value × 6% × affinity × (0.5 + intent/100) × timing × calendar × 0.5^(hours until send ÷ 120)
timing   = 0.6 + 0.4 × engagement rhythm at that hour and day
calendar = 1.15 when the touch lands 6–48 h before payroll or a bill
cadence  = benefit × (1 − hours since customer action ÷ 24) × 0.8   (× 0.25 in-product; 0 after 24 h)
fatigue  = $4 × touches in the last 7 days
repeat   = 20% of benefit if this channel just went unanswered
opt-out  = P(opt-out) × 12-month value of the channel
net      = benefit − cadence − fatigue − repeat − opt-out
```

4. **Pick:** the highest net option. Wait when nothing clears $8.

**Signals the engine uses**

| Source | Engaged | Silent or negative | Window |
|---|---|---|---|
| In-product | CTA click | Ignored 3 sessions; "Not now" + reason | 3 sessions |
| Email | CTA click (+20 intent). Opens are not used. | No click; "fewer emails"; unsubscribe | 48 h |
| Push | Tap | No tap; notifications off | 4 h |
| SMS | Link tap | No tap; STOP | 24 h |
| Exposure, no click | Returns to the lending page on their own (+10 intent, view-through) | Nothing in window | In-product 3 d · email 7 d · push 1 d |
| Landing page | Starts application | Leaves without action → message and page flagged | Same visit |
| Application | Submits | Abandons → immediate nudge + one reminder within 24 h | Same visit |

Intent fades back toward baseline with a 5-day half-life. Unsubscribes, STOP and turning off push are treated as the worst outcome, which is why opt-out risk is priced into every send.

See [`docs/FRAMEWORK.md`](docs/FRAMEWORK.md) for the full lifecycle framework (acquisition → onboarding → activation → utilization → retention) and [`docs/DEMO-SCRIPT.md`](docs/DEMO-SCRIPT.md) for a 3-minute walkthrough.

---

## AI features

The decisions and the compliance check are deterministic, so the demo behaves the same every time.

When the page runs inside Claude's artifact viewer, an optional **Live AI** switch lets Claude:

- narrate a decision in plain English
- draft subject lines

The prepared text stays on screen until Claude's version arrives, and every AI output is run through the compliance rules. Anything that fails is replaced with prepared copy. Opened as a plain file or on GitHub Pages, Live AI shows as unavailable and everything else works the same.

---

## Repository layout

```
index.html                 the whole demo (HTML, CSS, JS; no dependencies)
tests/engine.test.mjs      headless tests of the engine and compliance rules
scripts/screenshots.js     regenerates docs/screenshots with Playwright
scripts/workflow-frames.js captures the workflow snapshots used in the deck
scripts/build-workflow-deck.js  builds the workflow walkthrough deck locally
docs/decks/                workflow walkthrough deck (PDF) and frames
docs/FRAMEWORK.md          adaptive NBA lifecycle framework
docs/DEMO-SCRIPT.md        3-minute demo walkthrough
docs/screenshots/          images used in this README
```

Regenerate screenshots (requires Playwright and Chromium):

```bash
npm i -D playwright && npx playwright install chromium
npm run screenshots
```

## License

Portfolio work by Rakesh R. Iyer. All rights reserved; shared for demonstration purposes only. See the [repository license](../LICENSE).

Part of [Agentic AI Projects](../README.md).
