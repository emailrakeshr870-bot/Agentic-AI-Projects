# ShopNest — AI-Powered Support Ticket Triage & Response Agent

An n8n + LLM multi-stage agentic workflow that reads raw customer support
tickets and automatically generates a clean summary, a policy-aligned draft
response, and quality scores for both — using an LLM-as-a-judge pattern to
keep AI output auditable before it reaches a human agent or a customer.

## Business Context

A global e-commerce platform handles a very high daily volume of orders
across many countries and product categories, supported by a large 24/7
support team. Two recurring bottlenecks slow the team down:

- **Ticket decoding time** — agents spend real time just interpreting
  unstructured, vague, or overly detailed customer messages before they can
  even begin resolving the issue.
- **Inconsistent response quality** — manual drafting under time pressure
  leads to inconsistent tone, missed policy details, and agent fatigue,
  especially during peak periods when ticket volume spikes.

## Objective

Design an AI system that shifts agents from *decoding and drafting* to
*validating and approving* — automatically turning a raw ticket into a
concise summary and a policy-compliant draft response, with built-in quality
scoring so low-confidence outputs get flagged for review instead of shipped
blind.

## Solution / Workflow

Built in **n8n** using a multi-stage GPT-4.1 pipeline with an LLM-as-a-judge
evaluation pattern at each generation step:

```
Read CSV → Extract Rows → Summary Generator → Summary Evaluator (LLM-as-judge)
         → Response Generator (policy-aware) → Response Evaluator (LLM-as-judge)
         → Combine Fields → Write Output File
```

1. **Summary Generator** — condenses each raw ticket into a clean,
   structured summary (core issue, order reference, product, requested
   resolution), stripping emotional language
2. **Summary Evaluator** — an LLM-as-a-judge step that scores the summary
   for information extraction and field coverage against the original ticket
3. **Response Generator** — drafts a professional, empathetic customer
   response, constrained to only make promises explicitly supported by
   four documented support policies (refunds/returns, delivery delay
   compensation, wrong/damaged item, payment failure)
4. **Response Evaluator** — a second LLM-as-a-judge step that scores the
   response for issue addressal and resolution clarity
5. All fields (ticket ID, original description, summary + scores, response +
   scores) are combined and written out to a single results file

See [`workflow/shopnest-workflow.json`](./workflow/shopnest-workflow.json)
for the full exported n8n workflow, and [`/prompts`](./prompts) for the
exact prompts used at each stage — including the few-shot examples used to
steer the summary format and the explicit policy-grounding rules used to
keep the response generator from over-promising.

## Sample Output

[`sample-output/ShopNestOutput.xlsx`](./sample-output/ShopNestOutput.xlsx)
contains generated summaries, responses, and judge scores for a batch of
sample support tickets, illustrating both strong outputs and cases where the
summary/response evaluators correctly caught a poor generation (e.g. a
summary that hallucinated a different product than the one mentioned in the
ticket).

## Key Design Decisions / Recommendations

- **LLM-as-a-judge, not a single pass** — separating generation from
  evaluation surfaces hallucinations and off-policy promises before a human
  ever sees the ticket, rather than trusting the first model output blindly.
- **Confidence-based routing (proposed)** — responses scoring above a set
  threshold on the judge evaluation could be auto-approved or fast-tracked
  for one-click agent sign-off, while low-scoring responses route to full
  manual review — shifting the agent's role from investigating to validating.
- **Policy-grounded generation** — the response prompt explicitly restricts
  the model to promises supported by documented policy text, with clear
  rules against promising outcomes marked "case-by-case."
- **Audit trail by design** — every summary and response is stored alongside
  its judge scores, enabling periodic QA review to catch prompt drift or
  policy gaps in specific ticket categories.

## Tech Stack

- **n8n** — workflow orchestration
- **OpenAI `gpt-4.1`** — summary generation, response generation, and both
  evaluation (LLM-as-a-judge) stages
- **CSV / XLSX** — data interchange format

---
*Portfolio project — all rights reserved. Shared for demonstration purposes only.*
