import { CircleCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/** A passing verification check row: jade check + label + plain-language detail + mono value. */
export function CheckRow({
  title,
  detail,
  value,
  subFacts,
  className,
}: {
  title: string;
  detail?: string;
  value?: string;
  subFacts?: { label: string; value: string }[];
  className?: string;
}) {
  return (
    <div className={cn("flex items-start gap-3 py-3", className)}>
      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border border-jade/30 bg-jade-soft">
        <CircleCheck className="size-3.5 text-jade" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm font-medium text-ink">{title}</span>
          {value ? <span className="ds-mono shrink-0 text-[11px] text-ink-dim">{value}</span> : null}
        </div>
        {detail ? <p className="mt-0.5 text-xs text-ink-muted">{detail}</p> : null}
        {subFacts?.length ? (
          <ul className="mt-2 space-y-1">
            {subFacts.map((f) => (
              <li key={f.label} className="flex items-center justify-between gap-3 text-[11px]">
                <span className="text-ink-dim">↳ {f.label}</span>
                <span className="ds-mono text-ink-muted">{f.value}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
