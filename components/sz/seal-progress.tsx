import { CircleCheck, Loader2 } from "lucide-react";

import type { StepStatus } from "@/lib/services";
import { cn } from "@/lib/utils";

const LANGS = [
  { id: "ta", native: "தமிழ்" },
  { id: "hi", native: "हिन्दी" },
  { id: "en", native: "EN" },
];

export function LanguagePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="ml-auto flex items-center gap-1.5">
      {LANGS.map((l) => (
        <button
          key={l.id}
          onClick={() => onChange(l.id)}
          className={cn(
            "ds-mono rounded-full border px-3 py-1 text-[11px] transition-colors",
            value === l.id ? "border-jade text-jade" : "border-border text-ink-muted hover:text-ink",
          )}
        >
          {l.native}
        </button>
      ))}
    </div>
  );
}

export function Waveform({ active }: { active: boolean }) {
  const heights = [8, 18, 24, 13, 21, 9, 16, 23, 11, 19, 14, 7, 20, 12];
  return (
    <div className="flex h-7 items-end gap-[3px]">
      {heights.map((h, i) => (
        <span
          key={i}
          className={cn("w-[3px] rounded-full", active ? "animate-pulse bg-jade" : "bg-jade-deep/50")}
          style={{
            height: active ? h : Math.max(4, h / 3),
            animationDelay: `${i * 90}ms`,
          }}
        />
      ))}
    </div>
  );
}

export function StepRow({
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
            ? "working..."
            : status === "error"
              ? "failed"
              : "pending"}
      </span>
    </div>
  );
}
