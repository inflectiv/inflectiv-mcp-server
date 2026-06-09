# Inflectiv MCP Server

Connect any AI agent to the [Inflectiv](https://app.inflectiv.ai) data platform via the [Model Context Protocol](https://modelcontextprotocol.io). Build knowledge bases, create AI agents, search datasets, upload files, and chat — from any MCP-compatible client.

**Works with any AI agent** — not limited to coding tasks. Use it for research, customer support, content creation, data pipelines, multi-agent workflows, and more.

## What It Does

Inflectiv turns raw data (documents, URLs, text, files) into structured, searchable knowledge that AI agents can query and build on. This MCP server gives your agent direct access to:

- **Search** — Semantic search across your knowledge base with RAG-powered results
- **Agents** — Create and chat with AI agents trained on your data
- **Knowledge** — Write, read, and manage intelligence entries (auto-embedded, deduplicated)
- **Files** — Upload PDFs, CSVs, JSONs, and 10+ other formats as knowledge sources
- **Webhooks** — Subscribe to real-time events when data is processed
- **Crypto payments** — Pay per API call with USDC on Base when credits run out (x402 protocol)

## Quick Start

1. Get an API key from the [Inflectiv dashboard](https://app.inflectiv.ai) → **Datasets → Select Dataset → Create Key**
2. Add the config below to your MCP client
3. Ask your agent: *"search my dataset for machine learning"* or *"list my agents"*

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

Or edit `.mcp.json` directly in your project root:

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

### Cursor / Windsurf / Other MCP Clients

Any MCP-compatible client works. Run `npx -y @inflectiv-ai/inflectiv-mcp` with the `INFLECTIV_API_KEY` env var.

## Configuration

| Variable                         | Required | Default                                   | Description                                                                                                      |
| -------------------------------- | -------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `INFLECTIV_API_KEY`            | Yes      | —                                        | API key scoped to a dataset (starts with `inf_`). Create one from any dataset page in the dashboard.           |
| `INFLECTIV_BASE_URL`           | No       | `https://app.inflectiv.ai/api/platform` | Override API URL (for self-hosted or local dev)                                                                  |
| `INFLECTIV_WALLET_PRIVATE_KEY` | No       | —                                        | EVM wallet private key for x402 crypto payments. When set and credits are 0, pays per-request with USDC on Base. |

## Tools (27)

### Agents

| Tool                              | Description                                                   | Cost |
| --------------------------------- | ------------------------------------------------------------- | ---- |
| `inflectiv_list_agents`         | List all your agents                                          | Free |
| `inflectiv_create_agent`        | Create a new AI agent                                         | Paid |
| `inflectiv_get_agent`           | Get agent details                                             | Free |
| `inflectiv_update_agent_config` | Update agent settings (model, personality, temperature, etc.) | Paid |
| `inflectiv_chat_with_agent`     | Chat with RAG-enabled responses (supports multi-turn)         | Paid |
| `inflectiv_list_agent_datasets` | List datasets attached to an agent                            | Free |
| `inflectiv_attach_dataset`      | Attach a dataset to an agent                                  | Free |
| `inflectiv_update_dataset_mode` | Switch between `read_only` and `self_learning`            | Free |

### Datasets & Search

| Tool                                 | Description                                                 | Cost |
| ------------------------------------ | ----------------------------------------------------------- | ---- |
| `inflectiv_list_datasets`          | List accessible datasets                                    | Free |
| `inflectiv_create_dataset`         | Create a new dataset (requires a global key)                | Paid |
| `inflectiv_clone_dataset`          | Clone an accessible dataset into your account (global key)  | Paid |
| `inflectiv_update_dataset`         | Update dataset name/description                             | Free |
| `inflectiv_reindex_dataset`        | Reindex vectors (run after bulk changes)                    | Paid |
| `inflectiv_search_dataset`         | Semantic search across your knowledge base                  | Paid |
| `inflectiv_batch_search`           | Run up to 20 searches in one call                           | Paid |
| `inflectiv_cross_query`            | Query multiple datasets at once (global key, advanced tier) | Paid |
| `inflectiv_list_knowledge_sources` | List all sources (files, URLs, text, AI-generated)          | Free |

> **Global API keys** (`inf_global_*`) unlock account-level tools — `inflectiv_create_dataset`, `inflectiv_clone_dataset`, and `inflectiv_cross_query`. A per-dataset key (`inf_*`) operates only on its bound dataset.

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

**Supported formats:** PDF, DOCX, TXT, MD, HTML, CSV, JSON, JSONL, TSV, XLSX, XLS, Parquet, XML

### Webhooks

| Tool                           | Description                               | Cost |
| ------------------------------ | ----------------------------------------- | ---- |
| `inflectiv_register_webhook` | Subscribe to events (HTTPS only)          | Free |
| `inflectiv_list_webhooks`    | List registered webhooks                  | Free |
| `inflectiv_test_webhook`     | Send a test event to verify your endpoint | Free |

**Events:** `intelligence.processed`, `intelligence.failed`, `intelligence.deduped`, `dataset.mode_changed`

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
```

## Use Cases

**Customer Support Agent** — Upload your help docs, FAQs, and policies. Create an agent with a friendly personality. Any AI client can chat with it to answer customer questions with accurate, sourced responses.

**Research Assistant** — Feed papers, reports, and notes into a dataset. Use semantic search to find relevant information across thousands of documents. Write new findings as intelligence entries that become instantly searchable.

**Knowledge Base for AI Workflows** — Build a structured knowledge base that any AI agent can query. Use webhooks to get notified when new intelligence is processed. Chain multiple agents — one writes intelligence, another searches and synthesizes.

**Data Pipeline Automation** — Upload CSVs, JSONs, and Parquet files programmatically. Monitor processing status via file tools. Trigger reindexing after bulk uploads. Query the processed data via semantic search.

**Multi-Agent Collaboration** — Create specialized agents (researcher, writer, analyst) each with different personalities and instructions. Attach shared datasets so they all access the same knowledge. Use self-learning mode so agents can contribute back to the dataset.

**Crypto-Native API Access** — No account needed for paid operations. Set a wallet private key and pay per-request with USDC on Base via x402 protocol. Fully anonymous, no KYC — any wallet with USDC can access the API.

## Resources

The server also exposes MCP resources for reference:

| URI                                 | Content                                   |
| ----------------------------------- | ----------------------------------------- |
| `inflectiv://docs/overview`       | Authentication, concepts, getting started |
| `inflectiv://docs/webhook-events` | Event types and payload examples          |
| `inflectiv://docs/credit-costs`   | Full credit cost table                    |

## Requirements

- Node.js 18+
- An Inflectiv API key ([get one here](https://app.inflectiv.ai))

## License

MIT
