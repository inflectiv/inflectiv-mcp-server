import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { InflectivClient } from "../client.js";
import { formatError } from "../errors.js";

const VALID_EVENTS = [
  "intelligence.processed",
  "intelligence.failed",
  "intelligence.deduped",
  "dataset.mode_changed",
] as const;

export function registerWebhookTools(
  server: McpServer,
  client: InflectivClient,
) {
  server.tool(
    "inflectiv_register_webhook",
    `Register a webhook to receive event notifications. URL must use HTTPS. Valid events: ${VALID_EVENTS.join(", ")}. Max 10 webhooks per user. Free.`,
    {
      url: z
        .string()
        .url()
        .startsWith("https://", "Webhook URL must use HTTPS")
        .min(10)
        .max(2000)
        .describe("HTTPS webhook endpoint URL"),
      events: z
        .array(z.enum(VALID_EVENTS))
        .min(1)
        .describe("Events to subscribe to"),
      description: z
        .string()
        .max(500)
        .optional()
        .describe("Webhook description"),
    },
    async (params) => {
      try {
        const data = await client.post(`${client.pathPrefix}/ext/webhooks/`, params);
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      } catch (err) {
        return formatError(err);
      }
    },
  );

  server.tool(
    "inflectiv_list_webhooks",
    "List all registered webhooks. Free.",
    {},
    async () => {
      try {
        const data = await client.get(`${client.pathPrefix}/ext/webhooks/`);
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      } catch (err) {
        return formatError(err);
      }
    },
  );

  server.tool(
    "inflectiv_test_webhook",
    "Send a test event to a registered webhook to verify it's receiving payloads. Free.",
    {
      webhook_id: z.number().int().describe("Webhook ID to test"),
    },
    async ({ webhook_id }) => {
      try {
        const data = await client.post(
          `${client.pathPrefix}/ext/webhooks/${webhook_id}/test`,
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
