# AI-Powered Shipment Disruption Router

A three-agent n8n pipeline that classifies logistics disruption events,
generates a policy-grounded routing decision (reroute / hold / expedite /
escalate / monitor), and independently audits that decision before it's
acted on — paired with a separate offline evaluation workflow that
benchmarks the pipeline against a labeled test set on decision accuracy,
policy citation recall, and reasoning quality.

## Business Context

A mid-sized freight and logistics company manages hundreds of daily
shipments across domestic and international lanes. When disruptions occur —
weather delays, customs holds, carrier failures, warehouse capacity
breaches — the current process requires a dispatcher to manually review
each incident, decide whether to reroute, hold, or escalate, and notify the
relevant downstream teams (warehouse, carrier, customer).

This manual loop introduces meaningful decision latency per incident,
causes misrouted shipments due to inconsistent dispatcher judgment, and
provides no clear audit trail for compliance review. As shipment volumes
grow, the manual process becomes harder to scale, and the lack of
standardized decision support increases the risk of SLA breaches.

## Objective

Build an AI-powered Shipment Disruption Router — a multi-agent system that
automatically analyzes disruption events and generates policy-grounded
operational decisions. The system should:

- Classify the disruption type and severity based on incoming event details
- Retrieve the applicable rerouting or mitigation policy from a logistics rulebook
- Generate a structured decision and action plan grounded in the retrieved policy
- Validate the decision before it is acted upon
- Escalate ambiguous or high-risk cases to a human dispatcher

Primary success metrics: decision latency per incident (↓), correct routing
decision rate vs. ground truth (↑), escalation rate due to policy
violations or low confidence (↓), and SLA breach rate (↓).

## Solution / Workflow

Built as **two connected n8n workflows** — the live decision pipeline and a
separate offline evaluation harness:

**Workflow 1 — Shipment Disruption Router (the decision pipeline):**
```
Ingest policy rulebook → make it searchable (vector store)
Resolve target shipment → normalize into a clean situation summary
Pre-decision guardrails → screen for manipulation attempts + filter out
                           clearly on-time, low-risk shipments early
Classifier Agent → disruption type + severity + confidence
Router Agent → retrieves relevant policy chunks, recommends a decision
              (reroute / hold / expedite / escalate_human / monitor),
              citing specific policy IDs
Auditor Agent → independently reviews the recommendation for soundness,
               policy grounding, and safety → ACCEPT / REVISE / ESCALATE
[if REVISE, within a retry limit] → feedback loops back to Router Agent
[if retries exhausted or ESCALATE] → hand off to human dispatcher
```

See [`prompts/01-classifier-agent.md`](./prompts/01-classifier-agent.md),
[`prompts/02-router-agent.md`](./prompts/02-router-agent.md), and
[`prompts/03-auditor-agent.md`](./prompts/03-auditor-agent.md) for the full
agent prompts, including the Router Agent's explicit priority-ordered
decision rules (cancellation check → high-value check → electronics check →
SLA tolerance check → standard/minor delay handling).

**Workflow 2 — Evaluation Workflow (the offline test harness):**
```
Load a curated, labeled test set (known-correct decisions + policies per case)
Replay each case through Workflow 1 as a sub-workflow call
Coherence judge (LLM) scores the reasoning quality of each result
Combine each prediction with its ground truth
Compute aggregate metrics: decision accuracy %, escalation accuracy %,
  policy citation recall %, exact policy-set match %, mean coherence
  (1-5 scale), task completion %, tool-usage accuracy %
```
See [`prompts/04-evaluation-coherence-judge.md`](./prompts/04-evaluation-coherence-judge.md)
for the reasoning-quality judge prompt, and
[`workflow/2-evaluation-workflow.json`](./workflow/2-evaluation-workflow.json)
for the full metrics-calculation code (decision match, escalation match,
citation recall, exact policy match, tool accuracy).

## Key Design Decisions

- **Separate offline evaluation harness, not just eyeballing outputs** —
  the evaluation workflow independently replays every labeled test case
  through the live pipeline and computes seven distinct metrics
  (decision/escalation accuracy, policy citation recall/exact-match,
  reasoning coherence, task completion, tool usage), giving a repeatable,
  auditable way to measure regressions as the pipeline changes.
- **Priority-ordered, explicit decision rules** — rather than leaving
  routing logic entirely to model judgment, the Router Agent's prompt
  encodes a strict, ordered rule sequence (cancellation → high-value →
  category → SLA tolerance → delay length), so the same inputs reliably
  produce the same policy-grounded decision.
- **Independent audit before action** — the Auditor Agent re-checks the
  Router Agent's decision against the same retrieved policy chunks rather
  than trusting the Router's self-reported citations, catching decisions
  that don't actually align with severity or cited policy.
- **Bounded self-correction** — REVISE feedback loops back to the Router
  Agent with a limited retry count; a case that still can't be resolved
  confidently is handed to a human rather than forced through.
- **Pre-decision guardrails as a cost/safety filter** — inputs are screened
  for manipulation attempts and obviously low-risk/on-time shipments are
  filtered out early, so the multi-agent pipeline's cost and latency are
  spent only on genuine disruptions.

## Tech Stack

- **n8n** — multi-agent workflow orchestration across 2 connected workflows
- **OpenAI `gpt-4o-mini`** — classification and routing agents
- **OpenAI `gpt-4o`** — auditor/critic agent and evaluation coherence judge
- **In-memory vector store + OpenAI embeddings** — policy rulebook retrieval
- **n8n Code nodes** — evaluation metrics computation (decision accuracy,
  citation recall, exact-match, tool accuracy)

---
*Portfolio project — all rights reserved. Shared for demonstration purposes only.*
