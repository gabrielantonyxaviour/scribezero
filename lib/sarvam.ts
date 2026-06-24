/* eslint-disable @typescript-eslint/no-explicit-any */

const SARVAM_BASE_URL = process.env.SARVAM_BASE_URL || "https://api.sarvam.ai";
const SARVAM_CHAT_MODEL = process.env.SARVAM_CHAT_MODEL || "sarvam-30b";
const SARVAM_STT_MODEL = process.env.SARVAM_STT_MODEL || "saaras:v3";

export type SarvamFallback = {
  provider: "sarvam";
  model: string;
  reason: "0g_compute_unavailable" | "0g_stt_unavailable";
  zerogError: string;
  at: string;
};

function sarvamKey() {
  const key = process.env.SARVAM_API_KEY;
  if (!key) throw new Error("SARVAM_API_KEY is not set; Sarvam fallback is unavailable");
  return key;
}

function fallbackId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

export async function generateViaSarvam(
  messages: { role: string; content: string }[],
  zerogError: string,
): Promise<{ content: string; proofId: string; model: string; fallback: SarvamFallback }> {
  const model = SARVAM_CHAT_MODEL;
  const res = await fetch(`${SARVAM_BASE_URL}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sarvamKey()}`,
      "api-subscription-key": sarvamKey(),
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.2,
      max_tokens: Number(process.env.SARVAM_CHAT_MAX_TOKENS || 900),
      reasoning_effort: null,
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Sarvam fallback failed after 0G error (${zerogError}): sarvam ${res.status}: ${body.slice(0, 200)}`);
  }

  const data: any = await res.json();
  const message = data?.choices?.[0]?.message;
  const content =
    typeof message?.content === "string"
      ? message.content.trim()
      : typeof message?.reasoning_content === "string"
        ? message.reasoning_content.trim()
        : "";
  if (!content) throw new Error(`Sarvam fallback returned empty content after 0G error: ${zerogError}`);

  return {
    content,
    proofId: data?.id || fallbackId("sarvam_chat"),
    model: data?.model || model,
    fallback: {
      provider: "sarvam",
      model: data?.model || model,
      reason: "0g_compute_unavailable",
      zerogError,
      at: new Date().toISOString(),
    },
  };
}

export async function transcribeViaSarvam(
  audio: ArrayBuffer | Uint8Array,
  filename: string,
  language: "ta" | "hi" | "en" | undefined,
  zerogError: string,
) {
  const form = new FormData();
  const bytes = audio instanceof Uint8Array ? audio : new Uint8Array(audio);
  form.append("file", new Blob([bytes as BlobPart], { type: "audio/webm" }), filename);
  form.append("model", SARVAM_STT_MODEL);
  if (SARVAM_STT_MODEL === "saaras:v3") form.append("mode", "transcribe");
  if (language) form.append("language_code", languageCode(language));

  const res = await fetch(`${SARVAM_BASE_URL}/speech-to-text`, {
    method: "POST",
    headers: { "api-subscription-key": sarvamKey() },
    body: form,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Sarvam STT fallback failed after 0G error (${zerogError}): sarvam ${res.status}: ${body.slice(0, 200)}`);
  }

  const data: any = await res.json();
  const text = String(data?.transcript ?? "").trim();
  if (!text) throw new Error(`Sarvam STT fallback returned an empty transcript after 0G error: ${zerogError}`);

  return {
    text,
    language: data?.language_code || (language ? languageCode(language) : undefined),
    provider: "sarvam",
    chatID: data?.request_id || fallbackId("sarvam_stt"),
    verified: false,
    fallback: {
      provider: "sarvam",
      model: SARVAM_STT_MODEL,
      reason: "0g_stt_unavailable",
      zerogError,
      at: new Date().toISOString(),
    } satisfies SarvamFallback,
  };
}

function languageCode(language: "ta" | "hi" | "en") {
  if (language === "ta") return "ta-IN";
  if (language === "hi") return "hi-IN";
  return "en-IN";
}
