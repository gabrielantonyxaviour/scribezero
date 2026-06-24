import { getBalance, getWallet } from "./server";

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface ComputeProof {
  provider: string;
  model: string;
  chatID: string;
  verified: boolean | null; // processResponse: true | false | null (no TEE service)
  requestHash?: string;
  responseHash?: string;
  signature?: string;
}

let brokerPromise: Promise<any> | null = null;
function broker() {
  if (!brokerPromise) {
    brokerPromise = (async () => {
      // Lazy import — keeps the compute SDK off the module-load path (it crashes
      // some serverless bundlers at import time). Only needed for verification.
      const { createZGComputeNetworkBroker } = await import("@0gfoundation/0g-compute-ts-sdk");
      return createZGComputeNetworkBroker(getWallet() as any);
    })();
  }
  return brokerPromise;
}

function providerAddress(s: any): string {
  return s.provider ?? s.providerAddress ?? s.address ?? "";
}

/** Pick a chat provider, preferring a TEE-verifiable one. */
async function pickProvider(b: any): Promise<any> {
  const services: any[] = await b.inference.listService();
  if (!services?.length) throw new Error("no 0G compute providers available");
  const chat = services.filter(
    (s) => /chat|llm|text/i.test(s.serviceType ?? s.type ?? "chatbot"),
  );
  const pool = chat.length ? chat : services;
  const verifiable = pool.find((s) =>
    /tee|teeml|tee-?tls/i.test(s.verifiability ?? s.verificationType ?? ""),
  );
  return verifiable ?? pool[0];
}

async function ensureLedger(b: any) {
  try {
    await b.ledger.getLedger();
  } catch {
    // No ledger yet — create it. The 0G Compute contract requires a 3-0G minimum.
    try {
      await b.ledger.addLedger(3);
    } catch {
      await b.ledger.depositFund(3).catch(() => {});
    }
  }
}

const ROUTER_URL =
  process.env.ZEROG_COMPUTE_ROUTER || "https://router-api-testnet.integratenetwork.work/v1";
const ROUTER_MODEL = process.env.ZEROG_COMPUTE_MODEL || "glm-5.1";
const ROUTER_MAX_TOKENS = Number(process.env.ZEROG_COMPUTE_MAX_TOKENS || 900);
export const BROKER_MIN_LEDGER_OG = 3;

type ComputeFundingFailure = {
  message: string;
  routerError: string;
  brokerBalance: string;
  requiredBrokerOg: number;
  at: string;
};

let lastFundingFailure: ComputeFundingFailure | null = null;

export function getLastComputeFundingFailure() {
  return lastFundingFailure;
}

export function isRouterInsufficientBalanceError(error: unknown) {
  const message = String((error as Error)?.message ?? error);
  return /router 402|insufficient_balance|Insufficient balance|payment_error/i.test(message);
}

export function computeFundingError(input: {
  routerError: string;
  brokerBalance: string;
  minLedgerOg?: number;
}) {
  return [
    `0G Compute Router billing failed: ${input.routerError}`,
    `Direct 0G Compute broker is also unavailable: server wallet has ${input.brokerBalance} OG, ${input.minLedgerOg ?? BROKER_MIN_LEDGER_OG} OG required for broker ledger funding`,
  ].join("; ");
}

function rememberFundingFailure(input: {
  routerError: string;
  brokerBalance: string;
  minLedgerOg?: number;
}) {
  lastFundingFailure = {
    message: computeFundingError(input),
    routerError: input.routerError,
    brokerBalance: input.brokerBalance,
    requiredBrokerOg: input.minLedgerOg ?? BROKER_MIN_LEDGER_OG,
    at: new Date().toISOString(),
  };
  return lastFundingFailure.message;
}

function routerBody(messages: { role: string; content: string }[]) {
  return {
    model: ROUTER_MODEL,
    messages,
    temperature: 0.2,
    max_tokens: ROUTER_MAX_TOKENS,
    verify_tee: true,
    chat_template_kwargs: { enable_thinking: false },
  };
}

function messageText(data: any): string {
  const message = data.choices?.[0]?.message;
  return message?.content ?? message?.reasoning ?? "";
}

/**
 * Hosted 0G Compute Router path (router-api.0g.ai) — avoids the 3-0G broker ledger.
 * Inference is billed to the sk- API key; the TEE proof is still verified independently
 * on-chain via processResponse (read-only, any wallet works).
 */
async function generateViaRouter(
  messages: { role: string; content: string }[],
  apiKey: string,
): Promise<{ content: string; proof: ComputeProof }> {
  const res = await fetch(`${ROUTER_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(routerBody(messages)),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`router ${res.status}: ${body.slice(0, 200)}`);
  }
  const data: any = await res.json();
  const content = messageText(data);
  const provider: string = data.x_0g_trace?.provider ?? "";
  const chatID: string = res.headers.get("ZG-Res-Key") || data.x_0g_trace?.request_id || data.id || "";

  let verified: boolean | null =
    typeof data.x_0g_trace?.tee_verified === "boolean" ? data.x_0g_trace.tee_verified : null;
  if (provider && chatID) {
    try {
      if (verified !== true) {
        const b = await broker(); // read-only on-chain verification, no ledger needed
        verified = await b.inference.processResponse(provider, chatID);
      }
    } catch {
      verified ??= null;
    }
  }
  return {
    content,
    proof: {
      provider: provider || "0g-router",
      model: ROUTER_MODEL,
      chatID,
      verified,
      requestHash: data?.x_0g_trace?.request_hash,
      responseHash: data?.x_0g_trace?.response_hash,
      signature: data?.x_0g_trace?.request_id,
    },
  };
}

async function generateViaBroker(
  messages: { role: string; content: string }[],
): Promise<{ content: string; proof: ComputeProof }> {
  const b = await broker();
  await ensureLedger(b);

  const provider = await pickProvider(b);
  const addr = providerAddress(provider);
  const { endpoint, model } = await b.inference.getServiceMetadata(addr);

  const run = async () => {
    const headers = await b.inference.getRequestHeaders(addr);
    const res = await fetch(`${endpoint}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.2,
        max_tokens: ROUTER_MAX_TOKENS,
        verify_tee: true,
        chat_template_kwargs: { enable_thinking: false },
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`compute ${res.status}: ${body.slice(0, 200)}`);
    }
    const data: any = await res.json();
    const content = messageText(data);
    const chatID: string = res.headers.get("ZG-Res-Key") || data.x_0g_trace?.request_id || data.id || "";
    let verified: boolean | null =
      typeof data.x_0g_trace?.tee_verified === "boolean" ? data.x_0g_trace.tee_verified : null;
    try {
      if (verified !== true) verified = await b.inference.processResponse(addr, chatID);
    } catch {
      verified ??= null;
    }
    return {
      content,
      proof: {
        provider: addr,
        model,
        chatID,
        verified,
        requestHash: data?.x_0g_trace?.request_hash,
        responseHash: data?.x_0g_trace?.response_hash,
        signature: res.headers.get("ZG-Res-Signature") ?? undefined,
      } satisfies ComputeProof,
    };
  };

  try {
    return await run();
  } catch (e: any) {
    // Lazy top-up on insufficient funds, then one retry.
    if (/insufficient|balance|fund/i.test(String(e?.message))) {
      try {
        await b.ledger.depositFund(BROKER_MIN_LEDGER_OG);
        return await run();
      } catch (e2: any) {
        throw new Error(`compute funding failed: ${e2?.message ?? e2}`);
      }
    }
    throw e;
  }
}

/**
 * Verifiable SOAP generation. Uses the hosted 0G Router when ZEROG_ROUTER_API_KEY is
 * set, otherwise the wallet/broker ledger path. Both run inside 0G Compute TEEs.
 */
export async function generateVerifiable(
  messages: { role: string; content: string }[],
): Promise<{ content: string; proof: ComputeProof }> {
  const routerKey = process.env.ZEROG_ROUTER_API_KEY;
  if (routerKey) {
    try {
      return await generateViaRouter(messages, routerKey);
    } catch (error) {
      if (!isRouterInsufficientBalanceError(error)) throw error;
      const balance = await getBalance();
      if (Number(balance) < BROKER_MIN_LEDGER_OG) {
        throw new Error(rememberFundingFailure({
          routerError: (error as Error).message,
          brokerBalance: balance,
        }));
      }
      lastFundingFailure = null;
      return generateViaBroker(messages);
    }
  }

  return generateViaBroker(messages);
}
