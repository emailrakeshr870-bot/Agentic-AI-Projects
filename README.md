# Agentic AI Projects

Agentic AI & multi-agent system projects — LLM-orchestrated workflows built
with n8n, OpenAI, and Gemini, solving real business problems from customer
feedback analysis to AI-engine visibility analytics.

Each project folder includes: business context, dataset, the exact prompts
used, the full exported n8n workflow, and results.

| Project | Problem | Approach |
|---|---|---|
| [Nima ABSA Sentiment Analysis](./nima-absa-sentiment-analysis) | Sportswear brand needs to understand *why* customers are dissatisfied from unstructured reviews | Parallel LLM nodes extract aspect, sentiment, and reason from each review |
| [News Article Categorization](./news-article-categorization) | News aggregator needs scalable, consistent article tagging as volume grows | LLM classification chain assigns category, scored against ground truth via n8n's evaluation node |
| [ShopNest Support Automation](./shopnest-support-automation) | E-commerce support team loses time decoding tickets and drafting inconsistent responses | Multi-stage LLM pipeline generates summaries and policy-aligned responses, scored by an LLM-as-a-judge at each stage |
| [GlobalEdge Market Intelligence RAG](./globaledge-market-intelligence-rag) | Brokers can't read enough overnight news/filings before client calls to give sourced, compliant recommendations | RAG system (Pinecone + OpenAI) answers plain-English broker queries with cited sources, graded by an LLM-as-a-judge |
| [ClaimAudit AI — Responsible AI Agent](./claimaudit-responsible-ai-agent) | Healthcare audit teams depend on IT/data teams just to query claims data, slowing down compliance work | Chat agent generates safe SQL from plain language, with input/output guardrails, PII redaction, confidence scoring, and full audit logging |

More projects coming soon.

---
*Portfolio work — all rights reserved. Shared for demonstration purposes only.*
