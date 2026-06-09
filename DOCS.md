# Inflectiv MCP Server — Documentation

The Inflectiv MCP Server (`@inflectiv/mcp-server`) is a [Model Context Protocol](https://modelcontextprotocol.io) server that connects Claude Desktop and Claude Code directly to the Inflectiv AI platform. It exposes **23 tools** and **3 documentation resources** for managing AI agents, knowledge datasets, file uploads, and webhooks — all from within Claude's interface.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Installation](#installation)
- [Configuration](#configuration)
- [Environment Routing](#environment-routing)
- [Tools Reference](#tools-reference)
  - [Agents](#agents-8-tools)
  - [Datasets](#datasets-8-tools)
  - [Files](#files-4-tools)
  - [Webhooks](#webhooks-3-tools)
- [MCP Resources](#mcp-resources)
- [Credit System](#credit-system)
- [Webhook Events](#webhook-events)
- [Error Handling](#error-handling)
- [Architecture](#architecture)
- [Building from Source](#building-from-source)

---

## Quick Start

1. Get an API key from the [Inflectiv dashboard](https://app.inflectiv.ai) under **Settings > API Keys**
2. Add the server to your Claude Desktop or Claude Code config (see [Installation](#installation))
3. Ask Claude to `list my agents` or `search my dataset for X`

---

## Installation

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "inflectiv": {
      "command": "npx",
      "args": ["-y", "@inflectiv/mcp-server"],
      "env": {
        "INFLECTIV_API_KEY": "inf_your_key_here"
      }
    }
  }
}
```

### Claude Code

Add to your project's `.mcp.json`:

```json
{
  "mcpServers": {
    "inflectiv": {
      "command": "npx",
      "args": ["-y", "@inflectiv/mcp-server"],
      "env": {
        "INFLECTIV_API_KEY": "inf_your_key_here"
      }
    }
  }
}
```

### Local Development

Point to a local API instance running on port 18001:

```json
{
  "mcpServers": {
    "inflectiv": {
      "command": "node",
      "args": ["/path/to/packages/mcp-server/dist/index.js"],
      "env": {
        "INFLECTIV_API_KEY": "inf_your_key_here",
        "INFLECTIV_BASE_URL": "http://localhost:18001"
      }
    }
  }
}
```

### Railway Dev Environment

Point to the Railway staging deployment:

```json
{
  "mcpServers": {
    "inflectiv": {
      "command": "node",
      "args": ["/path/to/packages/mcp-server/dist/index.js"],
      "env": {
        "INFLECTIV_API_KEY": "inf_your_key_here",
        "INFLECTIV_BASE_URL": "https://inflectiv-unified-development.up.railway.app"
      }
    }
  }
}
```

---

## Configuration

| Variable               | Required | Default                                   | Description                        |
| ---------------------- | -------- | ----------------------------------------- | ---------------------------------- |
| `INFLECTIV_API_KEY`  | Yes      | —                                        | API key (must start with `inf_`) |
| `INFLECTIV_BASE_URL` | No       | `https://app.inflectiv.ai/api/platform` | Override the API base URL          |

API keys are scoped to a single dataset. All operations through the MCP server use the dataset associated with your API key.

---

## Environment Routing

The MCP server automatically determines the correct API path prefix based on the `INFLECTIV_BASE_URL`:

| Environment           | Base URL                                                 | Path Prefix       | Full Example                    |
| --------------------- | -------------------------------------------------------- | ----------------- | ------------------------------- |
| **Production**  | `https://app.inflectiv.ai/api/platform`                | _(none)_        | `.../api/platform/ext/agents` |
| **Railway Dev** | `https://inflectiv-unified-development.up.railway.app` | `/api/platform` | `.../api/platform/ext/agents` |
| **Localhost**   | `http://localhost:18001`                               | `/api/v2`       | `.../api/v2/ext/agents`       |

- **Production**: The base URL already includes `/api/platform`, so no prefix is added.
- **Railway**: Routes through the Next.js frontend proxy which forwards `/api/platform/*` to the platform API backend.
- **Localhost**: Hits the FastAPI backend directly at `/api/v2`.

---

## Tools Reference


### Agents (8 tools)

#### `inflectiv_list_agents`

List all agents that have your API key's dataset attached.

- **Cost**: Free
- **Parameters**: None
- **Returns**: Array of agents with id, name, description, personality, model settings, and attached dataset IDs.

---

#### `inflectiv_create_agent`

Create a new AI agent attached to your API key's dataset.

- **Cost**: 5 credits
- **Parameters**:

| Parameter               | Type              | Required | Default            | Description                |
| ----------------------- | ----------------- | -------- | ------------------ | -------------------------- |
| `name`                | string (1-255)    | Yes      | —                 | Agent name                 |
| `description`         | string (max 1000) | No       | —                 | Agent description          |
| `personality`         | string            | No       | `"professional"` | Personality style          |
| `system_instructions` | string (max 2000) | No       | —                 | Custom system prompt       |
| `response_length`     | string            | No       | `"concise"`      | Response length preference |
| `model_name`          | string            | No       | `"z-ai/glm-4.7:nitro"`  | LLM model to use           |
| `temperature`         | integer (0-100)   | No       | `70`             | Sampling temperature       |

---

#### `inflectiv_get_agent`

Get details of a specific agent.

- **Cost**: Free
- **Parameters**:

| Parameter    | Type    | Required | Description |
| ------------ | ------- | -------- | ----------- |
| `agent_id` | integer | Yes      | Agent ID    |

---

#### `inflectiv_update_agent_config`

Update an agent's configuration. Only provide the fields you want to change.

- **Cost**: 2 credits
- **Parameters**:

| Parameter               | Type              | Required | Description           |
| ----------------------- | ----------------- | -------- | --------------------- |
| `agent_id`            | integer           | Yes      | Agent ID              |
| `name`                | string (1-255)    | No       | New name              |
| `description`         | string (max 1000) | No       | New description       |
| `personality`         | string            | No       | New personality style |
| `system_instructions` | string (max 2000) | No       | New system prompt     |
| `response_length`     | string            | No       | New response length   |
| `model_name`          | string            | No       | New LLM model         |
| `temperature`         | integer (0-100)   | No       | New temperature       |

---

#### `inflectiv_chat_with_agent`

Send a message to an agent and get a RAG-enabled response. The agent retrieves relevant context from its attached datasets before responding.

- **Cost**: 1 credit per message
- **Parameters**:

| Parameter                | Type            | Required | Description                              |
| ------------------------ | --------------- | -------- | ---------------------------------------- |
| `agent_id`             | integer         | Yes      | Agent ID                                 |
| `message`              | string (1-4000) | Yes      | Message to send                          |
| `conversation_history` | array           | No       | Previous messages for multi-turn context |

The `conversation_history` is an array of `{role, content}` objects:

```json
[
  {"role": "user", "content": "What is Inflectiv?"},
  {"role": "assistant", "content": "Inflectiv is an AI platform..."},
  {"role": "user", "content": "Tell me more about its features"}
]
```

---

#### `inflectiv_list_agent_datasets`

List all datasets attached to a specific agent.

- **Cost**: Free
- **Parameters**:

| Parameter    | Type    | Required | Description |
| ------------ | ------- | -------- | ----------- |
| `agent_id` | integer | Yes      | Agent ID    |

---

#### `inflectiv_attach_dataset`

Attach a dataset to an agent.

- **Cost**: Free
- **Parameters**:

| Parameter      | Type    | Required | Default         | Description                            |
| -------------- | ------- | -------- | --------------- | -------------------------------------- |
| `agent_id`   | integer | Yes      | —              | Agent ID                               |
| `dataset_id` | integer | Yes      | —              | Dataset ID to attach                   |
| `mode`       | enum    | No       | `"read_only"` | `"read_only"` or `"self_learning"` |

- **`read_only`**: Agent can only read from the dataset.
- **`self_learning`**: Agent can also write learned information back to the dataset.

---

#### `inflectiv_update_dataset_mode`

Change the mode of a dataset already attached to an agent.

- **Cost**: Free
- **Parameters**:

| Parameter      | Type    | Required | Description                            |
| -------------- | ------- | -------- | -------------------------------------- |
| `agent_id`   | integer | Yes      | Agent ID                               |
| `dataset_id` | integer | Yes      | Dataset ID                             |
| `mode`       | enum    | Yes      | `"read_only"` or `"self_learning"` |

---

### Datasets (8 tools)

#### `inflectiv_list_datasets`

List datasets accessible via your API key.

- **Cost**: Free
- **Parameters**: None

---

#### `inflectiv_update_dataset`

Update your dataset's name and/or description. Only the dataset owner can update.

- **Cost**: Free
- **Parameters**:

| Parameter       | Type              | Required | Description      |
| --------------- | ----------------- | -------- | ---------------- |
| `name`        | string (1-255)    | No       | New dataset name |
| `description` | string (max 1000) | No       | New description  |

---

#### `inflectiv_reindex_dataset`

Reindex all vectors in the dataset. Useful after bulk writes or if search quality degrades.

- **Cost**: 2 credits
- **Parameters**: None

---

#### `inflectiv_search_dataset`

Semantic (vector) search across the dataset's knowledge base.

- **Cost**: 1 credit
- **Parameters**:

| Parameter           | Type            | Required | Default | Description              |
| ------------------- | --------------- | -------- | ------- | ------------------------ |
| `query`           | string (1-2000) | Yes      | —      | Search query             |
| `top_k`           | integer (1-20)  | No       | `5`   | Number of results        |
| `score_threshold` | float (0.0-1.0) | No       | `0.6` | Minimum similarity score |

**Returns**: Ranked results with similarity scores and matched content.

---

#### `inflectiv_batch_search`

Run multiple semantic searches in a single API call. Up to 20 queries.

- **Cost**: 1 credit per query
- **Parameters**:

| Parameter           | Type            | Required | Default | Description              |
| ------------------- | --------------- | -------- | ------- | ------------------------ |
| `queries`         | string[] (1-20) | Yes      | —      | List of search queries   |
| `top_k`           | integer (1-20)  | No       | `5`   | Results per query        |
| `score_threshold` | float (0.0-1.0) | No       | `0.6` | Minimum similarity score |

---

#### `inflectiv_write_intelligence`

Write a single intelligence entry to the dataset. Intelligence entries are programmatic knowledge — text that gets chunked, embedded, and indexed for search and RAG.

- **Cost**: 1 credit (0 if duplicate detected)
- **Parameters**:

| Parameter             | Type              | Required | Default          | Description                         |
| --------------------- | ----------------- | -------- | ---------------- | ----------------------------------- |
| `agent_id`          | integer           | Yes      | —               | Owning agent ID                     |
| `content`           | string (1-50000)  | Yes      | —               | Knowledge text content              |
| `title`             | string (max 255)  | No       | —               | Entry title                         |
| `source_type`       | enum              | No       | `"agent_text"` | `"agent_text"` or `"agent_url"` |
| `source_identifier` | string (max 2000) | No       | —               | Source URL or identifier            |

Duplicate detection is automatic via content hashing. Writing the same content again costs 0 credits.

---

#### `inflectiv_batch_write_intelligence`

Write up to 50 intelligence entries in a single call.

- **Cost**: 1 credit per new entry (duplicates are free)
- **Parameters**:

| Parameter    | Type         | Required | Description                   |
| ------------ | ------------ | -------- | ----------------------------- |
| `agent_id` | integer      | Yes      | Owning agent ID               |
| `entries`  | array (1-50) | Yes      | Intelligence entries to write |

Each entry in the `entries` array:

```json
{
  "content": "The knowledge text...",
  "title": "Optional title",
  "source_type": "agent_text",
  "source_identifier": "https://example.com/source"
}
```

**Returns**: Per-entry status (processed, deduped, or failed).

---

#### `inflectiv_list_intelligence`

List intelligence entries with filtering and pagination.

- **Cost**: Free
- **Parameters**:

| Parameter    | Type            | Required | Default | Description                                        |
| ------------ | --------------- | -------- | ------- | -------------------------------------------------- |
| `agent_id` | integer         | No       | —      | Filter by agent                                    |
| `status`   | enum            | No       | —      | `"processing"`, `"processed"`, or `"failed"` |
| `limit`    | integer (1-100) | No       | `50`  | Results to return                                  |
| `offset`   | integer         | No       | `0`   | Pagination offset                                  |

---

### Files (4 tools)

#### `inflectiv_list_files`

List files (knowledge sources) in the dataset.

- **Cost**: Free
- **Parameters**:

| Parameter | Type            | Required | Default | Description     |
| --------- | --------------- | -------- | ------- | --------------- |
| `skip`  | integer         | No       | `0`   | Files to skip   |
| `limit` | integer (1-100) | No       | `50`  | Files to return |

---

#### `inflectiv_get_file`

Get details of a specific file including processing status and chunk count.

- **Cost**: Free
- **Parameters**:

| Parameter   | Type    | Required | Description |
| ----------- | ------- | -------- | ----------- |
| `file_id` | integer | Yes      | File ID     |

---

#### `inflectiv_upload_file`

Upload a local file to the dataset as a knowledge source. The file is automatically chunked, embedded, and indexed.

- **Cost**: 5 credits base + 1 credit per MB over 5MB
- **Parameters**:

| Parameter     | Type             | Required | Description                     |
| ------------- | ---------------- | -------- | ------------------------------- |
| `file_path` | string           | Yes      | Absolute path to the local file |
| `title`     | string (max 255) | No       | Display title                   |

**Supported formats**:

- Documents: `.pdf`, `.docx`, `.txt`, `.md`, `.html`, `.xml`
- Structured data: `.csv`, `.json`, `.jsonl`, `.tsv`, `.xlsx`, `.xls`, `.parquet`

---

#### `inflectiv_reprocess_file`

Reprocess a previously uploaded file. Useful if the initial processing failed.

- **Cost**: 5 credits
- **Parameters**:

| Parameter   | Type    | Required | Description          |
| ----------- | ------- | -------- | -------------------- |
| `file_id` | integer | Yes      | File ID to reprocess |

---

### Webhooks (3 tools)

#### `inflectiv_register_webhook`

Register an HTTPS endpoint to receive event notifications. Maximum 10 webhooks per user.

- **Cost**: Free
- **Parameters**:

| Parameter       | Type                     | Required | Description                                                |
| --------------- | ------------------------ | -------- | ---------------------------------------------------------- |
| `url`         | string (HTTPS, max 2000) | Yes      | Webhook endpoint URL                                       |
| `events`      | string[]                 | Yes      | Events to subscribe to (see[Webhook Events](#webhook-events)) |
| `description` | string (max 500)         | No       | Webhook description                                        |

**Returns**: Webhook details including a unique `secret` for signature verification. The secret is only returned once — store it securely.

---

#### `inflectiv_list_webhooks`

List all registered webhooks.

- **Cost**: Free
- **Parameters**: None

---

#### `inflectiv_test_webhook`

Send a test event to a registered webhook to verify it's receiving payloads.

- **Cost**: Free
- **Parameters**:

| Parameter      | Type    | Required | Description        |
| -------------- | ------- | -------- | ------------------ |
| `webhook_id` | integer | Yes      | Webhook ID to test |

---

## MCP Resources

The server exposes three documentation resources that Claude can reference:

| Resource URI                        | Description                                              |
| ----------------------------------- | -------------------------------------------------------- |
| `inflectiv://docs/overview`       | Authentication, base URL, core concepts, getting started |
| `inflectiv://docs/webhook-events` | Event types with example payloads                        |
| `inflectiv://docs/credit-costs`   | Complete credit cost table for all 23 tools              |

---

## Credit System

| Operation                | Tool                                   | Credits                |
| ------------------------ | -------------------------------------- | ---------------------- |
| List agents              | `inflectiv_list_agents`              | Free                   |
| Create agent             | `inflectiv_create_agent`             | 5                      |
| Get agent                | `inflectiv_get_agent`                | Free                   |
| Update agent config      | `inflectiv_update_agent_config`      | 2                      |
| Chat with agent          | `inflectiv_chat_with_agent`          | 1                      |
| List agent datasets      | `inflectiv_list_agent_datasets`      | Free                   |
| Attach dataset           | `inflectiv_attach_dataset`           | Free                   |
| Update dataset mode      | `inflectiv_update_dataset_mode`      | Free                   |
| List datasets            | `inflectiv_list_datasets`            | Free                   |
| Update dataset           | `inflectiv_update_dataset`           | Free                   |
| Reindex dataset          | `inflectiv_reindex_dataset`          | 2                      |
| Search dataset           | `inflectiv_search_dataset`           | 1                      |
| Batch search             | `inflectiv_batch_search`             | 1 per query            |
| Write intelligence       | `inflectiv_write_intelligence`       | 1 (0 if duplicate)     |
| Batch write intelligence | `inflectiv_batch_write_intelligence` | 1 per new entry        |
| List intelligence        | `inflectiv_list_intelligence`        | Free                   |
| List files               | `inflectiv_list_files`               | Free                   |
| Get file                 | `inflectiv_get_file`                 | Free                   |
| Upload file              | `inflectiv_upload_file`              | 5 base + 1/MB over 5MB |
| Reprocess file           | `inflectiv_reprocess_file`           | 5                      |
| Register webhook         | `inflectiv_register_webhook`         | Free                   |
| List webhooks            | `inflectiv_list_webhooks`            | Free                   |
| Test webhook             | `inflectiv_test_webhook`             | Free                   |

When a tool call fails due to insufficient credits, the error response includes the required and available credit amounts with a link to the dashboard to top up.

---

## Webhook Events

### `intelligence.processed`

Fired when an intelligence entry has been successfully embedded and indexed.

```json
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
```

### `intelligence.failed`

Fired when intelligence processing fails.

```json
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
```

### `intelligence.deduped`

Fired when a duplicate intelligence entry is detected and skipped.

```json
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
```

### `dataset.mode_changed`

Fired when a dataset's mode is changed on an agent.

```json
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
```

---

## Error Handling

The MCP server returns structured error messages for different failure scenarios:

### API Errors

HTTP errors from the Inflectiv platform with status code and detail message.

```
Inflectiv API Error (401): Invalid or expired API key.
```

### Insufficient Credits

Includes the required and available credit amounts with a dashboard link.

```
Inflectiv API Error (402): Insufficient credits.
Required: 5, Available: 2. Top up at https://app.inflectiv.ai
```

### Validation Errors

Input validation failures with field-specific messages (powered by Zod).

```
Validation Error:
  - name: String must contain at least 1 character(s)
  - temperature: Number must be less than or equal to 100
```

### Network Errors

Connection failures with diagnostic guidance.

```
Network error: Could not reach Inflectiv API. Check your INFLECTIV_BASE_URL and network connection.
```

---

## Architecture

```
packages/mcp-server/
├── src/
│   ├── index.ts              # Entry point — starts stdio transport
│   ├── server.ts             # MCP server factory, registers all tools & resources
│   ├── client.ts             # HTTP client with auth, environment routing, file upload
│   ├── errors.ts             # Error formatting (API, validation, network, credits)
│   ├── tools/
│   │   ├── index.ts          # Barrel exports
│   │   ├── agents.ts         # 8 agent management tools
│   │   ├── datasets.ts       # 8 dataset & intelligence tools
│   │   ├── files.ts          # 4 file upload/management tools
│   │   └── webhooks.ts       # 3 webhook tools
│   └── resources/
│       ├── index.ts          # Barrel exports
│       └── api-docs.ts       # 3 documentation resources (overview, events, credits)
├── dist/                     # Compiled output (gitignored)
├── package.json
├── tsconfig.json
└── tsup.config.ts            # ESM build with shebang
```

### Key Design Decisions

- **Stdio transport**: Communicates with Claude via stdin/stdout (standard MCP pattern).
- **Zod validation**: All tool inputs are validated before reaching the API.
- **Environment-aware routing**: Automatically determines the correct API path prefix based on the base URL.
- **Trailing slash stripping**: Prevents 308 redirects that cause auth header loss on certain deployments.
- **Credit-aware errors**: Parses insufficient credit responses and surfaces actionable information.
- **JSON responses**: All tool outputs return prettified JSON text blocks.

### Dependencies

| Package                       | Purpose              |
| ----------------------------- | -------------------- |
| `@modelcontextprotocol/sdk` | MCP server framework |
| `zod`                       | Input validation     |

---

## Building from Source

```bash
cd packages/mcp-server
bun install
bun run build
```

The build produces a single ESM file at `dist/index.js` with a Node.js shebang, ready to run as `node dist/index.js`.

For development with auto-rebuild:

```bash
bun run dev
```
