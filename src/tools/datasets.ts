import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { InflectivClient } from "../client.js";
import { formatError } from "../errors.js";

// Optional dataset_id input shared by every dual-mode tool.
// - Per-dataset key: leave undefined; the key's bound dataset is used.
// - Global key (inf_global_*): MUST be supplied to target a specific dataset.
const datasetIdSchema = {
  dataset_id: z
    .number()
    .int()
    .optional()
    .describe(
      "Required when authenticating with a global API key (inf_global_*). " +
        "Ignored when using a per-dataset key — the key's bound dataset is used.",
    ),
};

function withDatasetId(
  base: string,
  datasetId?: number,
  extra: Record<string, string | number | undefined> = {},
): string {
  const params = new URLSearchParams();
  if (datasetId !== undefined) params.set("dataset_id", String(datasetId));
  for (const [k, v] of Object.entries(extra)) {
    if (v !== undefined) params.set(k, String(v));
  }
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export function registerDatasetTools(
  server: McpServer,
  client: InflectivClient,
) {
  server.tool(
    "inflectiv_list_datasets",
    "List datasets accessible via this API key. Per-dataset key returns the bound dataset. Global key returns every dataset the user owns + active marketplace acquisitions. Free.",
    {},
    async () => {
      try {
        const data = await client.get(`${client.pathPrefix}/ext/datasets/`);
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      } catch (err) {
        return formatError(err);
      }
    },
  );

  server.tool(
    "inflectiv_create_dataset",
    "Create a new dataset. Requires a global API key (inf_global_*). Cost: per credit_costs table.",
    {
      name: z.string().min(1).max(255).describe("Dataset name"),
      description: z
        .string()
        .max(1000)
        .optional()
        .describe("Optional dataset description"),
    },
    async (body) => {
      try {
        const data = await client.post(
          `${client.pathPrefix}/ext/datasets/`,
          body,
        );
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      } catch (err) {
        return formatError(err);
      }
    },
  );

  server.tool(
    "inflectiv_clone_dataset",
    "Clone an accessible dataset into the user's account. Requires a global API key.",
    {
      identifier: z
        .string()
        .describe("Source dataset ID or dataset_api_name to clone"),
    },
    async ({ identifier }) => {
      try {
        const data = await client.post(
          `${client.pathPrefix}/ext/datasets/${encodeURIComponent(identifier)}/clone`,
        );
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      } catch (err) {
        return formatError(err);
      }
    },
  );

  server.tool(
    "inflectiv_update_dataset",
    "Update dataset name, description, and/or instructions. Only the dataset owner can update. Free.",
    {
      ...datasetIdSchema,
      name: z.string().min(1).max(255).optional().describe("New dataset name"),
      description: z
        .string()
        .max(1000)
        .optional()
        .describe("New dataset description"),
      instructions: z
        .string()
        .max(5000)
        .optional()
        .describe(
          "Dataset-level instructions for AI agents. These are automatically applied to any chatbot using this dataset.",
        ),
    },
    async ({ dataset_id, ...body }) => {
      try {
        const data = await client.put(
          withDatasetId(`${client.pathPrefix}/ext/datasets/`, dataset_id),
          body,
        );
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      } catch (err) {
        return formatError(err);
      }
    },
  );

  server.tool(
    "inflectiv_reindex_dataset",
    "Reindex dataset vectors. Useful after bulk changes. Costs 2 credits.",
    datasetIdSchema,
    async ({ dataset_id }) => {
      try {
        const data = await client.post(
          withDatasetId(`${client.pathPrefix}/ext/datasets/reindex`, dataset_id),
        );
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      } catch (err) {
        return formatError(err);
      }
    },
  );

  server.tool(
    "inflectiv_search_dataset",
    "Semantic search across a dataset's knowledge base. Costs 1 credit.",
    {
      ...datasetIdSchema,
      query: z.string().min(1).max(2000).describe("Search query"),
      top_k: z
        .number()
        .int()
        .min(1)
        .max(20)
        .optional()
        .describe("Number of results to return (default: 5)"),
      score_threshold: z
        .number()
        .min(0)
        .max(1)
        .optional()
        .describe("Minimum similarity score 0.0-1.0 (default: 0.6)"),
    },
    async ({ dataset_id, ...body }) => {
      try {
        const data = await client.post(
          withDatasetId(`${client.pathPrefix}/ext/datasets/query`, dataset_id),
          body,
        );
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      } catch (err) {
        return formatError(err);
      }
    },
  );

  server.tool(
    "inflectiv_batch_search",
    "Run multiple semantic searches against a single dataset. Costs 1 credit per query.",
    {
      ...datasetIdSchema,
      queries: z
        .array(z.string())
        .min(1)
        .max(20)
        .describe("List of search queries (1-20)"),
      top_k: z
        .number()
        .int()
        .min(1)
        .max(20)
        .optional()
        .describe("Number of results per query (default: 5)"),
      score_threshold: z
        .number()
        .min(0)
        .max(1)
        .optional()
        .describe("Minimum similarity score 0.0-1.0 (default: 0.6)"),
    },
    async ({ dataset_id, ...body }) => {
      try {
        const data = await client.post(
          withDatasetId(`${client.pathPrefix}/ext/datasets/query/batch`, dataset_id),
          body,
        );
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      } catch (err) {
        return formatError(err);
      }
    },
  );

  server.tool(
    "inflectiv_cross_query",
    "Run one query against multiple accessible datasets at once. Requires a global API key + advanced tier. Costs 1 credit per dataset queried.",
    {
      query: z.string().min(1).max(2000).describe("Search query"),
      dataset_ids: z
        .array(z.number().int())
        .optional()
        .describe(
          "Subset of accessible dataset IDs. Defaults to every dataset the user can access.",
        ),
      top_k: z
        .number()
        .int()
        .min(1)
        .max(20)
        .optional()
        .describe("Number of results to return (default: 5)"),
      score_threshold: z
        .number()
        .min(0)
        .max(1)
        .optional()
        .describe("Minimum similarity score 0.0-1.0 (default: 0.6)"),
    },
    async ({ dataset_ids, ...body }) => {
      try {
        const params = new URLSearchParams();
        for (const did of dataset_ids ?? []) {
          params.append("dataset_ids", String(did));
        }
        const qs = params.toString();
        const path = `${client.pathPrefix}/ext/datasets/cross-query${qs ? `?${qs}` : ""}`;
        const data = await client.post(path, body);
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      } catch (err) {
        return formatError(err);
      }
    },
  );

  server.tool(
    "inflectiv_write_intelligence",
    "Write a single intelligence entry to a dataset. Costs 1 credit (0 if duplicate). Content is embedded and becomes searchable.",
    {
      ...datasetIdSchema,
      agent_id: z
        .number()
        .int()
        .describe("Agent ID that owns this intelligence"),
      content: z
        .string()
        .min(1)
        .max(50000)
        .describe("Intelligence content text"),
      title: z
        .string()
        .max(255)
        .optional()
        .describe("Title for the intelligence entry"),
      source_type: z
        .enum(["agent_text", "agent_url"])
        .optional()
        .describe('Source type (default: "agent_text")'),
      source_identifier: z
        .string()
        .max(2000)
        .optional()
        .describe("Source identifier (e.g. URL)"),
    },
    async ({ dataset_id, agent_id, ...body }) => {
      try {
        const path = withDatasetId(
          `${client.pathPrefix}/ext/datasets/intelligence`,
          dataset_id,
          { agent_id },
        );
        const data = await client.post(path, body);
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      } catch (err) {
        return formatError(err);
      }
    },
  );

  server.tool(
    "inflectiv_batch_write_intelligence",
    "Write multiple intelligence entries to a dataset. Costs 1 credit per new entry (duplicates are free). Max 50 entries.",
    {
      ...datasetIdSchema,
      agent_id: z
        .number()
        .int()
        .describe("Agent ID that owns these intelligence entries"),
      entries: z
        .array(
          z.object({
            content: z
              .string()
              .min(1)
              .max(50000)
              .describe("Intelligence content text"),
            title: z.string().max(255).optional().describe("Entry title"),
            source_type: z
              .enum(["agent_text", "agent_url"])
              .optional()
              .describe('Source type (default: "agent_text")'),
            source_identifier: z
              .string()
              .max(2000)
              .optional()
              .describe("Source identifier"),
          }),
        )
        .min(1)
        .max(50)
        .describe("Intelligence entries to write (1-50)"),
    },
    async ({ dataset_id, agent_id, entries }) => {
      try {
        const path = withDatasetId(
          `${client.pathPrefix}/ext/datasets/intelligence/batch`,
          dataset_id,
          { agent_id },
        );
        const data = await client.post(path, { entries });
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      } catch (err) {
        return formatError(err);
      }
    },
  );

  server.tool(
    "inflectiv_list_intelligence",
    "List intelligence entries in a dataset. Free. Filter by agent_id, status, with pagination.",
    {
      ...datasetIdSchema,
      agent_id: z
        .number()
        .int()
        .optional()
        .describe("Filter by agent ID"),
      status: z
        .enum(["processing", "processed", "failed"])
        .optional()
        .describe("Filter by processing status"),
      limit: z
        .number()
        .int()
        .min(1)
        .max(100)
        .optional()
        .describe("Number of entries to return (default: 50)"),
      offset: z
        .number()
        .int()
        .min(0)
        .optional()
        .describe("Offset for pagination (default: 0)"),
    },
    async ({ dataset_id, agent_id, status, limit, offset }) => {
      try {
        const params = new URLSearchParams();
        if (dataset_id !== undefined) params.set("dataset_id", String(dataset_id));
        if (agent_id !== undefined) params.set("agent_id", String(agent_id));
        if (status) params.set("status", status);
        if (limit !== undefined) params.set("limit", String(limit));
        if (offset !== undefined) params.set("offset", String(offset));
        const qs = params.toString();
        const path = `${client.pathPrefix}/ext/datasets/intelligence${qs ? `?${qs}` : ""}`;
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
