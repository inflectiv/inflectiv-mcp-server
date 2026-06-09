import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { InflectivClient } from "../client.js";
import { formatError } from "../errors.js";

export function registerAgentTools(server: McpServer, client: InflectivClient) {
  server.tool(
    "inflectiv_list_agents",
    "List all agents owned by you that have the API key's dataset attached. Free.",
    {},
    async () => {
      try {
        const data = await client.get(`${client.pathPrefix}/ext/agents/`);
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      } catch (err) {
        return formatError(err);
      }
    },
  );

  server.tool(
    "inflectiv_create_agent",
    "Create a new AI agent. Per-dataset key auto-attaches to the key's dataset. Global key may pass dataset_ids (each must be accessible). Costs 5 credits.",
    {
      name: z.string().min(1).max(255).describe("Agent name"),
      description: z
        .string()
        .max(1000)
        .optional()
        .describe("Agent description"),
      personality: z
        .string()
        .optional()
        .describe(
          'Agent personality style (default: "professional")',
        ),
      system_instructions: z
        .string()
        .max(2000)
        .optional()
        .describe("Custom system instructions for the agent"),
      response_length: z
        .string()
        .optional()
        .describe('Response length preference (default: "concise")'),
      model_name: z
        .string()
        .optional()
        .describe('LLM model name (default: "z-ai/glm-4.7:nitro")'),
      temperature: z
        .number()
        .int()
        .min(0)
        .max(100)
        .optional()
        .describe("Temperature 0-100 (default: 70)"),
      dataset_ids: z
        .array(z.number().int())
        .optional()
        .describe(
          "Datasets to attach. Per-dataset key: ignored. Global key: each ID must be a dataset you own; if omitted, the agent is created with no attached datasets.",
        ),
    },
    async (params) => {
      try {
        const data = await client.post(`${client.pathPrefix}/ext/agents/`, params);
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      } catch (err) {
        return formatError(err);
      }
    },
  );

  server.tool(
    "inflectiv_get_agent",
    "Get details of a specific agent. Free.",
    {
      agent_id: z.number().int().describe("Agent ID"),
    },
    async ({ agent_id }) => {
      try {
        const data = await client.get(`${client.pathPrefix}/ext/agents/${agent_id}`);
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      } catch (err) {
        return formatError(err);
      }
    },
  );

  server.tool(
    "inflectiv_update_agent_config",
    "Update an agent's configuration (personality, instructions, model, temperature, etc.). Costs 2 credits.",
    {
      agent_id: z.number().int().describe("Agent ID"),
      name: z.string().min(1).max(255).optional().describe("Agent name"),
      description: z
        .string()
        .max(1000)
        .optional()
        .describe("Agent description"),
      personality: z.string().optional().describe("Agent personality style"),
      system_instructions: z
        .string()
        .max(2000)
        .optional()
        .describe("Custom system instructions"),
      response_length: z
        .string()
        .optional()
        .describe("Response length preference"),
      model_name: z.string().optional().describe("LLM model name"),
      temperature: z
        .number()
        .int()
        .min(0)
        .max(100)
        .optional()
        .describe("Temperature 0-100"),
    },
    async ({ agent_id, ...body }) => {
      try {
        const data = await client.put(
          `${client.pathPrefix}/ext/agents/${agent_id}/config`,
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
    "inflectiv_chat_with_agent",
    'Send a message to an agent and get a RAG-enabled response. Costs 1 credit. Provide conversation_history as an array of {role, content} objects for multi-turn chat.',
    {
      agent_id: z.number().int().describe("Agent ID"),
      message: z.string().min(1).max(4000).describe("Message to send"),
      conversation_history: z
        .array(
          z.object({
            role: z.string().describe('Message role (e.g. "user", "assistant")'),
            content: z.string().describe("Message content"),
          }),
        )
        .optional()
        .describe("Previous conversation messages for context"),
    },
    async ({ agent_id, message, conversation_history }) => {
      try {
        const data = await client.post(`${client.pathPrefix}/ext/agents/${agent_id}/chat`, {
          message,
          conversation_history: conversation_history ?? [],
        });
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      } catch (err) {
        return formatError(err);
      }
    },
  );

  server.tool(
    "inflectiv_list_agent_datasets",
    "List all datasets attached to an agent. Free.",
    {
      agent_id: z.number().int().describe("Agent ID"),
    },
    async ({ agent_id }) => {
      try {
        const data = await client.get(`${client.pathPrefix}/ext/agents/${agent_id}/datasets`);
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      } catch (err) {
        return formatError(err);
      }
    },
  );

  server.tool(
    "inflectiv_attach_dataset",
    'Attach a dataset to an agent. Free. Mode can be "read_only" or "self_learning".',
    {
      agent_id: z.number().int().describe("Agent ID"),
      dataset_id: z.number().int().describe("Dataset ID to attach"),
      mode: z
        .enum(["read_only", "self_learning"])
        .optional()
        .describe('Dataset mode (default: "read_only")'),
    },
    async ({ agent_id, dataset_id, mode }) => {
      try {
        const data = await client.post(
          `${client.pathPrefix}/ext/agents/${agent_id}/datasets`,
          {
            dataset_id,
            mode: mode ?? "read_only",
          },
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
    "inflectiv_update_dataset_mode",
    'Update the mode of a dataset attached to an agent. Mode: "read_only" or "self_learning". Free.',
    {
      agent_id: z.number().int().describe("Agent ID"),
      dataset_id: z.number().int().describe("Dataset ID"),
      mode: z
        .enum(["read_only", "self_learning"])
        .describe("New dataset mode"),
    },
    async ({ agent_id, dataset_id, mode }) => {
      try {
        const data = await client.patch(
          `${client.pathPrefix}/ext/agents/${agent_id}/datasets/${dataset_id}`,
          { mode },
        );
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      } catch (err) {
        return formatError(err);
      }
    },
  );
}
