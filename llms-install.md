# Installing the Inflectiv MCP server (instructions for AI agents such as Cline)

The server runs straight from npm with `npx`. There is nothing to clone, build or install.

## 1. Get the user's API key

Ask the user for their Inflectiv API key and wait for the real value. Do not write a placeholder.

- They create one at https://app.inflectiv.ai → **Datasets → select a dataset → Create Key**.
- Keys start with `inf_`. A per-dataset key looks like `inf_...`; a global key, which covers all of the user's datasets, starts with `inf_global_`.

## 2. Add the server to YOUR OWN MCP settings

Install into the MCP settings of the client you are running in. For Cline that is `cline_mcp_settings.json` (in the Cline panel: MCP → Edit Configuration). Do not configure Claude Desktop or any other client unless the user asks for it.

```json
{
  "mcpServers": {
    "inflectiv": {
      "command": "npx",
      "args": ["-y", "@inflectiv-ai/inflectiv-mcp"],
      "env": {
        "INFLECTIV_API_KEY": "<the user's key>"
      }
    }
  }
}
```

If the settings file already has other servers, add `inflectiv` alongside them rather than replacing the file.

## 3. Leave the wallet key out

Do not set `INFLECTIV_WALLET_PRIVATE_KEY` unless the user explicitly asks for it. It is optional and only used to pay per request in USDC on Base once credits run out. If the user does want it, recommend a dedicated, low-balance wallet.

## 4. Verify

Call `inflectiv_list_datasets`. Any list, even an empty one, means the server is connected. A 401 error means the API key is wrong. To check search, call `inflectiv_search_dataset` with a question about one of the user's datasets.
