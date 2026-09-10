# Last-Mile Delivery Exception Handling — Multi-Agent Automation

A multi-agent n8n system that ingests raw delivery logs, filters genuine
exceptions from routine noise, determines a policy-grounded resolution
(redelivery, locker reroute, hold at depot, replacement, RTS, or fraud
hold), and drafts a tier-appropriate customer notification — with two
independent critic agents (one for operational/policy grounding, one for
communication tone) gating output before anything reaches a customer, and
a separate evaluation harness to measure the whole system against labeled
ground truth.

## Business Context

Roughly 10% of last-mile shipments encounter delivery exceptions — failed
attempts, address mismatches, damaged packages, weather delays — that
cause preventable customer churn and significant reattempt/spoilage costs.
Despite the stakes, triage and resolution remain bottlenecked by manual
work: operations staff must, under time pressure, decipher messy driver
notes, cross-reference customer profiles, and consult static playbooks.
Rigid rule engines and manual judgment struggle to account for nuanced,
multi-factor calls — e.g. distinguishing a VIP customer with a perishable
item from a routine standard delivery — leading to slow resolution times,
unnecessary supervisor escalations, inconsistent customer communication,
and avoidable cost.

## Objective

Build a proof-of-concept AI-powered, multi-agent exception handling system
that automates the pipeline from detection through resolution:

- Ingest raw delivery logs and filter out operational noise to isolate
  genuine exceptions
- Reason over unstructured operational playbooks and customer data to
  determine the optimal resolution
- Automatically execute tailored customer communications calibrated to
  customer tier
- Route complex edge cases to human supervisors only when policy dictates
- Output transparent, auditable decision traces for every case

## Architecture — Four Connected Workflows

**1. Customer Profile Lookup (Subflow)** — `workflow/3-customer-profile-lookup-subflow.json`
Queries a shared SQLite database for a customer's tier, preferred channel,
active credit, and exception history over the last 90 days. Includes
built-in PII handling: the customer's name is redacted to `[REDACTED]`
unless an `include_pii` flag is explicitly set by the calling agent.

**2. Locker Availability (Subflow)** — `workflow/4-locker-availability-subflow.json`
Checks whether a locker in (or adjacent to) a given zip code can accept a
package, applying three eligibility rules in sequence: size compatibility
(large packages can't go to small/medium lockers), capacity status (FULL
lockers rejected outright, LIMITED lockers accept only SMALL packages),
and returns a human-readable reason either way.

**3. Main Runtime — Delivery Exception Pipeline (+ RAG)** — `workflow/1-main-runtime-and-rag.json`
The core three-phase pipeline:

```
PHASE 1 — Ingestion, Guardrails, Escalation
  Chat trigger (or invocation from the Evaluation workflow)
  → Input guardrail: prompt-injection / jailbreak detection
  → Ingest delivery_logs.csv, filter + aggregate all rows for the target shipment ID
  → Screen for routine vs. exception events (stolen, damaged, misrouted, etc.)
  → Deterministic escalation signal check

PHASE 2 — Resolution
  Resolution Agent: calls customer-profile + locker-availability subflow
    tools, applies the full operational playbook (see below), outputs a
    structured exception assessment + corrective action + draft message
  → Critic Resolution Agent: independently re-verifies grounding (via RAG
    over the policy playbook) and policy compliance → ACCEPT / REVISE / ESCALATE
  → [REVISE, bounded retries] feedback loops back to Resolution Agent

PHASE 3 — Communication
  Communication Agent: drafts the customer-facing email or SMS, matching
    tone and channel to customer tier
  → Communication Critic Agent: independently judges tone/channel compliance
    → ACCEPT / REVISE (up to 2 revisions) / ESCALATE
```

The policy playbook itself (failed-delivery attempts, address mismatches,
damaged packages, refused deliveries, weather delays, locker reroute
eligibility) is uploaded as a PDF and embedded into a Pinecone vector
index for retrieval-augmented grounding — see
[`prompts/02-resolution-agent.md`](./prompts/02-resolution-agent.md) for
the full playbook as encoded in the Resolution Agent's prompt.

**4. Evaluation Workflow** — `workflow/2-evaluation-workflow.json`
Runs the entire labeled ground-truth test set against the main pipeline,
scores each result with a Coherence Judge (1–5 scale), and combines
prediction accuracy with reasoning-quality scores into an overall report.

See [`/prompts`](./prompts) for all 5 prompts used across the pipeline:
input guardrail, Resolution Agent (with the full playbook), Critic
Resolution Agent, Communication Agent, and Communication Critic Agent.

## Key Design Decisions

- **Two independent critics, not one** — a Critic Resolution Agent checks
  factual grounding and operational policy compliance, while a *separate*
  Communication Critic Agent independently judges only tone/channel
  compliance — separating "was the right decision made" from "was it
  communicated appropriately," since a technically correct resolution can
  still be delivered with an off-tone message.
- **Asymmetric agent temperatures** — the critic agents run at a low
  temperature (0.1) to judge strictly and consistently, while the
  resolution-generating agents run warmer (0.4), intentionally creating a
  stricter reviewer than generator.
- **Deliberately oversized chunking for policy retrieval** — the playbook
  PDF is chunked at 2000 characters with 400-character overlap,
  intentionally kept high to preserve continuity across chunk boundaries
  even at the cost of some redundancy.
- **Bounded, separate revision loops per phase** — the resolution critic
  and communication critic each drive their own revision loop with a
  capped retry count, so a persistently non-compliant draft escalates to a
  human rather than looping indefinitely in either phase.
- **PII redaction by default in the shared subflow** — the Customer
  Profile Lookup subflow redacts the customer's name unless an agent
  explicitly requests it, balancing operational privacy against the
  system's need for tier/channel context.
- **Adapting to real data during build** — the locker eligibility logic
  was originally designed assuming multiple lockers could exist per zip
  code; once the actual data showed only one locker per zip code, an
  additional simplified subflow variant was built to match the real schema
  rather than keeping speculative logic that didn't match the data.

## Tech Stack

- **n8n** — multi-agent orchestration across 4 connected workflows
- **OpenAI** — prompt injection detection, resolution, critic, and
  communication agents (`text-embedding-3-small` at 512 dimensions for embeddings)
- **Pinecone** — vector store for the policy playbook (RAG)
- **SQLite** — customer profile and locker availability lookups
- **Recursive character text splitting** — 2000-char chunks, 400-char overlap

---
*Portfolio project — all rights reserved. Shared for demonstration purposes only.*
