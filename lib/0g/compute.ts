import { createZGComputeNetworkBroker } from "@0gfoundation/0g-compute-ts-sdk";
import { getWallet } from "./server";

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
  if (!brokerPromise) brokerPromise = createZGComputeNetworkBroker(getWallet() as any);
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
    // No ledger yet — create + fund a small amount from the wallet's native balance.
    try {
      await b.ledger.addLedger(0.02);
    } catch {
      await b.ledger.depositFund(0.02).catch(() => {});
    }
  }
}

/**
 * Verifiable SOAP generation through a 0G Compute TEE provider.
 * Returns the model output + a proof object (the TeeTLS routing proof handle).
 */
export async function generateVerifiable(
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
      body: JSON.stringify({ model, messages, temperature: 0.2 }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`compute ${res.status}: ${body.slice(0, 200)}`);
    }
    const data: any = await res.json();
    const content: string = data.choices?.[0]?.message?.content ?? "";
    const chatID: string = res.headers.get("ZG-Res-Key") || data.id || "";
    let verified: boolean | null = null;
    try {
      verified = await b.inference.processResponse(addr, chatID);
    } catch {
      verified = null;
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
        await b.ledger.depositFund(0.02);
        return await run();
      } catch (e2: any) {
        throw new Error(`compute funding failed: ${e2?.message ?? e2}`);
      }
    }
    throw e;
  }
}
