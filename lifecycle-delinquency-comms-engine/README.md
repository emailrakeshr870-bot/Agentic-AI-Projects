# Dynamic Lifecycle Comms Engine — Delinquency Collections Journey

An end-to-end architecture and working n8n proof-of-concept for a
compliance-aware, dynamically adaptive customer communications engine for
early-stage loan delinquency (0–30 days past due) — covering the full
pipeline from data ingestion and segmentation through AI-generated,
tone-calibrated email/SMS content.

## Business Context

Lenders servicing delinquent accounts need to communicate with customers
across email and SMS in a way that is simultaneously compassionate,
compliant (FDCPA, TCPA, CAN-SPAM), and personalized to each customer's risk
profile, loan details, and days-past-due stage — while adapting in near
real time as new signals arrive (a payment made, a call placed, a website
visit). Doing this well at scale requires more than a static drip
campaign: it requires a system that can dynamically regenerate the next
best communication based on the freshest available context, while staying
within strict legal guardrails for collections communications.

## Architecture Overview

The full design is organized into eight layers, moving from raw data
through to measurement:

1. **Data Ingestion Layer** — five categories of signal: demographics
   (FCRA-compliant attributes only — name, address, income, employment,
   DTI, etc.), account profile (balance, status, DPD, loan type, payment
   history), transactions (communication logs, engagement history,
   payment behavior), channel consent/preferences (TCPA/CAN-SPAM
   eligibility by channel), and behaviors. Psychographic/lifestyle
   attributes are explicitly called out as **forbidden for use in
   collections communications**.
2. **Filtration Layer** — channel eligibility based on consent (email
   defaults as eligible for servicing/collections since it falls outside
   CAN-SPAM's opt-in requirement for transactional/servicing messages),
   exclusion based on public info (bankruptcy, tax liens, civil
   judgments), and defined exit conditions (paid off, skip-traced, other
   regulatory/legal holds).
3. **Customer Segmentation Layer** — dynamic segmentation based on
   account/transaction profile (DPD, loan amount/type, payment behavior)
   and credit/risk profile (FICO band, DTI, loan-to-value), with recency
   weighted more heavily as new signals arrive. Demographic/psychographic
   clustering is explicitly excluded from collections segmentation.
4. **Channel and Behavioral Segmentation Layer** — eligible channel(s),
   best time/day to contact, cadence, and full engagement history (opens,
   clicks, landing page visits, replies, spam complaints, hard bounces) —
   continuously refining segmentation as conversational context accumulates.
5. **Marketing Context Layer** — brand guidelines, templates, channel
   specs (e.g. SMS character limits), tone/positioning guidance by journey
   stage, test design, disclosures, and mandatory exit conditions.
6. **Infrastructure Layer** — email deliverability and sender
   certification (domain strategy, IP warming, SPF/DKIM/DMARC, BIMI/VMC
   brand verification, inbox placement monitoring) — noted as a
   client-dependent layer for collections use cases, since the client is
   the entity authorized to collect on their customers.
7. **Execution Layer** — continuous test-and-learn across send time,
   subject line, messaging/value proposition, inbox placement, header/
   pre-header, device optimization, CTA, template, and image; plus
   channel-mix optimization (email/SMS/voice) and cadence optimization.
8. **Analytical Layer** — channel delivery/engagement performance by
   segment, multi-touch attribution, and predictive analytics feeding back
   into segmentation and content decisions.

## The Dynamic-Adaptive Comms Engine

The core design principle: **the customer journey is not a fixed
sequence** — it is regenerated before every touch based on the freshest
available signals (behavior, conversational context, channel eligibility).
Before each scheduled communication goes out, the system re-checks for new
signals and cadence conditions; a positive outcome (e.g. payment made)
immediately exits the journey and cancels queued communications. The
high-level flow:

```
Data → Apply channel/contact eligibility → Generate segments (client-provided,
refined dynamically by signals) → Creative Generation Layer (per segment)
→ Channel Execution Layer → [loop: check for new signals/cadence before
  each touch] → Exit journey on positive outcome (e.g. payment) or continue
→ Analytical Layer (feeds back into segmentation and creative)
```

## Illustrative Use Case: 0–30 Day Reminder Series (Personal Loans)

The included n8n proof-of-concept implements a simplified version of this
engine for a 0–30 day delinquent personal-loan reminder series:

- **Segmentation inputs:** loan balance (< $5K vs. ≥ $5K, driving credit
  card vs. ACH CTA) × channel eligibility (email-only vs. email+SMS based
  on TCPA consent) × 3 tone variants by DPD stage — 12 total content
  variants
- **Tone escalation by DPD:** empathetic/friendly (day 1) → firm but
  professional (day 15) → urgent and serious, mentioning legal/collection
  consequences (days 21/25/28)
- **Workflow:** reads the customer delinquency dataset → an LLM generates
  a personalized, FDCPA-compliant email (subject line, pre-header, header,
  body copy) per customer, tone-matched to their DPD stage → a second LLM
  call assembles the content into a responsive HTML email template →
  records with public-info flags are filtered out and written to a
  separate "cannot contact" file for compliance review → final HTML output
  is written per customer
- **Additional logic:** if an email was clicked but no payment was made
  within 24 hours, trigger a follow-up SMS

See [`workflow/sample-customer-journey-workflow.json`](./workflow/sample-customer-journey-workflow.json)
for the full exported n8n workflow, and
[`prompts/01-email-generation-prompt.md`](./prompts/01-email-generation-prompt.md) /
[`prompts/02-sms-generation-prompt.md`](./prompts/02-sms-generation-prompt.md)
for the exact generation prompts. Note the SMS prompt runs at a much lower
temperature (0.1 vs. 0.3) and uses a narrower empathetic-tone window (DPD
≤ 3, vs. up to DPD 15 for email) before shifting to an urgent tone — SMS is
reserved for a narrower, more time-sensitive band of the journey, and its
output is governed by a hard 160-character/40-token budget plus explicit
example-based few-shot guidance rather than open-ended generation.

[`sample-data/`](./sample-data) contains the synthetic customer dataset
used to test the workflow (fictional names and sequential test phone
numbers — not real customer data), and
[`sample-output/`](./sample-output) contains example generated email/SMS
content.

## Key Design Decisions

- **Hard separation of permitted vs. forbidden attributes** — the
  architecture explicitly documents which signals (demographic, account,
  behavioral) are usable for collections segmentation and communications,
  and which (psychographic/lifestyle profiling) are explicitly excluded —
  baking compliance boundaries into the data layer itself rather than
  relying on prompt instructions alone.
- **Journey regenerated per-touch, not scheduled upfront** — rather than a
  static drip sequence, the design re-evaluates signals and eligibility
  immediately before every send, so a payment or a new contact-preference
  signal can immediately halt or redirect the journey.
- **Compliance-first prompt design** — the generation prompt explicitly
  cites FDCPA, restricts the model to only the data provided (no
  invention/hallucination), and encodes specific wording rules (e.g.
  "past due" vs. "overdue" by stage) directly into the tone logic rather
  than leaving legal language to model discretion.
- **Segment-driven variant explosion, not hand-authored content** — 12
  distinct content variants are generated from the combination of just 3
  independent variables (balance tier × channel eligibility × tone stage),
  illustrating how a small segmentation model scales to meaningfully
  personalized content without hand-authoring every combination.

## Tech Stack

- **n8n** — workflow orchestration for the proof-of-concept pipeline
- **OpenAI `gpt-4o-mini`** — email content generation and HTML assembly
- **CSV** — customer/account data interchange

---
*Portfolio project — all rights reserved. Shared for demonstration purposes only.*
