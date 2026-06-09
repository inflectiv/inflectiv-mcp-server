import { z } from "zod";

const ApiKeySchema = z
  .string()
  .startsWith("inf_", "API key must start with 'inf_'");

export class InflectivApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    const msg =
      typeof body === "object" && body !== null && "detail" in body
        ? String((body as { detail: unknown }).detail)
        : JSON.stringify(body);
    super(`HTTP ${status}: ${msg}`);
    this.name = "InflectivApiError";
  }
}

export class InflectivClient {
  private apiKey: string;
  private baseUrl: string;
  private x402Fetch: typeof fetch | null = null;
  private x402FetchInitPromise: Promise<typeof fetch> | null = null;

  constructor(apiKey: string, baseUrl?: string) {
    this.apiKey = ApiKeySchema.parse(apiKey);
    this.baseUrl = (
      baseUrl ?? "https://app.inflectiv.ai/api/platform"
    ).replace(/\/$/, "");
  }

  /** Returns the API path prefix based on environment:
   *  - Production frontend (app.inflectiv.ai/api/platform): no prefix (proxy adds /ext/)
   *  - Direct Platform API (localhost, Railway, etc.): /api/v2 prefix
   */
  get pathPrefix(): string {
    if (this.baseUrl.includes("app.inflectiv.ai")) {
      return "";
    }
    return "/api/v2";
  }

  private headers(extra?: Record<string, string>): Record<string, string> {
    return {
      "X-API-Key": this.apiKey,
      ...extra,
    };
  }

  /**
   * Get an x402-enabled fetch function (lazy-initialized, singleton).
   * Uses @x402/fetch + @x402/evm — same approach as official Coinbase examples.
   * Returns null if INFLECTIV_WALLET_PRIVATE_KEY is not configured.
   */
  private async getX402Fetch(): Promise<typeof fetch | null> {
    const walletKey = process.env.INFLECTIV_WALLET_PRIVATE_KEY;
    if (!walletKey) return null;

    if (this.x402Fetch) return this.x402Fetch;

    // Prevent multiple concurrent initializations
    if (!this.x402FetchInitPromise) {
      this.x402FetchInitPromise = (async () => {
        const { createX402Fetch } = await import("./x402.js");
        const f = await createX402Fetch(walletKey);
        this.x402Fetch = f;
        return f;
      })();
    }

    return this.x402FetchInitPromise;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`.replace(/\/+$/, "");
    const init: RequestInit = {
      method,
      headers: this.headers(
        body !== undefined ? { "Content-Type": "application/json" } : undefined,
      ),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    };

    // First try with normal fetch
    const res = await fetch(url, init);

    if (!res.ok) {
      // x402 payment fallback: if 402 with payment-required header
      if (res.status === 402) {
        const paymentRequired = res.headers.get("payment-required");
        const x402Fetch = await this.getX402Fetch();

        console.error(`[x402] 402 received. payment-required header: ${paymentRequired ? "present" : "missing"}. x402Fetch: ${x402Fetch ? "ready" : "null (no wallet key?)"}`);

        if (paymentRequired && x402Fetch) {
          // Use x402-wrapped fetch which handles 402 → sign → retry automatically
          // (same approach as official Coinbase x402 TypeScript examples)
          try {
            const retryRes = await x402Fetch(url, init);
            console.error(`[x402] Retry response status: ${retryRes.status}`);

            if (!retryRes.ok) {
              let errorBody: unknown;
              try {
                errorBody = await retryRes.json();
              } catch {
                errorBody = await retryRes.text();
              }
              throw new InflectivApiError(retryRes.status, errorBody);
            }
            return retryRes.json() as Promise<T>;
          } catch (e) {
            console.error(`[x402] Payment retry failed:`, e);
            throw e;
          }
        }
      }

      let errorBody: unknown;
      try {
        errorBody = await res.json();
      } catch {
        errorBody = await res.text();
      }
      throw new InflectivApiError(res.status, errorBody);
    }

    return res.json() as Promise<T>;
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>("GET", path);
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("POST", path, body);
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("PUT", path, body);
  }

  async patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("PATCH", path, body);
  }

  async delete<T>(path: string): Promise<T> {
    return this.request<T>("DELETE", path);
  }

  async uploadFile(
    path: string,
    fileBuffer: Buffer,
    filename: string,
    title?: string,
  ): Promise<unknown> {
    const formData = new FormData();
    const blob = new Blob([fileBuffer]);
    formData.append("file", blob, filename);
    if (title) {
      formData.append("title", title);
    }

    const url = `${this.baseUrl}${path}`.replace(/\/+$/, "");
    const res = await fetch(url, {
      method: "POST",
      headers: this.headers(),
      body: formData,
    });

    if (!res.ok) {
      let errorBody: unknown;
      try {
        errorBody = await res.json();
      } catch {
        errorBody = await res.text();
      }
      throw new InflectivApiError(res.status, errorBody);
    }

    return res.json();
  }
}
