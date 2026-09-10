# Reimbursement Agent — Multi-Workflow MCP Architecture

A multi-agent expense reimbursement system built across three connected n8n
workflows, using the **Model Context Protocol (MCP)** to expose reusable
tools (bill structuring, policy lookups, email) to an orchestrating AI
agent — with a self-correcting audit loop on the bill-parsing step.

## Business Context

Employee expense processing and reimbursement in many mid-sized and large
organizations still relies heavily on manual, paper-based review — finance
teams individually check each receipt's category, amount, date, vendor, and
policy compliance. As claim volume grows, this creates operational
bottlenecks, slows reimbursement cycles, raises processing costs, and
increases the chance of human error, duplicate reimbursements, and
inconsistent policy interpretation across reviewers — all of which raise
audit and compliance risk while also hurting employee experience through
reimbursement delays.

## Objective

Automate the expense processing and reimbursement workflow so that routine
work — receipt data extraction, expense categorization, and policy
validation — happens automatically, freeing finance teams to focus on
exception handling, compliance oversight, and analysis rather than
repetitive verification. Specifically:

- Reduce manual effort in reviewing and processing expense claims
- Minimize errors and policy non-compliance in reimbursements
- Accelerate reimbursement turnaround time for employees

## Architecture — Three Connected Workflows

This system is deliberately split across three n8n workflows connected via
MCP, rather than built as one monolithic flow:

**1. Reimbursement Agent (Main Orchestrator)** — `workflow/1-reimbursement-agent.json`
Receives an employee's bill via a chat trigger (supporting image upload —
receipts are OCR'd with GPT-4o before processing), then hands off to an AI
agent that calls MCP tools in a strict, enforced sequence: structure the
bill → fetch reimbursement caps → fetch past utilization → calculate
approved/rejected amounts per category → send a decision email → return a
structured JSON summary. See
[`prompts/01-orchestrator-agent-system-prompt.md`](./prompts/01-orchestrator-agent-system-prompt.md)
for the full step-by-step agent instructions, which explicitly forbid
skipping steps or inventing numbers.

**2. MCP Server (Tool Registry)** — `workflow/2-mcp-server-tool-registry.json`
Exposes four tools to the orchestrating agent over MCP/SSE:
- `structure_bill` — delegates to Workflow 3 for bill parsing
- `get_reimbursement_caps` — queries a SQLite database for per-category
  reimbursement limits based on employee position
- `get_past_utilization` — queries SQLite for amounts already claimed in
  the current policy period
- `send_email` — sends the final reimbursement decision via SMTP

See [`prompts/02-mcp-tool-descriptions.md`](./prompts/02-mcp-tool-descriptions.md)
for the exact tool descriptions the agent uses to decide when to call each one.

**3. Sub-Workflow: Structure Bill** — `workflow/3-sub-workflow-structure-bill.json`
A self-auditing bill-parsing pipeline, callable as a tool by Workflow 2:
```
Structure Bill (GPT-4.1 extracts category totals)
  → Decision Audit (GPT-4.1 independently re-derives totals from raw line items)
  → IF Approved → return structured bill as-is
  → IF Blocked  → Restructure Bill (GPT-4.1 fixes only the flagged fields) → return corrected output
```
This means every structured bill is independently checked for arithmetic
and categorization correctness before it's trusted by the orchestrator —
and if the audit fails, only the specific flagged fields are corrected,
rather than re-running the whole extraction from scratch. See
[`prompts/03-bill-structuring-prompt.md`](./prompts/03-bill-structuring-prompt.md),
[`prompts/04-arithmetic-audit-prompt.md`](./prompts/04-arithmetic-audit-prompt.md),
and [`prompts/05-restructure-correction-prompt.md`](./prompts/05-restructure-correction-prompt.md).

## Key Design Decisions

- **MCP as the integration layer** — tools are defined once in a dedicated
  MCP server workflow and exposed over SSE, rather than duplicated inline
  in the orchestrator — making tools independently testable and reusable
  across other agents.
- **Self-auditing extraction, not single-pass trust** — the bill structuring
  step includes a dedicated audit call that independently re-derives
  category totals from the raw bill, catching miscategorization or
  arithmetic drift before numbers ever reach the reimbursement calculation.
- **Deterministic calculation, not LLM arithmetic** — the orchestrator
  prompt explicitly specifies the cap/utilization/approval formula
  step-by-step (`remaining = max(0, cap - used)`, `approved = min(requested,
  remaining)`), rather than trusting the model to "do the math" freely.
- **Hard sequencing constraints** — the orchestrator prompt explicitly
  forbids skipping or reordering steps and forbids producing a final answer
  before the decision email is confirmed sent, reducing the risk of a
  plausible-looking but incomplete agent run.

## Tech Stack

- **n8n** — workflow orchestration across 3 connected workflows
- **Model Context Protocol (MCP)** — tool exposure/consumption between workflows
- **OpenAI `gpt-4o` / `gpt-4o-mini` / `gpt-4.1`** — receipt OCR, agent
  reasoning, bill structuring, and audit/correction passes
- **SQLite** — reimbursement policy caps and past utilization lookups
- **SMTP** — automated decision email delivery

---
*Portfolio project — all rights reserved. Shared for demonstration purposes only.*
