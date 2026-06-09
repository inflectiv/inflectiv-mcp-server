# Packaging the Inflectiv MCP Server as a Claude Desktop Extension (.mcpb)

This guide explains how to build and ship the Inflectiv MCP server as a one-click
Claude Desktop extension bundle (`.mcpb`, formerly known as `.dxt`).

## Prerequisites

- Node.js 18+
- Dependencies installed: `npm install`
- A valid `manifest.json` at the package root (already included)

## 1. Build first

The bundle ships compiled JavaScript, not TypeScript. Build it before packing:

```bash
npm run build
```

This runs `tsup` and produces the `dist/` directory referenced by the manifest's
`entry_point` (`dist/index.js`).

## 2. Pack the bundle

Use the MCPB CLI to package the extension:

```bash
npx @anthropic-ai/mcpb pack
```

> Note: the legacy command was `npx @anthropic-ai/dxt pack`. The tooling was
> renamed from DXT to MCPB; prefer the `mcpb` command on current versions.

The pack command reads `manifest.json`, bundles the required runtime files, and
emits a single `.mcpb` archive (e.g. `inflectiv.mcpb`) in the package directory.

### What goes in the bundle

Per the MCPB spec, a Node extension bundle must be self-contained at runtime. It
must include:

- `dist/` — the compiled server output (the `entry_point`)
- `node_modules/` — the production dependencies (`@modelcontextprotocol/sdk`, `zod`)
- `manifest.json` — the extension manifest

`npx @anthropic-ai/mcpb pack` handles this bundling for you, so make sure
dependencies are installed (`npm install`) and the project is built
(`npm run build`) before packing.

## 3. Install in Claude Desktop

Users install the bundle without touching any JSON config:

1. Open **Claude Desktop**
2. Go to **Settings -> Extensions**
3. Choose **Install from file** and select (or drag-and-drop) the `.mcpb` file
4. When prompted, fill in the user configuration:
   - **Inflectiv API Key** (required) — your `inf_...` key
   - **API Base URL** (optional) — defaults to `https://app.inflectiv.ai/api/platform`
   - **EVM Wallet Private Key (x402)** (optional) — for crypto pay-per-call

Sensitive fields (API key, wallet key) are stored securely by Claude Desktop and
injected into the server's environment at launch.

## 4. Verify

After installing, ask the agent something like *"list my Inflectiv datasets"* to
confirm the server starts and authenticates correctly.

## References

- MCPB / Desktop Extensions: https://github.com/anthropics/mcpb
- Model Context Protocol: https://modelcontextprotocol.io
