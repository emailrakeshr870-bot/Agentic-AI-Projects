# ClaimAudit AI — Responsible AI Agent for Healthcare Claims Auditing

A multi-stage n8n chatbot agent that lets healthcare audit professionals
query a claims database in plain language — without writing SQL or
depending on a data/IT team — while enforcing input/output guardrails, PII
redaction, confidence scoring, and full audit logging at every step.

## Business Context

Healthcare audit teams are responsible for reviewing large volumes of
claims, patient encounters, and denial records to catch compliance gaps.
Doing this through manual SQL queries is slow and typically requires
support from a separate technical team, which delays audits and creates
operational bottlenecks — audit professionals are domain experts but are
frequently blocked by their reliance on data specialists just to retrieve
the information they need.

## Objective

Build a prototype demonstrating how an agentic AI assistant can let audit
professionals query claims data in natural language with no technical
expertise required, while remaining safe and compliant by design:

- Provide accurate, explainable insights by dynamically generating and
  executing safe (read-only) queries
- Support contextual continuity across a conversation for meaningful
  follow-up questions
- Apply guardrails to prevent harmful, destructive, or sensitive queries
  from ever reaching the database
- Let audit teams focus on investigation and decision-making instead of
  manual data retrieval

## Solution / Workflow

Built in **n8n** as a chat-triggered pipeline with guardrails on both the
input and output sides, using GPT-4o-mini throughout:

```
Chat Trigger → Session Setup (ID, timestamp, role, model disclosure)
            → Language Normalisation (detect + translate to English)
            → Input Guardrail (Escalation / Exit / Process / Adversarial)
            → [if Process] SQL Generation (SELECT-only, max 20 rows)
                          → Execute against SQLite claims DB
                          → Extract + Format + Confidence Scoring
                          → Output Guardrail + PII Check (SAFE / BLOCK)
                          → Final Response (with AI disclosure appended)
            → Audit Log & Bias Tracker (every interaction logged, regardless of path)
```

Key stages, in order:

1. **Session setup** — every request is stamped with a unique session ID,
   timestamp, user role, and a flag disclosing that the assistant is
   AI-powered (GPT-4o-mini) before any processing happens
2. **Language normalisation** — detects the query's language and translates
   to English if needed, so downstream prompts can assume English input
3. **Input guardrail** — classifies every query into Escalation / Exit /
   Process / Adversarial, routing angry users to human handoff, closing
   polite exits, and blocking prompt injection or destructive SQL attempts
   (`DROP`, `DELETE`, `UPDATE`, etc.) *before* they ever reach SQL generation
4. **SQL generation** — converts a validated natural-language query into a
   read-only `SELECT` query, capped at 20 rows, against a defined claims
   schema
5. **Answer extraction + confidence scoring** — summarizes the DB result
   into a 1–3 sentence professional response with a calibrated confidence
   score (0.0–1.0); low-confidence answers are flagged and diverted rather
   than shown with false certainty
6. **Output guardrail + PII check** — a second AI pass scans the drafted
   response for PII leakage, bulk data dumps, or unsafe content, redacting
   PII in-place (e.g. `[NAME_REDACTED]`) where the rest of the response is
   still useful, or blocking it outright
7. **Audit log & bias tracker** — every interaction, regardless of which
   path it took, is logged for compliance, with demographic context
   (department, age group, gender) recorded to support ongoing bias
   monitoring

See [`workflow/claimaudit-workflow.json`](./workflow/claimaudit-workflow.json)
for the full exported n8n workflow, and [`/prompts`](./prompts) for all five
prompts used at each stage.

## Responsible AI Design Highlights

- **Defense in depth** — guardrails exist on *both* the input (intent
  classification, injection/destructive-SQL detection) and output (PII
  check, bulk-data check, harmful-content check) sides, rather than relying
  on a single filtering pass.
- **Least-privilege data access** — the SQL generation prompt is
  schema-scoped and restricted to `SELECT`-only queries with a hard row
  cap, and the schema explicitly separates PII-bearing columns from the
  audit-relevant fields the assistant is meant to answer from.
- **Calibrated confidence, not blind answers** — the extraction step
  produces an explicit confidence score with defined bands, so uncertain
  answers can be routed differently rather than presented with unwarranted
  authority.
- **Model disclosure by default** — the AI's identity is disclosed to the
  user upfront and re-appended to the final response, rather than left
  ambiguous.
- **Auditability over convenience** — every interaction is logged
  regardless of outcome (answered, blocked, escalated, or exited), enabling
  compliance review and demographic bias monitoring after the fact.

## Tech Stack

- **n8n** — workflow orchestration, including switch-based intent/verdict routing
- **OpenAI `gpt-4o-mini`** — language normalisation, intent classification,
  SQL generation, answer extraction/confidence scoring, and output safety/PII checks
- **SQLite** — claims database queried via generated read-only SQL

---
*Portfolio project — all rights reserved. Shared for demonstration purposes only.*
