# Inflectiv MCP Server

[![npm version](https://img.shields.io/npm/v/@inflectiv-ai/inflectiv-mcp.svg)](https://www.npmjs.com/package/@inflectiv-ai/inflectiv-mcp)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Model Context Protocol](https://img.shields.io/badge/MCP-compatible-orange.svg)](https://modelcontextprotocol.io)

Connect any AI agent to the [Inflectiv](https://app.inflectiv.ai) data platform via the [Model Context Protocol](https://modelcontextprotocol.io). Build knowledge bases, create AI agents, run semantic search, upload files, and chat — from any MCP-compatible client.

**Works with any AI agent** — not limited to coding. Use it for research, customer support, content creation, data pipelines, and multi-agent workflows.

---

## What It Does

Inflectiv turns raw data (documents, URLs, text, files) into structured, searchable knowledge that AI agents can query and build on. This MCP server gives your agent direct access to:

- **Search** — Semantic / RAG search across your knowledge base
- **Agents** — Create, configure, and chat with AI agents trained on your data
- **Datasets** — Create, clone, update, reindex, and cross-query datasets
- **Knowledge** — Write and manage intelligence entries (auto-embedded, deduplicated)
- **Files** — Upload PDFs, CSVs, JSON, and 10+ other formats as knowledge sources
- **Webhooks** — Subscribe to real-time events when data is processed
- **ChainAware** — On-chain intelligence: wallet fraud/AML risk, rug-pull risk, credit scoring, behaviour profiling, and token rankings
- **Crypto payments (optional)** — Pay per request with USDC on Base when credits run out, via the [x402](https://www.x402.org) protocol

> 33 tools and 3 documentation resources, listed below.

---

## Quick Start

1. Get an API key from the [Inflectiv dashboard](https://app.inflectiv.ai) → **Datasets → select a dataset → Create Key**.
2. Add the config below to your MCP client.
3. Ask your agent: *"search my dataset for machine learning"* or *"list my agents"*.

---

## Installation

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "inflectiv": {
      "command": "npx",
      "args": ["-y", "@inflectiv-ai/inflectiv-mcp"],
      "env": {
        "INFLECTIV_API_KEY": "inf_your_key_here"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add inflectiv -e INFLECTIV_API_KEY=inf_your_key_here -- npx -y @inflectiv-ai/inflectiv-mcp
```

Or edit `.mcp.json` in your project root with the same `mcpServers` block as above.

### Cursor / Windsurf / Other MCP Clients

Any MCP-compatible client works. Run `npx -y @inflectiv-ai/inflectiv-mcp` with the `INFLECTIV_API_KEY` environment variable set.

---

## Configuration

| Variable                         | Required | Default                                   | Description                                                                                                                                                                               |
| -------------------------------- | -------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `INFLECTIV_API_KEY`            | Yes      | —                                        | API key (must start with `inf_`). See **API Keys** below.                                                                                                                         |
| `INFLECTIV_WALLET_PRIVATE_KEY` | No       | —                                        | EVM wallet private key for x402 crypto payments. When set and credits hit 0, the server pays per request in USDC on Base.**Optional** |

### API Keys

There are two kinds of key, and they change how some tools behave:

- **Per-dataset key** (`inf_...`) — bound to a single dataset. Dataset-scoped tools operate on that dataset automatically; you never pass `dataset_id`.
- **Global key** (`inf_global_...`) — spans every dataset you own plus active marketplace acquisitions. Dataset-scoped tools accept an optional `dataset_id` to target a specific dataset, and unlock account-level tools like `inflectiv_create_dataset`, `inflectiv_clone_dataset`, and `inflectiv_cross_query`.

---

## Tools (33)

### Agents

| Tool                              | Description                                                   | Cost |
| --------------------------------- | ------------------------------------------------------------- | ---- |
| `inflectiv_list_agents`         | List all your agents                                          | Free |
| `inflectiv_create_agent`        | Create a new AI agent                                         | Paid |
| `inflectiv_get_agent`           | Get agent details                                             | Free |
| `inflectiv_update_agent_config` | Update agent settings (model, personality, temperature, etc.) | Paid |
| `inflectiv_chat_with_agent`     | Chat with RAG-enabled responses (multi-turn supported)        | Paid |
| `inflectiv_list_agent_datasets` | List datasets attached to an agent                            | Free |
| `inflectiv_attach_dataset`      | Attach a dataset to an agent                                  | Free |
| `inflectiv_update_dataset_mode` | Switch between `read_only` and `self_learning`            | Free |

### Datasets & Search

| Tool                                 | Description                                                    | Cost |
| ------------------------------------ | -------------------------------------------------------------- | ---- |
| `inflectiv_list_datasets`          | List accessible datasets                                       | Free |
| `inflectiv_create_dataset`         | Create a new dataset*(global key)*                           | Paid |
| `inflectiv_clone_dataset`          | Clone an accessible dataset into your account*(global key)*  | Free |
| `inflectiv_update_dataset`         | Update dataset name, description, and instructions             | Free |
| `inflectiv_reindex_dataset`        | Reindex vectors (run after bulk changes)                       | Paid |
| `inflectiv_search_dataset`         | Semantic search across a dataset                               | Paid |
| `inflectiv_batch_search`           | Run up to 20 searches in one call                              | Paid |
| `inflectiv_cross_query`            | One query across many datasets*(global key + advanced tier)* | Paid |
| `inflectiv_list_knowledge_sources` | List all sources (files, URLs, text, AI-generated)             | Free |

### Intelligence (Write Knowledge)

| Tool                                   | Description                                            | Cost |
| -------------------------------------- | ------------------------------------------------------ | ---- |
| `inflectiv_write_intelligence`       | Write a knowledge entry (auto-embedded & deduplicated) | Paid |
| `inflectiv_batch_write_intelligence` | Write up to 50 entries in one call                     | Paid |
| `inflectiv_list_intelligence`        | List entries with filtering & pagination               | Free |

### Files

| Tool                         | Description                               | Cost |
| ---------------------------- | ----------------------------------------- | ---- |
| `inflectiv_upload_file`    | Upload a local file as a knowledge source | Paid |
| `inflectiv_list_files`     | List uploaded files                       | Free |
| `inflectiv_get_file`       | Get file details & processing status      | Free |
| `inflectiv_reprocess_file` | Retry a failed file upload                | Paid |

**Supported formats:** PDF, DOCX, TXT, MD, HTML, XML, CSV, JSON, JSONL, TSV, XLSX, XLS, Parquet

### Webhooks

| Tool                           | Description                               | Cost |
| ------------------------------ | ----------------------------------------- | ---- |
| `inflectiv_register_webhook` | Subscribe to events (HTTPS only)          | Free |
| `inflectiv_list_webhooks`    | List registered webhooks                  | Free |
| `inflectiv_test_webhook`     | Send a test event to verify your endpoint | Free |

**Events:** `intelligence.processed`, `intelligence.failed`, `intelligence.deduped`, `dataset.mode_changed`

### ChainAware (on-chain intelligence)

| Tool                                       | Description                                       | Cost |
| ------------------------------------------ | ------------------------------------------------- | ---- |
| `inflectiv_chainaware_fraud`             | Predictive fraud / AML risk for a wallet          | Paid |
| `inflectiv_chainaware_rug_pull`          | Predictive rug-pull risk for a wallet             | Paid |
| `inflectiv_chainaware_credit_score`      | On-chain credit score for a wallet                | Paid |
| `inflectiv_chainaware_behaviour`         | Predictive behaviour profile for a wallet         | Paid |
| `inflectiv_chainaware_token_rank`        | Ranked token list for a network (paged, sortable) | Paid |
| `inflectiv_chainaware_token_rank_single` | Ranking for a single token by contract address    | Paid |

Requires the `chainaware_api` feature on your subscription tier. Calls spend from the **paid** credit pool; same-day repeat lookups are cached for free, and unprovisioned wallet lookups are not charged.

Each tool's full parameters and credit cost are described in its tool definition, which your MCP client surfaces automatically.

---

## Examples

Once connected, ask your AI agent in natural language:

```
"List my datasets"
"Search my knowledge base for refund policy"
"Upload my-data.pdf to the dataset"
"Create an agent called Support Bot with a friendly personality"
"Chat with agent 42: What are the return deadlines?"
"Write this as intelligence: Our return window is 30 days"
"Register a webhook at https://example.com/hook for processed events"
"Check the fraud risk on wallet 0xabc… on ETH"
```

---

## Use Cases

- **Customer support agent** — Upload help docs, FAQs, and policies; create a friendly agent; let any MCP client answer customer questions with sourced responses.
- **Research assistant** — Feed papers and notes into a dataset, search semantically across thousands of documents, and write new findings back as instantly searchable intelligence.
- **Knowledge base for AI workflows** — Build a structured base any agent can query; use webhooks to react when new intelligence is processed.
- **Data pipeline automation** — Upload CSV/JSON/Parquet programmatically, monitor processing status, trigger reindexing after bulk loads.
- **Multi-agent collaboration** — Specialized agents (researcher, writer, analyst) sharing datasets, with self-learning mode so agents contribute back.

---

## Crypto Payments (x402)

The server can pay for paid operations automatically using USDC on Base via the [x402](https://www.x402.org) protocol — no top-up needed. Set `INFLECTIV_WALLET_PRIVATE_KEY` to a funded EVM wallet; when an API call returns `402 Payment Required`, the server signs and retries the request with payment.

> ⚠️ A wallet private key grants full control of that wallet. Use a dedicated, low-balance wallet, never your primary one, and never commit or share the key.

---

## MCP Resources

The server also exposes reference resources any MCP client can read:

| URI                                 | Content                                   |
| ----------------------------------- | ----------------------------------------- |
| `inflectiv://docs/overview`       | Authentication, concepts, getting started |
| `inflectiv://docs/webhook-events` | Event types and payload examples          |
| `inflectiv://docs/credit-costs`   | Full credit cost table                    |

---

## Requirements

- Node.js 18+
- An Inflectiv API key — [get one here](https://app.inflectiv.ai)

The server is published as [`@inflectiv-ai/inflectiv-mcp`](https://www.npmjs.com/package/@inflectiv-ai/inflectiv-mcp) on npm and runs automatically via `npx` — no build or installation step required. All processing is handled server-side by the Inflectiv platform.

---

## Links

- [npm package](https://www.npmjs.com/package/@inflectiv-ai/inflectiv-mcp)
- [Inflectiv dashboard](https://app.inflectiv.ai)
- [Model Context Protocol](https://modelcontextprotocol.io)

---

## License

[MIT](./LICENSE) © Inflectiv
