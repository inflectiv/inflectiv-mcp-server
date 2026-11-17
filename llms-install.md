# Installing the Inflectiv MCP server (instructions for AI agents such as Cline)

The server runs straight from npm with `npx`. There is nothing to clone, build or install, so do not clone this repository and do not create config files in the user's project or in a cloned folder.

## 1. Get the user's API key

Ask the user for their Inflectiv API key and wait for the real value. Do not write a placeholder.

- They create one at https://app.inflectiv.ai → **Datasets → select a dataset → Create Key**.
- Keys start with `inf_`. A per-dataset key looks like `inf_...`; a global key, which covers all of the user's datasets, starts with `inf_global_`.

## 2. Add the server to YOUR OWN MCP settings

Install into the MCP settings file of the client you are running in. Do not configure Claude Desktop, Claude Code (`.mcp.json`) or any other client unless the user asks for it.

**Cline** reads exactly one settings file. Edit the one that exists:

- Current Cline: `~/.cline/data/settings/cline_mcp_settings.json` (on Windows `%USERPROFILE%\.cline\data\settings\cline_mcp_settings.json`).
- Older Cline: `cline_mcp_settings.json` in the editor's global storage, under `User/globalStorage/saoudrizwan.claude-dev/settings/`. The editor folder is `%APPDATA%\Code` or `%APPDATA%\Cursor` on Windows, `~/Library/Application Support/Code` (or `Cursor`) on macOS, and `~/.config/Code` (or `Cursor`) on Linux.

The user can also open it from the Cline panel: MCP → Edit Configuration. Once the file is saved, Cline starts the server by itself. If `inflectiv` does not appear as connected in Cline's MCP list, the wrong file was edited.

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

Verify through the client's own MCP connection, not by running `npx` in a terminal: call the `inflectiv_list_datasets` tool. Any list, even an empty one, means the server is connected. A 401 error means the API key is wrong. To check search, call `inflectiv_search_dataset` with a question about one of the user's datasets.
