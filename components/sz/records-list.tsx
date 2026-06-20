import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { StatusChip } from "@/components/sz/status-chip";
import { Copyable } from "@/components/sz/copyable";
import { Badge } from "@/components/ui/badge";
import type { RecordSummary } from "@/lib/mock/data";
import { formatDayMonth, truncHash, LANGUAGE_LABEL } from "@/lib/format";

function LangBadge({ language }: { language: RecordSummary["language"] }) {
  return (
    <Badge
      variant="outline"
      className="ds-mono shrink-0 border-border bg-surface-2 px-1.5 py-0.5 text-[11px] font-normal text-ink-muted"
    >
      {LANGUAGE_LABEL[language]}
    </Badge>
  );
}

function RootCell({ root }: { root: string }) {
  // Stop the copy click from triggering the row/card navigation.
  return (
    <span onClick={(e) => e.preventDefault()} className="min-w-0">
      <Copyable value={root} display={truncHash(root)} label="Root copied" className="text-xs" />
    </span>
  );
}

function EmptyFilters({ onReset }: { onReset: () => void }) {
  return (
    <div className="px-6 py-14 text-center">
      <p className="text-sm text-ink-muted">No consultations match these filters.</p>
      <button
        type="button"
        onClick={onReset}
        className="mt-2 text-[13px] text-jade transition-opacity hover:opacity-80"
      >
        Clear filters
      </button>
    </div>
  );
}

/**
 * The owned-records library. At ≥640px it is a fixed-column grid table; below
 * that it collapses to stacked cards so the storage root and status stay
 * reachable on phones (the grid's right columns clip past a 375px viewport).
 */
export function RecordsList({
  records,
  onReset,
}: {
  records: RecordSummary[];
  onReset: () => void;
}) {
  return (
    <>
      {/* Tablet / desktop (≥640px) — fixed-column grid */}
      <div className="hidden overflow-hidden rounded-xl border border-border bg-surface-3 sm:block">
        <div className="grid grid-cols-[74px_1fr_64px_120px_minmax(0,118px)_40px] gap-3 border-b border-border bg-surface-1 px-4 py-3">
          {["Date", "Chief complaint", "Lang", "Status", "Root", ""].map((h, i) => (
            <span key={i} className="ds-eyebrow text-ink-dim">
              {h}
            </span>
          ))}
        </div>

        {records.length === 0 ? (
          <EmptyFilters onReset={onReset} />
        ) : (
          records.map((r) => (
            <Link
              key={r.id}
              href={`/records/${r.id}`}
              className="group grid grid-cols-[74px_1fr_64px_120px_minmax(0,118px)_40px] items-center gap-3 border-b border-border/60 px-4 py-3.5 transition-colors last:border-b-0 hover:bg-surface-1"
            >
              <span className="ds-mono text-xs text-ink-muted">{formatDayMonth(r.date)}</span>
              <span className="truncate text-sm text-ink">{r.complaint}</span>
              <LangBadge language={r.language} />
              <StatusChip status={r.status} className="justify-self-start" />
              <RootCell root={r.root} />
              <ArrowUpRight className="size-[15px] justify-self-end text-ink-dim transition-colors group-hover:text-ink" />
            </Link>
          ))
        )}
      </div>

      {/* Phone (<640px) — stacked cards, nothing clipped or scrolled off-screen */}
      <div className="sm:hidden">
        {records.length === 0 ? (
          <div className="overflow-hidden rounded-xl border border-border bg-surface-3">
            <EmptyFilters onReset={onReset} />
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {records.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/records/${r.id}`}
                  className="group flex flex-col gap-3 rounded-xl border border-border bg-surface-3 p-4 transition-colors hover:bg-surface-1"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="ds-mono text-xs text-ink-muted">{formatDayMonth(r.date)}</span>
                    <StatusChip status={r.status} />
                  </div>

                  <p className="text-[15px] leading-snug text-ink">{r.complaint}</p>

                  <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <LangBadge language={r.language} />
                      <RootCell root={r.root} />
                    </div>
                    <ArrowUpRight className="size-[15px] shrink-0 text-ink-dim transition-colors group-hover:text-ink" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
