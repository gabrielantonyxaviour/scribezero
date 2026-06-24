import { motion } from "motion/react";
import { Eye, ExternalLink, Lock, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CheckRow } from "@/components/sz/check-row";
import { Copyable } from "@/components/sz/copyable";
import { LiveDot } from "@/components/sz/live-dot";
import { NETWORK } from "@/lib/constants";
import { truncAddress, truncMid } from "@/lib/format";
import type { ProofReceiptSummary } from "@/lib/proof/receipt";

export type PublicVerifyFact = { label: string; value: string; copy?: boolean };

export function VerifyResult({
  proof,
  integrityTitle = "Note hash matches",
  integrityDetail,
  noteHash,
  computeValue,
  computeSubFacts,
  publicFacts,
  durationMs,
  storageValue,
  privacyCopy = "The note stays encrypted and owned by the patient. The chief complaint, transcript, and SOAP note are never exposed here — only the integrity above is publicly verifiable.",
}: {
  proof: ProofReceiptSummary;
  integrityTitle?: string;
  integrityDetail?: string;
  noteHash: string;
  computeValue: string;
  computeSubFacts?: { label: string; value: string }[];
  publicFacts: PublicVerifyFact[];
  durationMs?: number;
  storageValue?: string;
  privacyCopy?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mb-3.5 mt-7 flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2.5">
          <LiveDot size={8} />
          <span className="text-[15px] font-medium text-ink">
            {proof.verdict === "verified" ? "Verified" : "Partially verified"}
          </span>
          <span className="ds-mono rounded-full border border-jade/30 bg-jade-soft px-2.5 py-0.5 text-[11px] text-jade">
            {proof.passed} / {proof.total} checks passed
          </span>
        </div>
        <span className="ds-mono text-[11px] text-ink-dim">
          checked in {durationMs ? `${(durationMs / 1000).toFixed(2)}s` : "real time"}
        </span>
      </div>

      <div className="divide-y divide-border rounded-xl border border-border bg-surface-1 px-[18px]">
        <CheckRow title={integrityTitle} detail={integrityDetail ?? proof.integrityLabel} value={noteHash} />
        <CheckRow
          title={proof.computeTitle}
          detail={proof.computeLabel}
          value={computeValue}
          subFacts={computeSubFacts}
        />
        <CheckRow title="0G Storage reachable" detail={proof.storageLabel} value={storageValue ?? "root reachable"} />
      </div>

      <div className="mt-[18px] rounded-xl border border-border bg-surface-2 p-4 sm:p-[18px]">
        <div className="ds-eyebrow mb-4 flex items-center gap-1.5 text-ink-muted">
          <Eye className="size-3.5" />
          the only public facts
        </div>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          {publicFacts.map((fact) => (
            <div key={fact.label}>
              <dt className="ds-eyebrow mb-1.5 text-ink-dim">{fact.label}</dt>
              <dd className="ds-mono text-[13px] text-ink">
                {fact.copy ? (
                  <Copyable
                    value={fact.value}
                    display={fact.label === "owner address" ? truncAddress(fact.value) : truncMid(fact.value, 6, 6)}
                    className="text-[13px] text-ink"
                  />
                ) : (
                  fact.value
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-4 flex items-start gap-2.5 px-0.5">
        <Lock className="mt-0.5 size-4 shrink-0 text-ink-dim" />
        <p className="text-[13px] leading-snug text-ink-muted">{privacyCopy}</p>
      </div>

      <div className="mt-[18px] flex flex-col gap-2.5 sm:flex-row">
        <Button variant="outline" size="lg" className="ds-mono h-[42px] flex-1 text-[13px]" asChild>
          <a href={NETWORK.explorer} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-[15px]" />
            Open 0G explorer
          </a>
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="ds-mono h-[42px] flex-1 text-[13px]"
          onClick={() => navigator.clipboard?.writeText(window.location.href)}
        >
          <Share2 className="size-[15px]" />
          Share this proof
        </Button>
      </div>
    </motion.div>
  );
}
