import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerResources(server: McpServer) {
  server.resource(
    "docs-overview",
    "inflectiv://docs/overview",
    {
      description: "Inflectiv API overview — authentication, base URL, credit system",
      mimeType: "text/markdown",
    },
    async () => ({
      contents: [
        {
          uri: "inflectiv://docs/overview",
          mimeType: "text/markdown",
          text: OVERVIEW_DOC,
        },
      ],
    }),
  );

  server.resource(
    "docs-webhook-events",
    "inflectiv://docs/webhook-events",
    {
      description: "Webhook event types and payload schemas",
      mimeType: "text/markdown",
    },
    async () => ({
      contents: [
        {
          uri: "inflectiv://docs/webhook-events",
          mimeType: "text/markdown",
          text: WEBHOOK_EVENTS_DOC,
        },
      ],
    }),
  );

  server.resource(
    "docs-credit-costs",
    "inflectiv://docs/credit-costs",
    {
      description: "Credit cost table for all API operations",
      mimeType: "text/markdown",
    },
    async () => ({
      contents: [
        {
          uri: "inflectiv://docs/credit-costs",
          mimeType: "text/markdown",
          text: CREDIT_COSTS_DOC,
        },
      ],
    }),
  );
}

const OVERVIEW_DOC = `# Inflectiv API Overview

## Authentication
All requests require an API key passed via the \`X-API-Key\` header.
API keys have the prefix \`inf_\` and are scoped to a single dataset.

## Base URL
Production (via Next.js proxy):
\`\`\`
https://app.inflectiv.ai/api/platform/ext/
\`\`\`
Local development:
\`\`\`
http://localhost:18001/api/v2/ext/
\`\`\`

## Concepts

### Agents
AI chatbots trained on your data. Each agent can have datasets attached for RAG-enabled conversations.

### Datasets
Collections of knowledge sources (files, intelligence entries) that agents use to answer questions.
Each API key is scoped to one dataset.

### Intelligence
Programmatic knowledge entries written directly to a dataset. Useful for syncing external data.
Duplicates are automatically detected and cost 0 credits.

### Files
Documents uploaded to a dataset. Supported formats: PDF, DOCX, TXT, MD, HTML, CSV, JSON, JSONL, TSV, XLSX, XLS, Parquet, XML.
Files are chunked and embedded automatically.

### Webhooks
HTTPS endpoints that receive event notifications (e.g., when intelligence is processed).

## Credit System
Most operations cost credits. Free-tier operations include listing resources and managing webhooks.
See the credit-costs resource for a full breakdown.

## Getting Started
1. Get an API key from the Inflectiv dashboard (Settings > API Keys)
2. Use \`inflectiv_list_datasets\` to see your scoped dataset
3. Use \`inflectiv_list_agents\` to see agents attached to the dataset
4. Upload files or write intelligence to add knowledge
5. Chat with agents using \`inflectiv_chat_with_agent\`
`;

const WEBHOOK_EVENTS_DOC = `# Webhook Events

## Available Events

### \`intelligence.processed\`
Fired when an intelligence entry has been successfully embedded and indexed.
\`\`\`json
{
  "event": "intelligence.processed",
  "timestamp": "2025-01-01T00:00:00Z",
  "data": {
    "intelligence_id": 123,
    "dataset_id": 456,
    "title": "Entry title",
    "status": "processed"
  }
}
\`\`\`

### \`intelligence.failed\`
Fired when intelligence processing fails.
\`\`\`json
{
  "event": "intelligence.failed",
  "timestamp": "2025-01-01T00:00:00Z",
  "data": {
    "intelligence_id": 123,
    "dataset_id": 456,
    "title": "Entry title",
    "status": "failed",
    "error": "Processing error message"
  }
}
\`\`\`

### \`intelligence.deduped\`
Fired when a duplicate intelligence entry is detected and skipped.
\`\`\`json
{
  "event": "intelligence.deduped",
  "timestamp": "2025-01-01T00:00:00Z",
  "data": {
    "intelligence_id": 123,
    "dataset_id": 456,
    "title": "Entry title",
    "status": "deduped"
  }
}
\`\`\`

### \`dataset.mode_changed\`
Fired when a dataset's mode is changed on an agent.
\`\`\`json
{
  "event": "dataset.mode_changed",
  "timestamp": "2025-01-01T00:00:00Z",
  "data": {
    "agent_id": 789,
    "dataset_id": 456,
    "old_mode": "read_only",
    "new_mode": "self_learning"
  }
}
\`\`\`

## Webhook Security
Each webhook receives a unique \`secret\` upon creation. Use this to verify payload signatures.
The secret is only returned once during creation — store it securely.
`;

const CREDIT_COSTS_DOC = `# Credit Costs

| Operation | Tool | Credits |
|-----------|------|---------|
| List agents | \`inflectiv_list_agents\` | Free |
| Create agent | \`inflectiv_create_agent\` | 5 |
| Get agent | \`inflectiv_get_agent\` | Free |
| Update agent config | \`inflectiv_update_agent_config\` | 2 |
| Chat with agent | \`inflectiv_chat_with_agent\` | 1 |
| List agent datasets | \`inflectiv_list_agent_datasets\` | Free |
| Attach dataset | \`inflectiv_attach_dataset\` | Free |
| Update dataset mode | \`inflectiv_update_dataset_mode\` | Free |
| List datasets | \`inflectiv_list_datasets\` | Free |
| Update dataset | \`inflectiv_update_dataset\` | Free |
| Reindex dataset | \`inflectiv_reindex_dataset\` | 2 |
| Search dataset | \`inflectiv_search_dataset\` | 1 |
| Batch search | \`inflectiv_batch_search\` | 1 per query |
| Write intelligence | \`inflectiv_write_intelligence\` | 1 (0 if dup) |
| Batch write intelligence | \`inflectiv_batch_write_intelligence\` | 1 per new entry |
| List intelligence | \`inflectiv_list_intelligence\` | Free |
| List files | \`inflectiv_list_files\` | Free |
| Get file | \`inflectiv_get_file\` | Free |
| Upload file | \`inflectiv_upload_file\` | 5 base + 1/MB over 5MB |
| Reprocess file | \`inflectiv_reprocess_file\` | 5 |
| Register webhook | \`inflectiv_register_webhook\` | Free |
| List webhooks | \`inflectiv_list_webhooks\` | Free |
| Test webhook | \`inflectiv_test_webhook\` | Free |
`;
