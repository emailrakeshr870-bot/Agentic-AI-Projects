# AI Helpdesk Copilot — Multi-Agent Ticket Triage & Response System

A four-agent n8n pipeline that classifies incoming support tickets, drafts
a first response grounded strictly in historical resolved tickets, and
independently critiques that response for factual grounding and policy
compliance before it's approved — with layered safety checks (prompt
injection detection, deterministic sensitive-topic escalation, confidence
gating) at every stage where the system could otherwise fail silently.

## Business Context

A fast-growing B2B SaaS company receives a high volume of inbound customer
support tickets daily through email and web forms. Handling this well
today requires a support agent to read each ticket, decide which team
should own it, assign a type and priority, search internal documentation,
and draft a first response — a largely manual process that produces slow
first-response times, inconsistent routing, variable response quality, and
poor reuse of institutional knowledge.

Manual triage introduces frequent routing errors that require
reassignment, drafted responses vary in quality (sometimes missing
required troubleshooting steps or including unsupported claims), and
knowledge base articles/SOPs aren't systematically grounded into replies —
creating hallucination and policy-violation risk. Simple keyword-based or
static rule systems don't solve this either: they lack contextual
understanding of ambiguous ticket language and can't generate grounded,
policy-aware responses or judge when to escalate.

## Objective

Build an AI-powered Helpdesk Copilot that automates ticket triage and
grounded first-response generation through an agentic workflow that:

- Accurately classifies incoming tickets into the correct queue, type, and
  priority using LLM-assisted reasoning
- Generates high-quality, grounded first responses using
  retrieval-augmented generation (RAG) from historical resolved tickets,
  with zero tolerance for hallucinated claims
- Implements a structured agentic pipeline that performs retrieval,
  reasoning, evidence validation, uncertainty detection, and escalation
  when required
- Validates every generated response by mapping claims to supporting
  evidence and enforcing internal compliance policies before delivery
- Provides explainability by exposing the reasoning trail from retrieval
  through classification and response drafting, for audit and managerial oversight

## Solution / Workflow

Built in **n8n** as two connected flows — a knowledge-base build step and a
live ticket-handling pipeline — using Google Gemini for embeddings/chat
models and OpenAI for the injection-detection guardrail:

**Knowledge base construction:**
```
Read historical tickets → Filter (English-only, non-empty resolved answers)
                        → Tag each with queue/type/priority
                        → Chunk (recursive character splitter)
                        → Embed (Google Gemini embeddings) → In-memory vector store
```
This becomes a searchable library of "how similar issues were solved
before," retrievable via a `kb_search` tool by later agents.

**Live ticket pipeline:**
```
New ticket → Safety Check 1: prompt-injection/jailbreak detection (LLM classifier
             + deterministic keyword regex, in parallel)
           → Safety Check 2: deterministic escalation for sensitive topics
             (legal, compliance, refunds, fraud, breach) and non-English messages
           → Triaging Agent: classifies queue/type/priority + self-reported confidence
           → [confidence gate] low-confidence tickets escalate rather than proceed
           → Drafting Agent: writes a response using ONLY kb_search evidence,
             citing every claim's source ticket
           → Critic Agent: independently re-verifies grounding + policy
             compliance via its own kb_search calls
           → Switch: ACCEPT (deliver) / REVISE (send feedback back to
             Drafting Agent, bounded retry count) / ESCALATE (human handoff)
```

Every ticket ends in exactly one of three outcomes: **approved**,
**escalated to a human**, or **blocked** — there's no silent failure mode.

See [`workflow/helpdesk-copilot-workflow.json`](./workflow/helpdesk-copilot-workflow.json)
for the full exported n8n workflow, and [`/prompts`](./prompts) for all
four agent prompts (Prompt Injection Detector, Triaging Agent, Drafting
Agent, Critic Agent).

## Key Design Decisions

- **Defense in depth for safety, not a single filter** — prompt injection
  is checked by *both* an LLM classifier (which can reason about intent and
  novel phrasing) and a deterministic regex keyword check (which can't be
  reasoned around), running in parallel rather than relying on either alone.
- **Confidence-gated triage** — the triaging agent self-reports a
  confidence score, and low-confidence classifications are escalated rather
  than forced through the pipeline with an uncertain queue/priority assignment.
- **Independent critic, not self-review** — the Critic agent re-runs its
  own `kb_search` calls to independently re-verify the Drafting Agent's
  citations, rather than trusting the drafting agent's self-reported
  sourcing — catching claims that cite a KB article that doesn't actually
  support them.
- **Bounded revision loop** — REVISE feedback sends the draft back to the
  Drafting Agent with specific critic feedback, but with a limit on
  revision attempts, so a persistently ungrounded draft escalates instead
  of looping indefinitely.
- **Explicit policy checks, not just factual grounding** — the Critic
  agent's rubric separately checks policy compliance (no unapproved refund
  promises, never request credentials, no specific resolution timelines
  promised, no other-customer data shared) alongside factual grounding,
  since a response can be fully evidence-backed and still violate policy.

## Tech Stack

- **n8n** — multi-agent workflow orchestration (knowledge-base build +
  live ticket pipeline)
- **Google Gemini** — embeddings and chat models for triage, drafting, and critic agents
- **OpenAI** — prompt injection / jailbreak detection classifier
- **In-memory vector store** — historical resolved-ticket retrieval (`kb_search`)
- **Recursive character text splitting** — knowledge-base chunking

---
*Portfolio project — all rights reserved. Shared for demonstration purposes only.*
