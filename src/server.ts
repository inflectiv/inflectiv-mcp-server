import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { InflectivClient } from "./client.js";
import {
  registerAgentTools,
  registerDatasetTools,
  registerFileTools,
  registerKnowledgeSourceTools,
  registerWebhookTools,
} from "./tools/index.js";
import { registerResources } from "./resources/index.js";

export function createServer(): McpServer {
  const apiKey = process.env.INFLECTIV_API_KEY;
  if (!apiKey) {
    console.error(
      "Error: INFLECTIV_API_KEY environment variable is required.\n" +
        "Get your API key from https://app.inflectiv.ai (Settings > API Keys).",
    );
    process.exit(1);
  }

  const baseUrl = process.env.INFLECTIV_BASE_URL;
  const client = new InflectivClient(apiKey, baseUrl);

  const server = new McpServer({
    name: "inflectiv",
    version: "0.1.0",
  });

  registerAgentTools(server, client);
  registerDatasetTools(server, client);
  registerFileTools(server, client);
  registerKnowledgeSourceTools(server, client);
  registerWebhookTools(server, client);
  registerResources(server);

  return server;
}
