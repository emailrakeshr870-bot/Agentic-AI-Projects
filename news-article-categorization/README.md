# News Article Categorization Agent

An n8n + LLM workflow that automatically classifies news articles into
business-relevant categories, with a built-in evaluation step to measure
classification accuracy against known labels.

## Business Context

A news aggregation platform ingests a high volume of articles daily across
categories like sports, entertainment, politics, and business. Manually
tagging each article for placement and routing is slow and doesn't scale —
leading to publishing delays, inconsistent tagging, and misclassification as
volume grows.

## Objective

Design and implement a Generative AI solution that:

- Assigns the appropriate category to each news article across key domains
  (Business, Sports, Entertainment, Politics, Technology)
- Ensures categorization stays consistent and scalable as content volume
  increases, without manual tagging

## Solution / Workflow

Built in **n8n** using an LLM chain node (OpenAI `gpt-5-mini`), with a
built-in evaluation step to score predictions against ground-truth labels:

```
Trigger → Read CSV → Extract Rows → LLM Classification Chain
        → Map Predicted/Target Labels → Evaluation (accuracy metric) → Summarize
```

1. Read a CSV of news articles (`Text` field per row)
2. Pass each article through an LLM classification chain — see
   [`/prompts`](./prompts) for the exact prompt used — which returns a
   single category label
3. Map the predicted category alongside the original ground-truth label
4. Use n8n's built-in **Evaluation** node to score each prediction as a
   categorization metric
5. **Summarize** node aggregates the results into an overall accuracy score

See [`workflow/news-categorizer-workflow.json`](./workflow/news-categorizer-workflow.json)
for the full exported n8n workflow (importable directly into n8n).

## Dataset

This project was built and tested against a labeled news-article dataset
(article text + ground-truth category label across Business, Sports,
Entertainment, Politics, and Technology). The dataset itself is
third-party/course-licensed material and is **not included in this repo** —
only the original workflow and prompt are shared here. To reproduce this
project, supply your own CSV with `Text` and `Label` columns in the same
shape, and point the "Read CSV File" node at it.

## Tech Stack

- **n8n** — workflow orchestration, including built-in Evaluation/Summarize nodes
- **OpenAI `gpt-5-mini`** — category classification
- **CSV** — data interchange format

---
*Portfolio project — all rights reserved. Shared for demonstration purposes only.*
