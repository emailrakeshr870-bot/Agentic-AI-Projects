# Nima Sportswear — Aspect-Based Sentiment Analysis (ABSA) Agent

An n8n + LLM agentic workflow that reads raw customer reviews and automatically
extracts the **product aspect**, **sentiment**, and **reason** behind each
piece of feedback — turning unstructured reviews into structured, actionable
insight.

## Business Context

Nima is a global sportswear brand that recently launched a new sneaker line.
Early sales and online interest were strong, but returns spiked. Star ratings
alone didn't explain *why* customers were unhappy — the "why" was buried in
free-text reviews scattered across e-commerce sites, social media, and forums.

Manually reading thousands of reviews to find patterns (e.g. "runs small,"
"sole wears out quickly," "color not as pictured") was slow, inconsistent
across reviewers, and too slow to catch problems before they affected more
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
dissatisfied because the sole delaminates after light use,"* so the team can
act on specific, structured issues instead of vague complaints.

## Dataset

`data/sample-input/NimaABSAdataset.csv` — 150 customer reviews, each labeled
with a single dominant aspect for cleaner, more precise evaluation.

| Field | Description |
|---|---|
| `text` | The customer review (natural language) |
| `aspect` | Ground-truth product aspect: sizing, comfort, durability, color, design, price/value |
| `sentiment` | Ground-truth sentiment: Positive, Negative, Neutral |
| `reason` | Short ground-truth phrase explaining the sentiment |

## Solution / Workflow

Built in **n8n** using parallel AI/LLM nodes (OpenAI `gpt-4.1-mini`):

```
CSV Input → Extract Rows → Parallel LLM Predictions (Aspect + Sentiment + Reason)
          → Combine Outputs → Evaluate & Filter → Save CSV
```

1. Load the customer review dataset from CSV and process each record in n8n
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

## Results

| Output file | What it contains |
|---|---|
| `data/sample-output/Final_Output_Compiled.csv` | Full comparison of predicted vs. ground-truth aspect/sentiment/reason for every review, plus a correctness score |
| `data/sample-output/IncorrectAspect_Categorization.csv` | Reviews where the predicted aspect didn't match ground truth |
| `data/sample-output/Incorrect_Sentiment_Categorization.csv` | Reviews where the predicted sentiment didn't match ground truth |

These error files were used to spot systematic failure patterns (e.g. reviews
mentioning marketing/photo expectations getting misread as "design" or
"color" sentiment mismatches) to iterate on prompt wording.

## Screenshots

Business context, objective, dataset structure, and workflow design are in
[`/screenshots`](./screenshots).

## Tech Stack

- **n8n** — workflow orchestration
- **OpenAI `gpt-4.1-mini`** — aspect / sentiment / reason extraction
- **CSV** — data interchange format

---
*Portfolio project — all rights reserved. Shared for demonstration purposes only.*
