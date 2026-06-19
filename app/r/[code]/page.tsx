"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "motion/react";
import {
  ArrowRight,
  BadgeCheck,
  Calendar,
  Cpu,
  Database,
  Fingerprint,
  Languages,
  Mic,
  Share2,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Copyable } from "@/components/sz/copyable";
import { LiveDot } from "@/components/sz/live-dot";
import { OwnerAvatar } from "@/components/sz/owner-avatar";
import { DEMO_CONSULT } from "@/lib/mock/data";
import {
  LANGUAGE_LABEL,
  formatIST,
  truncAddress,
  truncHash,
} from "@/lib/format";

type CheckTone = "proof" | "stored" | "match";

const CHECKS: {
  icon: typeof Cpu;
  title: string;
  detail: string;
  tag: string;
}[] = [
  {
    icon: Cpu,
    title: "Inference ran in a TEE",
    detail: "0G Compute · TeeTLS routing proof",
    tag: "proof",
  },
  {
    icon: Database,
    title: "Record on 0G Storage",
    detail: "Merkle root resolves on testnet",
    tag: "stored",
  },
  {
    icon: Fingerprint,
    title: "Note hash unchanged",
    detail: "Recomputed hash matches stored",
    tag: "match",
  },
];

export default function ShareCardPage() {
  const params = useParams<{ code: string }>();
  const consult = DEMO_CONSULT;

  // The route code resolves to the canonical demo consult for this public card.
  void params?.code;

  const [from, to] = consult.languages;
  const fromLabel = LANGUAGE_LABEL[from] ?? from;
  const toLabel = LANGUAGE_LABEL[to] ?? to;
  const recordUrl = `scribezero.app/r/${consult.shareCode}`;

  function handleShare() {
    const url =
      typeof window !== "undefined" ? window.location.href : recordUrl;
    navigator.clipboard?.writeText(url);
    toast.success("Share link copied");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-4 py-10 sm:py-16">
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[640px] overflow-hidden rounded-xl border border-border bg-bg"
      >
        {/* Header — wordmark + live pill */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <span className="ds-display text-[22px] leading-none text-ink">
            ScribeZero
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-1 px-3 py-1.5">
            <LiveDot size={7} />
            <span className="ds-mono text-[11px] text-jade">
              0G testnet · live
            </span>
          </span>
        </div>

        {/* Body */}
        <div className="px-6 pt-8 pb-2 sm:px-7">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-jade/30 bg-jade-soft px-3.5 py-1.5">
            <BadgeCheck className="size-4 text-jade" />
            <span className="ds-eyebrow text-jade">Verified on 0G</span>
          </div>

          <div className="ds-eyebrow mb-2.5 text-ink-dim">
            Consultation summary · redacted
          </div>
          <h1 className="ds-display mb-4 text-[40px] leading-[1.08] text-ink">
            Acute viral upper-respiratory infection
          </h1>

          {/* Meta chips */}
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-md border border-border bg-surface-1 px-3 py-1.5">
              <Languages className="size-3.5 text-ink-muted" />
              <span className="ds-mono text-xs text-ink-muted">
                {fromLabel}
              </span>
              <ArrowRight className="size-3.5 text-ink-dim" />
              <span className="ds-mono text-xs text-ink">{toLabel}</span>
            </span>
            <span className="inline-flex items-center gap-2 rounded-md border border-border bg-surface-1 px-3 py-1.5">
              <Stethoscope className="size-3.5 text-ink-muted" />
              <span className="text-[13px] text-ink-muted">Reviewed by</span>
              <span className="text-[13px] font-medium text-ink">
                {consult.reviewer}
              </span>
            </span>
            <span className="inline-flex items-center gap-2 rounded-md border border-border bg-surface-1 px-3 py-1.5">
              <Calendar className="size-3.5 text-ink-muted" />
              <span className="ds-mono text-xs text-ink-muted">
                {formatIST(consult.createdAt)}
              </span>
            </span>
          </div>
        </div>

        {/* Verifiability panel */}
        <div className="mx-6 mb-6 overflow-hidden rounded-lg border border-border bg-surface-3 sm:mx-7">
          <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
            <span className="ds-eyebrow text-ink-muted">Verifiability</span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-jade" />
              <span className="ds-mono text-[11px] text-jade">
                3 / 3 checks passed
              </span>
            </span>
          </div>

          <div className="px-4 pt-1 pb-2 sm:px-[18px]">
            {CHECKS.map((check, i) => {
              const Icon = check.icon;
              return (
                <div
                  key={check.title}
                  className={
                    "flex items-center gap-3.5 py-3.5" +
                    (i < CHECKS.length - 1 ? " border-b border-border/60" : "")
                  }
                >
                  <Icon className="size-[19px] shrink-0 text-jade" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-ink">{check.title}</div>
                    <div className="ds-mono mt-0.5 text-[11px] text-ink-dim">
                      {check.detail}
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-jade/30 bg-surface-1 px-2.5 py-1">
                    <ShieldCheck className="size-3 text-jade" />
                    <span className="ds-mono text-[11px] text-jade">
                      {check.tag as CheckTone}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>

          {/* Storage root footer */}
          <div className="flex items-center justify-between gap-3 border-t border-border bg-bg px-4 py-3.5 sm:px-[18px]">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="ds-eyebrow shrink-0 text-ink-dim">
                Storage root
              </span>
              <Copyable
                value={consult.record.zgStorageRootHash}
                display={truncHash(consult.record.zgStorageRootHash)}
                label="Storage root copied"
                className="text-[13px] text-ink"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-1 sm:px-7">
          <Button
            asChild
            variant="live"
            size="lg"
            className="h-[52px] w-full text-base"
          >
            <Link href="/verify">
              <ShieldCheck className="size-[18px]" />
              Verify this yourself
              <ArrowRight className="size-[18px]" />
            </Link>
          </Button>

          <div className="mt-2.5 flex gap-2.5">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-11 flex-1"
            >
              <Link href="/app">
                <Mic className="size-4" />
                Make your own
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-11 flex-1"
              onClick={handleShare}
            >
              <Share2 className="size-4" />
              Share
            </Button>
          </div>

          <p className="mt-3 text-center text-xs text-ink-dim">
            No wallet needed · the proof verifies on-chain
          </p>
        </div>

        {/* Owner footer */}
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border px-6 py-5 sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <OwnerAvatar
              address={consult.record.ownerAddress}
              size={30}
              className="rounded-md border border-border"
            />
            <div className="min-w-0">
              <div className="ds-eyebrow mb-0.5 text-ink-dim">Owned by</div>
              <Copyable
                value={consult.record.ownerAddress}
                display={truncAddress(consult.record.ownerAddress)}
                label="Owner address copied"
                className="text-[13px] text-ink"
              />
            </div>
          </div>
          <div className="min-w-0 text-right">
            <div className="ds-eyebrow mb-0.5 text-ink-dim">Record</div>
            <div className="ds-mono truncate text-[13px] text-ink-muted">
              {recordUrl}
            </div>
          </div>
        </div>

        {/* Provenance line */}
        <div className="border-t border-border/60 px-6 py-3.5 text-center sm:px-7">
          <span className="ds-mono text-[11px] text-ink-dim">
            Inference via 0G Compute TeeTLS · Records on 0G Storage
          </span>
        </div>
      </motion.article>
    </main>
  );
}
