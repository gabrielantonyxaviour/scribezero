"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  CircleCheck,
  Mic,
  ShieldCheck,
  Square,
} from "lucide-react";
import { AppShell } from "@/components/shell/app-shell";
import { Button } from "@/components/ui/button";
import { LiveDot } from "@/components/sz/live-dot";
import { Copyable } from "@/components/sz/copyable";
import { LanguagePicker, StepRow, Waveform } from "@/components/sz/seal-progress";
import { cn } from "@/lib/utils";
import { SEAL_STEPS, sealConsultSmart, type SmartSealResult, type StepId, type StepStatus } from "@/lib/services";
import { useWallet } from "@/components/providers/wallet-provider";
import { truncHash, truncAddress } from "@/lib/format";
import type { TranscriptionResult } from "@/shared/contract";
import type { SarvamFallback } from "@/lib/sarvam";

type Phase = "idle" | "recording" | "transcribing" | "ready" | "sealing" | "sealed";
type AppLanguage = "ta" | "hi" | "en";

type RouterSttResponse = {
  text: string;
  language?: string;
  provider: string;
  chatID?: string;
  verified?: boolean | null;
  fallback?: SarvamFallback;
};

export default function ScribePage() {
  const { address: ownerAddress, connected, signMessage } = useWallet();
  const [phase, setPhase] = useState<Phase>("idle");
  const [lang, setLang] = useState<AppLanguage>("ta");
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState("");
  const [sttFallback, setSttFallback] = useState<SarvamFallback | null>(null);
  const [transcription, setTranscription] = useState<TranscriptionResult | null>(null);
  const [steps, setSteps] = useState<Record<StepId, StepStatus>>({
    route: "idle",
    generate: "idle",
    proof: "idle",
    persist: "idle",
    index: "idle",
    sealed: "idle",
  });
  const [durations, setDurations] = useState<Partial<Record<StepId, number>>>({});
  const [result, setResult] = useState<SmartSealResult | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const chunks = useRef<BlobPart[]>([]);

  const recording = phase === "recording";

  useEffect(() => {
    return () => {
      stream.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const resetSteps = useCallback(() => {
    setSteps({
      route: "idle",
      generate: "idle",
      proof: "idle",
      persist: "idle",
      index: "idle",
      sealed: "idle",
    });
    setDurations({});
  }, []);

  const transcribeRecording = useCallback(
    async (blob: Blob) => {
      setPhase("transcribing");
      const form = new FormData();
      const file = new File([blob], `scribezero-consult-${Date.now()}.webm`, {
        type: blob.type || "audio/webm",
      });
      form.append("file", file);
      form.append("language", lang);

      const res = await fetch("/api/transcribe", { method: "POST", body: form });
      const data = (await res.json().catch(() => null)) as RouterSttResponse | { error?: string } | null;
      if (!data) {
        throw new Error(`0G STT failed with ${res.status}`);
      }
      if ("error" in data) {
        throw new Error(data.error || `0G STT failed with ${res.status}`);
      }
      if (!res.ok) {
        throw new Error(`0G STT failed with ${res.status}`);
      }
      const stt = data as RouterSttResponse;
      if (!stt.text?.trim()) {
        throw new Error("0G STT returned an empty transcript");
      }
      if (stt.provider !== "sarvam" && stt.verified !== true) {
        throw new Error(
          `0G STT proof did not verify for provider ${stt.provider || "unknown"} and proof ${stt.chatID || "missing"}`,
        );
      }
      setSttFallback(stt.fallback ?? null);
      setTranscription({
        transcript: stt.text.trim(),
        provider: stt.provider === "sarvam" ? "sarvam" : "0g-router",
        language: stt.language || lang,
        proofId: stt.chatID,
        proofVerified: stt.verified,
        segments: [
          {
            id: `seg_${Date.now().toString(36)}`,
            speaker: "unknown",
            text: stt.text.trim(),
            confidence: 1,
            timestamp_start: 0,
            timestamp_end: elapsed * 1000,
            language: lang,
          },
        ],
      });
      setPhase("ready");
    },
    [elapsed, lang],
  );

  const start = useCallback(async () => {
    if (phase !== "idle") return;
    try {
      setError("");
      setResult(null);
      setSttFallback(null);
      setTranscription(null);
      resetSteps();
      setElapsed(0);
      chunks.current = [];
      const nextStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.current = nextStream;
      const nextRecorder = new MediaRecorder(nextStream, { mimeType: "audio/webm" });
      nextRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.current.push(event.data);
      };
      nextRecorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        stream.current?.getTracks().forEach((track) => track.stop());
        stream.current = null;
        void transcribeRecording(blob).catch((err) => {
          setError((err as Error).message);
          setPhase("idle");
        });
      };
      recorder.current = nextRecorder;
      nextRecorder.start();
      setPhase("recording");
    } catch (err) {
      setError(`Microphone capture failed: ${(err as Error).message}`);
      setPhase("idle");
    }
  }, [phase, resetSteps, transcribeRecording]);

  const stop = useCallback(() => {
    if (recorder.current?.state === "recording") {
      recorder.current.stop();
    }
  }, []);

  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [recording]);

  const generate = useCallback(async () => {
    if (!transcription) return;
    try {
      setError("");
      resetSteps();
      setPhase("sealing");
      const r = await sealConsultSmart(
        (id, status, ms) => {
          setSteps((s) => ({ ...s, [id]: status }));
          if (ms) setDurations((d) => ({ ...d, [id]: ms }));
        },
        connected ? ownerAddress : undefined,
        transcription,
        signMessage,
      );
      setResult(r);
      setPhase("sealed");
    } catch (err) {
      setError((err as Error).message);
      setPhase("ready");
    }
  }, [connected, ownerAddress, resetSteps, signMessage, transcription]);

  const mmss = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;
  const words = transcription?.transcript.split(/\s+/).filter(Boolean).length ?? 0;
  const rec = result?.record;

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <p className="ds-eyebrow">New consultation · {mmss === "00:00" ? "ready" : mmss}</p>
        <h1 className="ds-display mt-2 text-[34px] text-ink">Speak the consult. Own the note.</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Tamil, Hindi or English — code-switch freely. The transcript runs live; the note is sealed inside 0G.
        </p>

        {sttFallback || result?.computeFallback ? (
          <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-xs text-ink">
            <p className="font-medium text-amber-100">
              {result?.computeFallback ? "0G Compute fallback active" : "0G STT fallback active"}
            </p>
            <p className="mt-1 break-words text-ink-muted">
              {(result?.computeFallback ?? sttFallback)?.zerogError}
            </p>
          </div>
        ) : null}

        <div className="mt-6 rounded-xl border border-border bg-surface-1 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={start}
              disabled={phase !== "idle"}
              className={cn(
                "flex size-12 items-center justify-center rounded-full border transition-colors",
                recording
                  ? "border-jade bg-jade-soft"
                  : "border-border-strong bg-surface-2 hover:border-jade/50",
              )}
              aria-label="Start recording"
            >
              <Mic className={cn("size-5", recording ? "text-jade" : "text-ink-muted")} />
            </button>
            <Waveform active={recording} />
            <LanguagePicker value={lang} onChange={(value) => setLang(value as AppLanguage)} />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="ds-mono text-[11px] text-ink-dim">
              {recording ? (
                <span className="flex items-center gap-1.5 text-jade">
                  <LiveDot size={6} /> recording {mmss} · 44.1 kHz
                </span>
              ) : phase === "transcribing" ? (
                "0G Router STT is transcribing and verifying the proof"
              ) : (
                "real microphone capture only"
              )}
            </span>
            {phase === "idle" ? (
              <Button variant="outline" size="sm" onClick={start}>
                <Mic /> Start recording
              </Button>
            ) : recording ? (
              <Button variant="outline" size="sm" onClick={stop}>
                <Square /> Stop
              </Button>
            ) : null}
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-vermillion/40 bg-vermillion/10 p-4 text-sm text-ink">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-vermillion" />
              <div>
                <p className="font-medium text-vermillion">0G flow stopped</p>
                <p className="mt-1 text-ink-muted">{error}</p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-4 overflow-hidden rounded-xl border border-border bg-surface-3">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <span className="ds-eyebrow !text-ink-dim">Live transcript</span>
            <span className="ds-mono flex items-center gap-1.5 text-[10px] text-jade">
              {recording ? <LiveDot size={6} /> : null}
              {transcription
                ? transcription.proofVerified === true
                  ? `${transcription.provider} · verified`
                  : `${transcription.provider} · fallback`
                : "waiting for audio"}
            </span>
          </div>
          {!transcription ? (
            <div className="px-4 py-10 text-center text-sm text-ink-dim">
              Record a real consult to create a transcript through 0G Router STT.
            </div>
          ) : (
            <div className="space-y-3 px-4 py-4">
              <p className="ds-mono text-[9px] uppercase tracking-[0.1em] text-ink-dim">
                {transcription.language || lang} · proof {transcription.proofId ? truncHash(transcription.proofId) : "verified"}
              </p>
              <p className="text-sm leading-relaxed text-ink">{transcription.transcript}</p>
            </div>
          )}
          {transcription && (
            <div className="ds-mono flex items-center gap-3 border-t border-border px-4 py-2 text-[10px] text-ink-dim">
              <span>{words} words</span>
              <span>·</span>
              <span>
                {transcription.proofVerified === true
                  ? "0G Router STT proof verified"
                  : "STT fallback · not TEE verified"}
              </span>
              <span>·</span>
              <span>{transcription.language || lang}</span>
            </div>
          )}
        </div>

        {(phase === "ready" || phase === "sealing" || phase === "sealed") && (
          <div className="mt-4">
            {phase === "ready" && (
              <>
                <Button variant="live" className="h-11 w-full text-sm" onClick={generate}>
                  <ShieldCheck /> Generate and seal on 0G
                </Button>
                <p className="ds-mono mt-2 text-center text-[11px] text-ink-dim">
                  0G Storage is required. If 0G Compute is unavailable, Sarvam fallback is disclosed.
                </p>
              </>
            )}

            {(phase === "sealing" || phase === "sealed") && (
              <div className="rounded-xl border border-border bg-surface-1 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="ds-eyebrow !text-ink-dim">Sealing record</span>
                  <span className="ds-mono text-[10px] text-ink-dim">
                    {phase === "sealed" ? "done" : "step in progress"}
                  </span>
                </div>
                <div className="divide-y divide-border">
                  {SEAL_STEPS.map((s) => (
                    <StepRow
                      key={s.id}
                      label={s.label}
                      detail={s.id === "sealed" && rec ? `bound to ${truncAddress(rec.ownerAddress)}` : s.detail}
                      status={steps[s.id]}
                      duration={durations[s.id]}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {phase === "sealed" && rec && (
          <div className="mt-4 flex flex-wrap items-center gap-4 rounded-xl border border-jade/25 bg-[#10160f] p-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-jade/50 bg-surface-2">
              <CircleCheck className="size-4.5 text-jade" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-ink">
                  {result.teeProof?.verified === true
                    ? "Verified & owned on 0G"
                    : "Owned on 0G Storage · Compute fallback"}
                </span>
                <span
                  className={cn(
                    "ds-mono flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px]",
                    result.teeProof?.verified === true
                      ? "border-jade/30 bg-jade-soft text-jade"
                      : "border-amber-400/30 bg-amber-400/10 text-amber-100",
                  )}
                >
                  <LiveDot size={5} /> {result.teeProof?.verified === true ? "0G testnet" : "Sarvam fallback"}
                </span>
              </div>
              <div className="ds-mono mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-ink-dim">
                <span>
                  {result.teeProof?.verified === true ? "TEE proof" : "Fallback proof"}{" "}
                  <span className={result.teeProof?.verified === true ? "text-jade" : "text-amber-100"}>
                    {result.teeProof?.verified === true ? "✓" : "!"}
                  </span>{" "}
                  {truncHash(rec.teeTlsProof)}
                </span>
                <span>·</span>
                <Copyable value={rec.zgStorageRootHash} display={`root ${truncHash(rec.zgStorageRootHash)}`} label="Storage root copied" />
                <span>·</span>
                {rec.storageTxHash ? (
                  <>
                    <Copyable value={rec.storageTxHash} display={`tx ${truncHash(rec.storageTxHash)}`} label="Storage tx copied" />
                    <span>·</span>
                  </>
                ) : null}
                {result.kvIndex?.txHash ? (
                  <>
                    <Copyable value={result.kvIndex.txHash} display={`kv ${truncHash(result.kvIndex.txHash)}`} label="KV index tx copied" />
                    <span>·</span>
                  </>
                ) : null}
                <span>owner {truncAddress(rec.ownerAddress)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
