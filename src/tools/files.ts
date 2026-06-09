import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { InflectivClient } from "../client.js";
import { formatError } from "../errors.js";

const SUPPORTED_EXTENSIONS = [
  ".pdf",
  ".docx",
  ".txt",
  ".md",
  ".html",
  ".csv",
  ".json",
  ".jsonl",
  ".tsv",
  ".xlsx",
  ".xls",
  ".parquet",
  ".xml",
];

export function registerFileTools(
  server: McpServer,
  client: InflectivClient,
) {
  server.tool(
    "inflectiv_list_files",
    "List files (knowledge sources) in a dataset. Free.",
    {
      dataset_id: z
        .number()
        .int()
        .optional()
        .describe(
          "Required when authenticating with a global API key. Ignored for per-dataset keys.",
        ),
      skip: z
        .number()
        .int()
        .min(0)
        .optional()
        .describe("Number of files to skip (default: 0)"),
      limit: z
        .number()
        .int()
        .min(1)
        .max(100)
        .optional()
        .describe("Number of files to return (default: 50)"),
    },
    async ({ dataset_id, skip, limit }) => {
      try {
        const params = new URLSearchParams();
        if (dataset_id !== undefined) params.set("dataset_id", String(dataset_id));
        if (skip !== undefined) params.set("skip", String(skip));
        if (limit !== undefined) params.set("limit", String(limit));
        const qs = params.toString();
        const path = `${client.pathPrefix}/ext/files/${qs ? `?${qs}` : ""}`;
        const data = await client.get(path);
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      } catch (err) {
        return formatError(err);
      }
    },
  );

  server.tool(
    "inflectiv_get_file",
    "Get details of a specific file (knowledge source). Free.",
    {
      file_id: z.number().int().describe("File ID"),
    },
    async ({ file_id }) => {
      try {
        const data = await client.get(`${client.pathPrefix}/ext/files/${file_id}`);
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      } catch (err) {
        return formatError(err);
      }
    },
  );

  server.tool(
    "inflectiv_upload_file",
    `Upload a local file to a dataset as a knowledge source. Costs 5 credits base + 1/MB over 5MB. Supported formats: ${SUPPORTED_EXTENSIONS.join(", ")}`,
    {
      dataset_id: z
        .number()
        .int()
        .optional()
        .describe(
          "Required when authenticating with a global API key. Ignored for per-dataset keys.",
        ),
      file_path: z
        .string()
        .describe("Absolute path to the local file to upload"),
      title: z
        .string()
        .max(255)
        .optional()
        .describe("Display title for the file"),
    },
    async ({ dataset_id, file_path, title }) => {
      try {
        const ext = "." + file_path.split(".").pop()?.toLowerCase();
        if (!SUPPORTED_EXTENSIONS.includes(ext)) {
          return {
            content: [
              {
                type: "text",
                text: `Unsupported file type "${ext}". Supported: ${SUPPORTED_EXTENSIONS.join(", ")}`,
              },
            ],
            isError: true as const,
          };
        }

        const fileBuffer = await readFile(file_path);
        const filename = basename(file_path);
        const qs =
          dataset_id !== undefined ? `?dataset_id=${dataset_id}` : "";
        const data = await client.uploadFile(
          `${client.pathPrefix}/ext/files/upload${qs}`,
          fileBuffer,
          filename,
          title,
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
    "inflectiv_reprocess_file",
    "Reprocess a previously uploaded file. Useful after processing failures. Costs 5 credits.",
    {
      file_id: z.number().int().describe("File ID to reprocess"),
    },
    async ({ file_id }) => {
      try {
        const data = await client.post(`${client.pathPrefix}/ext/files/${file_id}/reprocess`);
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      } catch (err) {
        return formatError(err);
      }
    },
  );
}
