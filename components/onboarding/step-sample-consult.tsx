"use client";

import { FileText, Languages, Mic, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function StepSampleConsult({
  onContinue,
  onBack,
}: {
  onContinue: () => void;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="ds-eyebrow text-jade">Step 4 of 5</p>
        <h1 className="ds-display mt-2 text-[40px] leading-[1.04] text-ink">
          Confirm the live clinical flow.
        </h1>
        <p className="mt-3 max-w-md text-[15px] text-ink-muted">
          ScribeZero only completes records after real microphone capture, 0G Router transcription,
          verified 0G Compute, and confirmed 0G Storage.
        </p>
      </header>

      <div className="overflow-hidden rounded-xl border border-border bg-surface-1">
        <div className="flex items-center justify-between border-b border-border bg-surface-3 px-4 py-3">
          <span className="flex items-center gap-2 text-sm font-medium text-ink">
            <Mic className="size-4 text-jade" />
            Live capture requirements
          </span>
          <span className="ds-mono text-[11px] text-ink-dim">live capture only</span>
        </div>
        <div className="grid gap-0 md:grid-cols-2">
          <div className="border-b border-border px-4 py-3 md:border-b-0 md:border-r">
            <p className="ds-eyebrow mb-3 text-ink-dim">Input</p>
            <div className="flex flex-col gap-3 text-[13px] leading-relaxed text-ink-muted">
              <p>
                <Mic className="mr-1 inline size-3.5 text-jade" />
                Consults begin from browser microphone capture only.
              </p>
              <p>
                <Languages className="mr-1 inline size-3.5 text-jade" />
                Audio is sent to 0G Router STT before a note can be generated.
              </p>
            </div>
          </div>
          <div className="px-4 py-3">
            <p className="ds-eyebrow mb-3 text-ink-dim">Seal</p>
            <div className="flex flex-col gap-3 text-[13px] leading-relaxed text-ink-muted">
              <p>
                <FileText className="mr-1 inline size-3.5 text-jade" />
                Structured notes are generated through 0G Compute.
              </p>
              <p>
                <ShieldCheck className="mr-1 inline size-3.5 text-jade" />
                The app stops instead of creating a record if proof or Storage confirmation fails.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="button" variant="outline" size="lg" onClick={onBack}>
          Back
        </Button>
        <Button type="button" variant="live" size="lg" className="px-7" onClick={onContinue}>
          Seal practice profile
        </Button>
      </div>
    </div>
  );
}
