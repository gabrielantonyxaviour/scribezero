import { CircleCheck, Clock, CircleX } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RecordStatus } from "@/lib/mock/data";

const MAP: Record<
  RecordStatus,
  { label: string; cls: string; Icon: typeof CircleCheck }
> = {
  verified: {
    label: "verified",
    cls: "text-jade border-jade/30 bg-jade-soft",
    Icon: CircleCheck,
  },
  pending: {
    label: "pending",
    cls: "text-amber border-amber/30 bg-amber-soft",
    Icon: Clock,
  },
  failed: {
    label: "failed",
    cls: "text-vermillion border-vermillion/30 bg-vermillion-soft",
    Icon: CircleX,
  },
};

export function StatusChip({ status, className }: { status: RecordStatus; className?: string }) {
  const { label, cls, Icon } = MAP[status];
  return (
    <span
      className={cn(
        "ds-mono inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px]",
        cls,
        className,
      )}
    >
      <Icon className="size-3" />
      {label}
    </span>
  );
}
