/**
 * x402 Crypto Micropayment Support for Inflectiv MCP Server.
 *
 * Uses the official @x402/fetch + @x402/evm packages — the exact same
 * approach as the Coinbase x402 TypeScript examples:
 * https://github.com/coinbase/x402/tree/main/examples/typescript/clients/fetch
 *
 * This wraps fetch() with automatic 402 → sign → retry handling.
 */

import { type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";

/**
 * Create a fetch function that automatically handles x402 payments.
 *
 * This is the TypeScript equivalent of Python's x402HttpxClient —
 * wraps fetch() so that 402 responses are automatically retried with
 * a signed USDC payment.
 *
 * @param walletPrivateKey - Hex-encoded private key (with or without 0x prefix)
 * @returns A fetch-compatible function with x402 payment support
 */
export async function createX402Fetch(
  walletPrivateKey: string,
): Promise<typeof fetch> {
  const { x402Client, wrapFetchWithPayment } = await import("@x402/fetch");
  const { ExactEvmScheme } = await import("@x402/evm/exact/client");

  const privKey = (walletPrivateKey.startsWith("0x")
    ? walletPrivateKey
    : `0x${walletPrivateKey}`) as Hex;

  const account = privateKeyToAccount(privKey);

  const client = new x402Client();
  client.register("eip155:*", new ExactEvmScheme(account));

  return wrapFetchWithPayment(fetch, client);
}
