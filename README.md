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
| [Reimbursement Agent (MCP Architecture)](./reimbursement-mcp-agent) | Manual expense processing is slow, inconsistent, and error-prone as claim volume grows | Multi-workflow MCP architecture: orchestrator agent calls tools (bill structuring, policy caps, utilization, email) exposed by a dedicated MCP server, with a self-auditing bill-parsing sub-workflow |
| [AI Helpdesk Copilot (Multi-Agent)](./ai-helpdesk-copilot-multiagent) | Manual support ticket triage is slow and inconsistent; responses risk hallucinating unsupported claims | Four-agent pipeline (triage → draft → critic) grounded in historical tickets via RAG, with prompt-injection detection and confidence/policy gating at every stage |
| [Shipment Disruption Router](./shipment-disruption-router) | Manual dispatcher review of shipment disruptions causes latency, misrouting, and no audit trail | Three-agent pipeline (classify → route → audit) grounded in a logistics policy rulebook, benchmarked by a separate offline evaluation harness |
| [Last-Mile Delivery Exception Handler](./last-mile-delivery-exception-handler) | Manual triage of delivery exceptions is slow, inconsistent, and costly at ~10% of shipment volume | Multi-agent pipeline (resolution agent + critic, communication agent + critic) grounded in a RAG policy playbook, with tier-aware messaging and its own evaluation harness |
| [Lifecycle Delinquency Comms Engine](./lifecycle-delinquency-comms-engine) | Compliant, personalized collections communications at scale require constant re-evaluation of consent, risk, and behavior signals | Dynamic-adaptive comms architecture (8-layer design) + working n8n proof-of-concept generating FDCPA-compliant, tone-calibrated email/SMS by DPD stage |

More projects coming soon.

---
*Portfolio work — all rights reserved. Shared for demonstration purposes only.*
