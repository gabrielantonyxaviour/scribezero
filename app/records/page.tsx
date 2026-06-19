"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Mic,
  Languages,
  CircleCheck,
  Calendar,
  ChevronDown,
  ArrowUpRight,
  ShieldCheck,
  FileText,
  Check,
} from "lucide-react";

import { AppShell } from "@/components/shell/app-shell";
import { StatusChip } from "@/components/sz/status-chip";
import { Copyable } from "@/components/sz/copyable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DEMO_RECORDS } from "@/lib/mock/data";
import type { Lang, RecordStatus } from "@/lib/mock/data";
import { formatDayMonth, truncHash, LANGUAGE_LABEL } from "@/lib/format";

const LANG_OPTIONS: { value: Lang; label: string }[] = [
  { value: "ta", label: "ta-IN · Tamil" },
  { value: "hi", label: "hi-IN · Hindi" },
  { value: "en", label: "en-IN · English" },
];

const STATUS_OPTIONS: { value: RecordStatus; label: string }[] = [
  { value: "verified", label: "Verified" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
];

const DATE_OPTIONS = [
  { value: "all", label: "All time" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "jun", label: "June 2026" },
] as const;

type DateValue = (typeof DATE_OPTIONS)[number]["value"];

function FilterTrigger({
  icon: Icon,
  label,
  active,
}: {
  icon: typeof Languages;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-[38px] items-center gap-2 rounded-md border bg-surface-1 px-3 text-[13px] transition-colors",
        active
          ? "border-border-strong text-ink"
          : "border-border text-ink-muted hover:border-border-strong",
      )}
    >
      <Icon className="size-[15px] text-ink-dim" />
      <span>{label}</span>
      <ChevronDown className="size-3 text-ink-dim" />
    </button>
  );
}

function CheckItem({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-3 rounded-md px-2.5 py-2 text-left text-[13px] text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
    >
      <span>{label}</span>
      {selected ? <Check className="size-3.5 text-jade" /> : null}
    </button>
  );
}

export default function RecordsPage() {
  const [query, setQuery] = useState("");
  const [langs, setLangs] = useState<Lang[]>([]);
  const [statuses, setStatuses] = useState<RecordStatus[]>([]);
  const [dateRange, setDateRange] = useState<DateValue>("all");

  function toggleLang(l: Lang) {
    setLangs((prev) =>
      prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l],
    );
  }
  function toggleStatus(s: RecordStatus) {
    setStatuses((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  }

  const filtered = useMemo(() => {
    const now = Date.now();
    const q = query.trim().toLowerCase();
    return DEMO_RECORDS.filter((r) => {
      if (q && !r.complaint.toLowerCase().includes(q) && !r.code.toLowerCase().includes(q))
        return false;
      if (langs.length && !langs.includes(r.language)) return false;
      if (statuses.length && !statuses.includes(r.status)) return false;
      if (dateRange !== "all") {
        const age = now - new Date(r.date).getTime();
        const day = 86_400_000;
        if (dateRange === "7d" && age > 7 * day) return false;
        if (dateRange === "30d" && age > 30 * day) return false;
        if (dateRange === "jun" && !r.date.startsWith("2026-06")) return false;
      }
      return true;
    });
  }, [query, langs, statuses, dateRange]);

  const langActive = langs.length > 0;
  const statusActive = statuses.length > 0;
  const dateActive = dateRange !== "all";

  return (
    <AppShell className="max-w-[920px]">
      {/* Page header */}
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="mb-6"
      >
        <h1 className="ds-display text-[34px] leading-[1.04] text-ink">My Records</h1>
        <p className="mt-1 text-[13px] text-ink-muted">
          Your consultation notes — owned by you, verifiable by anyone.
        </p>
      </motion.header>

      {/* New consultation hero */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        className="mb-6 flex flex-col gap-4 rounded-xl border border-border bg-surface-1 p-5 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-jade-deep bg-surface-2">
            <Mic className="size-[22px] text-jade" />
          </span>
          <div>
            <div className="text-base font-medium text-ink">New consultation</div>
            <p className="mt-0.5 text-[13px] text-ink-muted">
              Speak Tamil, Hindi or English — get a structured note you own.
            </p>
          </div>
        </div>
        <Button asChild variant="live" size="lg" className="shrink-0">
          <Link href="/app">
            <Mic className="size-4" />
            Start
          </Link>
        </Button>
      </motion.div>

      {/* Search + filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search consultations…"
          className="h-[38px] min-w-[200px] flex-1 bg-surface-3"
        />

        <Popover>
          <PopoverTrigger asChild>
            <span>
              <FilterTrigger icon={Languages} label="Language" active={langActive} />
            </span>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-52 p-1.5">
            <p className="ds-eyebrow px-2.5 pb-1.5 pt-1 text-ink-dim">Language</p>
            {LANG_OPTIONS.map((o) => (
              <CheckItem
                key={o.value}
                label={o.label}
                selected={langs.includes(o.value)}
                onClick={() => toggleLang(o.value)}
              />
            ))}
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <span>
              <FilterTrigger icon={CircleCheck} label="Status" active={statusActive} />
            </span>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-44 p-1.5">
            <p className="ds-eyebrow px-2.5 pb-1.5 pt-1 text-ink-dim">Status</p>
            {STATUS_OPTIONS.map((o) => (
              <CheckItem
                key={o.value}
                label={o.label}
                selected={statuses.includes(o.value)}
                onClick={() => toggleStatus(o.value)}
              />
            ))}
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <span>
              <FilterTrigger icon={Calendar} label="Date range" active={dateActive} />
            </span>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-44 p-1.5">
            <p className="ds-eyebrow px-2.5 pb-1.5 pt-1 text-ink-dim">Date range</p>
            {DATE_OPTIONS.map((o) => (
              <CheckItem
                key={o.value}
                label={o.label}
                selected={dateRange === o.value}
                onClick={() => setDateRange(o.value)}
              />
            ))}
          </PopoverContent>
        </Popover>
      </div>

      {/* Caption row */}
      <div className="mb-2.5 flex items-center justify-between gap-3 px-0.5">
        <span className="ds-eyebrow text-ink-dim">
          {filtered.length} {filtered.length === 1 ? "record" : "records"} · all owned by you
        </span>
        <span className="ds-mono inline-flex items-center gap-1.5 text-[11px] text-ink-muted">
          <ShieldCheck className="size-3.5 text-jade" />
          Owned on 0G Storage
        </span>
      </div>

      {/* Records table */}
      <div className="overflow-hidden rounded-xl border border-border bg-surface-3">
        <div className="grid grid-cols-[74px_1fr_64px_120px_minmax(0,118px)_40px] gap-3 border-b border-border bg-surface-1 px-4 py-3">
          {["Date", "Chief complaint", "Lang", "Status", "Root", ""].map((h, i) => (
            <span key={i} className="ds-eyebrow text-ink-dim">
              {h}
            </span>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="text-sm text-ink-muted">No consultations match these filters.</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setLangs([]);
                setStatuses([]);
                setDateRange("all");
              }}
              className="mt-2 text-[13px] text-jade transition-opacity hover:opacity-80"
            >
              Clear filters
            </button>
          </div>
        ) : (
          filtered.map((r, i) => (
            <Link
              key={r.id}
              href={`/records/${r.id}`}
              className="group grid grid-cols-[74px_1fr_64px_120px_minmax(0,118px)_40px] items-center gap-3 border-b border-border/60 px-4 py-3.5 transition-colors last:border-b-0 hover:bg-surface-1"
            >
              <span className="ds-mono text-xs text-ink-muted">
                {formatDayMonth(r.date)}
              </span>
              <span className="truncate text-sm text-ink">{r.complaint}</span>
              <Badge
                variant="outline"
                className="ds-mono w-fit justify-self-start border-border bg-surface-2 px-1.5 py-0.5 text-[11px] font-normal text-ink-muted"
              >
                {LANGUAGE_LABEL[r.language]}
              </Badge>
              <StatusChip status={r.status} className="justify-self-start" />
              <span onClick={(e) => e.preventDefault()} className="min-w-0">
                <Copyable
                  value={r.root}
                  display={truncHash(r.root)}
                  label="Root copied"
                  className="text-xs"
                />
              </span>
              <ArrowUpRight className="size-[15px] justify-self-end text-ink-dim transition-colors group-hover:text-ink" />
            </Link>
          ))
        )}
      </div>

      {/* Empty-state reference block */}
      <div className="mt-8 border-t border-border pt-6">
        <p className="ds-eyebrow mb-3 text-ink-dim">
          Empty state — shown for reference (first visit)
        </p>
        <div className="rounded-xl border border-dashed border-border-strong bg-surface-3 px-6 py-11 text-center">
          <span className="mb-3.5 inline-flex size-[52px] items-center justify-center rounded-xl border border-border bg-surface-1">
            <FileText className="size-6 text-ink-dim" />
          </span>
          <h2 className="ds-display text-[26px] text-ink">No consultations yet</h2>
          <p className="mx-auto mt-1.5 max-w-[340px] text-[13.5px] leading-relaxed text-ink-muted">
            Your first note will live here — owned by you on 0G Storage, verifiable by anyone.
          </p>
          <Button asChild variant="outline" className="mt-4 border-jade-deep text-jade hover:bg-jade-soft hover:text-jade">
            <Link href="/app">
              <Mic className="size-4" />
              Start a consultation
            </Link>
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
