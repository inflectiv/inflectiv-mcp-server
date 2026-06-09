import { ZodError } from "zod";
import { InflectivApiError } from "./client.js";

export function formatError(err: unknown): {
  content: { type: "text"; text: string }[];
  isError: true;
} {
  let message: string;

  if (err instanceof InflectivApiError) {
    const body = err.body;
    let detail = err.message;

    if (typeof body === "object" && body !== null) {
      const b = body as Record<string, unknown>;
      if (b.detail) detail = String(b.detail);
      if (b.credits_required) {
        detail += `\n\nInsufficient credits. Required: ${b.credits_required}, Available: ${b.credits_available ?? "unknown"}. Top up at https://app.inflectiv.ai`;
      }
      if (err.status === 402 && !process.env.INFLECTIV_WALLET_PRIVATE_KEY) {
        detail += `\n\nTip: Set INFLECTIV_WALLET_PRIVATE_KEY to enable automatic crypto payments via x402 when credits are depleted.`;
      }
    }

    message = `Inflectiv API Error (${err.status}): ${detail}`;
  } else if (err instanceof ZodError) {
    const issues = err.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    message = `Validation Error:\n${issues}`;
  } else if (err instanceof Error) {
    message = err.message.includes("fetch failed")
      ? `Network error: Could not reach Inflectiv API. Check your INFLECTIV_BASE_URL and network connection.`
      : `Error: ${err.message}`;
  } else {
    message = `Unknown error: ${String(err)}`;
  }

  return {
    content: [{ type: "text", text: message }],
    isError: true,
  };
}
