import { getWallet } from "./server";

/* eslint-disable @typescript-eslint/no-explicit-any */

const ROUTER_URL = process.env.ZEROG_COMPUTE_ROUTER || "https://router-api.0g.ai/v1";
const STT_MODEL = process.env.ZEROG_STT_MODEL || "whisper-large-v3";

export interface SttResult {
  text: string;
  language?: string;
  provider: string;
  chatID?: string;
  verified?: boolean | null;
}

/**
 * Speech-to-text through 0G Compute (Whisper on the router). Makes the transcription
 * step itself run on 0G — so the whole pipeline (STT -> note-gen -> storage) is 0G.
 * Verifies the TEE response on-chain via processResponse when a trace is returned.
 */
export async function transcribeViaRouter(
  audio: ArrayBuffer | Uint8Array,
  filename: string,
  apiKey: string,
  language?: "ta" | "hi" | "en",
): Promise<SttResult> {
  const form = new FormData();
  const bytes = audio instanceof Uint8Array ? audio : new Uint8Array(audio);
  form.append("file", new Blob([bytes as BlobPart], { type: "audio/webm" }), filename);
  form.append("model", STT_MODEL);
  form.append("response_format", "json");
  if (language) form.append("language", language);

  const res = await fetch(`${ROUTER_URL}/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`0G STT ${res.status}: ${body.slice(0, 200)}`);
  }
  const data: any = await res.json();
  const provider: string = data?.x_0g_trace?.provider ?? "0g-router";
  const chatID: string = res.headers.get("ZG-Res-Key") || data.id || "";

  let verified: boolean | null = null;
  if (data?.x_0g_trace?.provider && chatID) {
    try {
      const { createZGComputeNetworkBroker } = await import("@0gfoundation/0g-compute-ts-sdk");
      const b = await createZGComputeNetworkBroker(getWallet() as any);
      verified = await b.inference.processResponse(provider, chatID);
    } catch {
      verified = null;
    }
  }

  return { text: data.text ?? "", language: data.language, provider, chatID, verified };
}
