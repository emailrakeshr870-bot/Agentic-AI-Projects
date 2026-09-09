# GlobalEdge — Market Intelligence RAG Agent for Brokers

A Retrieval-Augmented Generation (RAG) system built in n8n that lets brokers
query financial news, SEC filings, and stock price data in plain English —
with every answer grounded in cited source chunks and automatically graded
by an LLM-as-a-judge for relevance, groundedness, and completeness before
it's trusted on a live call.

## Business Context

GlobalEdge Brokerage is a mid-sized retail and institutional brokerage firm
operating across 12 countries, serving approximately 180,000 active clients
through a network of 400 equity brokers. The firm generates revenue
primarily through brokerage commissions and advisory fees on equity, forex,
commodity, and crypto trades executed on behalf of clients across NYSE,
NASDAQ, LSE, TSE, and ASX markets. Each broker manages an average book of
450 clients, ranging from individual retail investors to small
institutional accounts, and handles between 30 and 50 inbound and outbound
client interactions per day — covering recommendations, trade
confirmations, and portfolio reviews.

The core of a broker's morning workflow is market preparation. Between
7:00 AM and 9:15 AM, brokers are expected to review overnight developments,
assess sector movements, and form a view on the stocks most relevant to
their client book before the first client call. During this window, 60–80
financial news articles and multiple SEC regulatory filings are typically
published. A broker reading at normal pace can meaningfully absorb 15–20
articles in this window — covering roughly 20–30% of available content —
before client calls begin. The rest goes unread.

The consequence is a structural intelligence gap at the moment of client
contact. Brokers give recommendations grounded in general market knowledge
and memory rather than the morning's actual signals. Risk disclosures
buried in multi-hundred-page regulatory filings — particularly annual
reports — are rarely reviewed before client conversations; compliance
checks happen after the fact, not before. When clients challenge a
recommendation or ask for sources, brokers frequently cannot respond with
specificity, creating both trust erosion and documented compliance
exposure. There is no firm-wide standard for how news or filings are
reviewed before client calls; brokers rely on personal bookmarks and
individually chosen news sites, with no consistency in coverage or depth.

- A broker covering 450 clients has no systematic way to know which of
  their holdings are affected by overnight regulatory filings before their
  first call.
- 70–80% of the morning's published market content goes unread by any
  individual broker, meaning recommendations are regularly made without
  access to today's signals.
- When clients challenge a recommendation, brokers cannot cite sources —
  exposing the firm to both trust and compliance risk.
- Compliance review happens after client interactions, not before, meaning
  regulatory gaps are caught too late to prevent them.
- Senior brokers, already resistant to new tooling, have no incentive to
  adopt systems that add friction rather than reduce it.

## Objective

This project proposes a proof-of-concept for a natural language market
intelligence system that enables GlobalEdge brokers to query today's news
and regulatory filings in plain English before and during client calls —
without any technical training or workflow disruption.

- The system ingests financial news articles and recent regulatory
  filings, and makes them queryable through plain-language questions —
  enabling a broker to ask "which S&P 500 stocks have risk disclosures
  filed this week?" and receive a sourced, grounded answer
- Every response surfaces the underlying source — article title, filing
  reference, publication date — so brokers can cite evidence to clients
  with confidence, reducing both compliance exposure and trust erosion
- The system eliminates all technical dependencies for data ingestion and
  handling, making it universally accessible to non-technical users

A successful proof-of-concept demonstrates that brokers can meaningfully
expand their pre-call market coverage within their first week of use — the
adoption threshold that prior tooling attempts consistently failed to cross.

## Data Sources

The system ingests three input types:
- Financial news articles (title, description, body, source, publish date)
- Daily stock/ETF/FX/commodity/crypto price records
- A long-form SEC regulatory filing (10-Q, ~125 pages)

These inputs are course-provided for this assignment and are **not included
in this repo** — only the workflow and prompts are shared here.

## Solution / Workflow

Built in **n8n** using Pinecone as the vector store and OpenAI for both
embeddings and generation:

**Data preparation pipeline:**
```
Upload files → Read each file type (CSV / PDF) → Recursive character text
splitter (2000 char chunks, 500 char overlap) → OpenAI text-embedding-3-small
(512 dimensions) → Load into Pinecone vector index
```

**Retrieval + generation + evaluation pipeline:**
```
Chat trigger → Question & Answer chain (retrieves 15 chunks from Pinecone)
             → LLM generates a grounded answer (see /prompts)
             → Merge retrieved chunks + answer
             → LLM-as-a-Judge scores the response (relevance, groundedness,
               context precision, context recall → PASS/FAIL)
             → Log query, answer, and all scores to a results table
```

See [`workflow/globaledge-rag-workflow.json`](./workflow/globaledge-rag-workflow.json)
for the full exported n8n workflow, and [`/prompts`](./prompts) for the
exact Q&A generation prompt and the LLM-as-a-judge evaluation prompt used.

## Key Design Decisions

- **Chunk size (2000 chars) with meaningful overlap (500 chars)** — sized
  deliberately larger than a default to preserve continuity across chunks,
  accepting some redundancy in exchange for fewer broken-context answers.
- **15 chunks retrieved per query** — tuned to balance context recall
  against noise/context precision for this document mix (news + long PDF
  filings + structured price data).
- **Source-tagged retrieval** — every chunk is tagged by origin
  ([GLOBALNEWS] / [SEC_FILINGS] / [STOCK_PRICE]) so the generation prompt
  can enforce "check all three sources" behavior and the judge prompt can
  evaluate retrieval quality per source type.
- **Groundedness as a hard gate** — the evaluation rubric treats a low
  groundedness score as an automatic FAIL regardless of other dimension
  scores, since a hallucinated compliance detail delivered live to a client
  is a materially different risk than an incomplete-but-accurate answer.
- **Token-optimized generation prompt** — the Q&A prompt was iterated down to
  remove redundant rule sections while preserving the no-guessing and
  mandatory multi-source-check constraints, since prompt length directly
  affects both cost and latency in a live-call setting.

## Tech Stack

- **n8n** — workflow orchestration (data prep + retrieval + evaluation pipelines)
- **Pinecone** — vector store
- **OpenAI `text-embedding-3-small`** — embeddings (512 dimensions)
- **OpenAI chat model** — RAG answer generation and LLM-as-a-judge evaluation
- **Recursive character text splitting** — chunking strategy for mixed
  CSV/PDF inputs

---
*Portfolio project — all rights reserved. Shared for demonstration purposes only.*
