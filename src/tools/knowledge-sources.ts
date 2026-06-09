import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { InflectivClient } from "../client.js";
import { formatError } from "../errors.js";

export function registerKnowledgeSourceTools(
  server: McpServer,
  client: InflectivClient,
) {
  server.tool(
    "inflectiv_list_knowledge_sources",
    "List ALL knowledge sources in a dataset (files, URLs, manual text, AI-generated, etc.). Free.",
    {
      dataset_id: z
        .number()
        .int()
        .optional()
        .describe(
          "Required when authenticating with a global API key. Ignored for per-dataset keys.",
        ),
      source_type: z
        .enum([
          "file",
          "url",
          "manual",
          "ai_generated",
          "agent_text",
          "agent_url",
          "token_pair",
        ])
        .optional()
        .describe("Filter by source type"),
      status: z
        .enum(["processing", "processed", "failed"])
        .optional()
        .describe("Filter by processing status"),
      skip: z
        .number()
        .int()
        .min(0)
        .optional()
        .describe("Number of items to skip (default: 0)"),
      limit: z
        .number()
        .int()
        .min(1)
        .max(100)
        .optional()
        .describe("Number of items to return (default: 50)"),
    },
    async ({ dataset_id, source_type, status, skip, limit }) => {
      try {
        const params = new URLSearchParams();
        if (dataset_id !== undefined) params.set("dataset_id", String(dataset_id));
        if (source_type) params.set("source_type", source_type);
        if (status) params.set("status", status);
        if (skip !== undefined) params.set("skip", String(skip));
        if (limit !== undefined) params.set("limit", String(limit));
        const qs = params.toString();
        const path = `${client.pathPrefix}/ext/knowledge-sources/${qs ? `?${qs}` : ""}`;
        const data = await client.get(path);
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      } catch (err) {
        return formatError(err);
      }
    },
  );
}
