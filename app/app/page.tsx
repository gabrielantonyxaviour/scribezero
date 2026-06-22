"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CircleCheck,
  Loader2,
  Mic,
  Play,
  ShieldCheck,
  Share2,
  Square,
} from "lucide-react";
import { AppShell } from "@/components/shell/app-shell";
import { Button } from "@/components/ui/button";
import { LiveDot } from "@/components/sz/live-dot";
import { Copyable } from "@/components/sz/copyable";
import { cn } from "@/lib/utils";
import { DEMO_SEGMENTS, DEMO_RECORD } from "@/lib/mock/data";
import { SEAL_STEPS, type StepId, type StepStatus } from "@/lib/mock/services";
import { sealConsultSmart, type SmartSealResult } from "@/lib/services";
import { useWallet } from "@/components/providers/wallet-provider";
import { truncHash, truncAddress } from "@/lib/format";

type Phase = "idle" | "recording" | "ready" | "sealing" | "sealed";
const LANGS = [
  { id: "ta", native: "தமிழ்" },
  { id: "hi", native: "हिन्दी" },
  { id: "en", native: "EN" },
];

export default function ScribePage() {
  const { address: ownerAddress, connected } = useWallet();
  const [phase, setPhase] = useState<Phase>("idle");
  const [lang, setLang] = useState("ta");
  const [shown, setShown] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [steps, setSteps] = useState<Record<StepId, StepStatus>>({
    route: "idle",
    generate: "idle",
    proof: "idle",
    persist: "idle",
    sealed: "idle",
  });
  const [durations, setDurations] = useState<Partial<Record<StepId, number>>>({});
  const [result, setResult] = useState<SmartSealResult | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const recording = phase === "recording";

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const start = useCallback(() => {
    if (phase !== "idle") return;
    setPhase("recording");
    setShown(0);
    setElapsed(0);
    DEMO_SEGMENTS.forEach((_, i) => {
      timers.current.push(
        setTimeout(() => {
          setShown(i + 1);
          if (i === DEMO_SEGMENTS.length - 1) {
            timers.current.push(setTimeout(() => setPhase("ready"), 700));
          }
        }, 650 + i * 950),
      );
    });
  }, [phase]);

  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [recording]);

  const generate = useCallback(async () => {
    setPhase("sealing");
    const r = await sealConsultSmart(
      (id, status, ms) => {
        setSteps((s) => ({ ...s, [id]: status }));
        if (ms) setDurations((d) => ({ ...d, [id]: ms }));
      },
      connected ? ownerAddress : undefined,
    );
    setResult(r);
    setPhase("sealed");
  }, [connected, ownerAddress]);

  const mmss = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;
  const visible = DEMO_SEGMENTS.slice(0, shown);
  const words = visible.reduce((n, s) => n + s.english.split(" ").length, 0);
  const rec = result?.record ?? DEMO_RECORD;
  const mode = result?.mode ?? "mock";

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <p className="ds-eyebrow">New consultation · {mmss === "00:00" ? "ready" : mmss}</p>
        <h1 className="ds-display mt-2 text-[34px] text-ink">Speak the consult. Own the note.</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Tamil, Hindi or English — code-switch freely. The transcript runs live; the note is sealed inside 0G.
        </p>

        {/* capture */}
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

            <div className="ml-auto flex items-center gap-1.5">
              {LANGS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLang(l.id)}
                  className={cn(
                    "ds-mono rounded-full border px-3 py-1 text-[11px] transition-colors",
                    lang === l.id
                      ? "border-jade text-jade"
                      : "border-border text-ink-muted hover:text-ink",
                  )}
                >
                  {l.native}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="ds-mono text-[11px] text-ink-dim">
              {recording ? (
                <span className="flex items-center gap-1.5 text-jade">
                  <LiveDot size={6} /> recording {mmss} · 44.1 kHz
                </span>
              ) : (
                "auto-detects code-switching mid-sentence"
              )}
            </span>
            {phase === "idle" ? (
              <Button variant="outline" size="sm" onClick={start}>
                <Play /> Play sample consult
              </Button>
            ) : recording ? (
              <Button variant="outline" size="sm" onClick={() => setPhase("ready")}>
                <Square /> Stop
              </Button>
            ) : null}
          </div>
        </div>

        {/* live transcript */}
        <div className="mt-4 overflow-hidden rounded-xl border border-border bg-surface-3">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <span className="ds-eyebrow !text-ink-dim">Live transcript</span>
            <span className="ds-mono flex items-center gap-1.5 text-[10px] text-jade">
              {recording ? <LiveDot size={6} /> : null}
              {visible.length ? "Tamil → English" : "waiting for audio"}
            </span>
          </div>
          {visible.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-ink-dim">
              Press the mic (or play the sample) to begin.
            </div>
          ) : (
            <div className="grid grid-cols-2">
              <div className="space-y-3 border-r border-border px-4 py-3">
                <p className="ds-mono text-[9px] uppercase tracking-[0.1em] text-ink-dim">தமிழ்</p>
                {visible.map((s, i) => (
                  <p key={s.id} className="text-[13px] leading-relaxed text-ink">
                    <span className="ds-mono mb-0.5 block text-[9px] text-ink-dim">
                      {s.speaker.toUpperCase()}
                    </span>
                    <span className={cn(s.lowConfidence && "border-b border-dotted border-amber/60 text-amber")}>
                      {s.native}
                    </span>
                    {recording && i === visible.length - 1 && (
                      <span className="ml-0.5 inline-block h-3.5 w-0.5 translate-y-0.5 animate-pulse bg-jade" />
                    )}
                  </p>
                ))}
              </div>
              <div className="space-y-3 px-4 py-3">
                <p className="ds-mono text-[9px] uppercase tracking-[0.1em] text-ink-dim">English</p>
                {visible.map((s) => (
                  <p key={s.id} className="text-[13px] leading-relaxed text-ink-muted">
                    <span className="ds-mono mb-0.5 block text-[9px] text-ink-dim">
                      {s.speaker.toUpperCase()}
                    </span>
                    {s.english}
                  </p>
                ))}
              </div>
            </div>
          )}
          {visible.length > 0 && (
            <div className="ds-mono flex items-center gap-3 border-t border-border px-4 py-2 text-[10px] text-ink-dim">
              <span>{words} words</span>
              <span>·</span>
              <span>diarized · doctor / patient</span>
              <span>·</span>
              <span>ta-IN → en</span>
            </div>
          )}
        </div>

        {/* generate */}
        {(phase === "ready" || phase === "sealing" || phase === "sealed") && (
          <div className="mt-4">
            {phase === "ready" && (
              <>
                <Button variant="live" className="h-11 w-full text-sm" onClick={generate}>
                  <ShieldCheck /> Generate structured note
                </Button>
                <p className="ds-mono mt-2 text-center text-[11px] text-ink-dim">
                  Routed through 0G Compute TeeTLS · sealed on 0G Storage
                </p>
              </>
            )}

            {(phase === "sealing" || phase === "sealed") && (
              <div className="rounded-xl border border-border bg-surface-1 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="ds-eyebrow !text-ink-dim">Sealing on 0G</span>
                  <span className="ds-mono text-[10px] text-ink-dim">
                    {phase === "sealed" ? "done" : "step in progress"}
                  </span>
                </div>
                <div className="divide-y divide-border">
                  {SEAL_STEPS.map((s) => (
                    <StepRow
                      key={s.id}
                      label={s.label}
                      detail={s.detail}
                      status={steps[s.id]}
                      duration={durations[s.id]}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* owned receipt */}
        {phase === "sealed" && (
          <div className="mt-4 flex flex-wrap items-center gap-4 rounded-xl border border-jade/25 bg-[#10160f] p-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-jade/50 bg-surface-2">
              <CircleCheck className="size-4.5 text-jade" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-ink">Verified &amp; owned on 0G</span>
                {mode === "live" ? (
                  <span className="ds-mono flex items-center gap-1 rounded-full border border-jade/30 bg-jade-soft px-2 py-0.5 text-[10px] text-jade">
                    <LiveDot size={5} /> 0G testnet
                  </span>
                ) : mode === "storage" ? (
                  <span className="ds-mono flex items-center gap-1 rounded-full border border-jade/30 bg-jade-soft px-2 py-0.5 text-[10px] text-jade">
                    <LiveDot size={5} /> 0G Storage · live
                  </span>
                ) : (
                  <span className="ds-mono rounded-full border border-border px-2 py-0.5 text-[10px] text-ink-dim">
                    demo · mock 0G
                  </span>
                )}
              </div>
              <div className="ds-mono mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-ink-dim">
                {mode === "live" ? (
                  <span>TeeTLS proof <span className="text-jade">✓</span> {truncHash(rec.teeTlsProof)}</span>
                ) : (
                  <span className="text-ink-dim">
                    Compute · demo{mode === "storage" ? " (add key)" : ""}
                  </span>
                )}
                <span>·</span>
                <Copyable value={rec.zgStorageRootHash} display={`root ${truncHash(rec.zgStorageRootHash)}`} label="Storage root copied" />
                <span>·</span>
                <span>owner {truncAddress(rec.ownerAddress)}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/records/note_sz4827ta">
                  Open record <ArrowUpRight />
                </Link>
              </Button>
              <Button asChild variant="live" size="sm">
                <Link href="/r/HX7K2M">
                  <Share2 /> Share
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function Waveform({ active }: { active: boolean }) {
  const heights = [8, 18, 24, 13, 21, 9, 16, 23, 11, 19, 14, 7, 20, 12];
  return (
    <div className="flex h-7 items-end gap-[3px]">
      {heights.map((h, i) => (
        <span
          key={i}
          className={cn("w-[3px] rounded-full", active ? "animate-pulse bg-jade" : "bg-jade-deep/50")}
          style={{ height: active ? h : Math.max(4, h / 3), animationDelay: `${i * 90}ms` }}
        />
      ))}
    </div>
  );
}

function StepRow({
  label,
  detail,
  status,
  duration,
}: {
  label: string;
  detail: string;
  status: StepStatus;
  duration?: number;
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <span className="flex size-6 shrink-0 items-center justify-center">
        {status === "done" ? (
          <CircleCheck className="size-5 text-jade" />
        ) : status === "active" ? (
          <Loader2 className="size-5 animate-spin text-jade" />
        ) : status === "error" ? (
          <span className="size-2 rounded-full bg-vermillion" />
        ) : (
          <span className="size-2 rounded-full bg-ink-dim/40" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <div className={cn("text-sm", status === "idle" ? "text-ink-dim" : "text-ink")}>{label}</div>
        <div className="ds-mono text-[10px] text-ink-dim">{detail}</div>
      </div>
      <span className="ds-mono shrink-0 text-[10px] text-ink-dim">
        {status === "done"
          ? duration
            ? `done · ${(duration / 1000).toFixed(1)}s`
            : "done"
          : status === "active"
            ? "working…"
            : status === "error"
              ? "failed"
              : "pending"}
      </span>
    </div>
  );
}
