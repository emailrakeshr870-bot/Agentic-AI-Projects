# Nima Sportswear — Aspect-Based Sentiment Analysis (ABSA) Agent

An n8n + LLM agentic workflow that reads raw customer reviews and automatically
extracts the **product aspect**, **sentiment**, and **reason** behind each
piece of feedback — turning unstructured reviews into structured, actionable
insight.

## Business Context

A sportswear brand recently launched a new sneaker line. Early sales and
online interest were strong, but returns spiked. Star ratings alone didn't
explain *why* customers were unhappy — the "why" was buried in free-text
reviews scattered across e-commerce sites, social media, and forums.

Manually reading thousands of reviews to find patterns (e.g. "runs small,"
"sole wears out quickly," "color not as pictured") is slow, inconsistent
across reviewers, and too slow to catch problems before they affect more
customers.

## Objective

Build an LLM-powered proof of concept that automatically processes customer
reviews and:

- Identifies and structures the key product aspect discussed (sizing,
  comfort, durability, color, design, price/value)
- Determines the sentiment (Positive / Negative / Neutral) tied to that aspect
- Extracts a concise "reason" — the concrete liked/disliked point driving
  that sentiment

The goal: move from *"customers are dissatisfied"* to *"customers are
dissatisfied because the sole delaminates after light use,"* so a team can
act on specific, structured issues instead of vague complaints.

## Solution / Workflow

Built in **n8n** using parallel AI/LLM nodes (OpenAI `gpt-4.1-mini`):

```
CSV Input → Extract Rows → Parallel LLM Predictions (Aspect + Sentiment + Reason)
          → Combine Outputs → Evaluate & Filter → Save CSV
```

1. Load a customer review dataset from CSV and process each record in n8n
2. Run three parallel LLM nodes per review to predict **Aspect**, **Sentiment**,
   and **Reason** (see [`/prompts`](./prompts) for the exact prompts used)
3. Structure and combine all predictions with the ground-truth fields into a
   unified output format
4. Apply staged evaluation to flag correct vs. incorrect predictions at each
   level (Aspect → Sentiment → Reason)
5. Export incorrectly classified records separately for manual review, plus a
   final compiled results file

See [`workflow/nima-absa-workflow.json`](./workflow/nima-absa-workflow.json)
for the full exported n8n workflow (importable directly into n8n).

## Dataset

This project was built and tested against a labeled customer-review dataset,
where each record isolates a single product aspect along with its
ground-truth sentiment and a short reason phrase — this makes it possible to
evaluate model predictions at a granular, per-aspect level. The dataset used
is third-party/course-licensed material and is **not included in this
repo** — only the original workflow and prompts are shared here. To
reproduce this project, supply your own CSV with `text`, `aspect`,
`sentiment`, and `reason` columns in the same shape.

## Tech Stack

- **n8n** — workflow orchestration
- **OpenAI `gpt-4.1-mini`** — aspect / sentiment / reason extraction
- **CSV** — data interchange format

---
*Portfolio project — all rights reserved. Shared for demonstration purposes only.*
