"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/** Mono hash/address with a copy affordance and a tooltip revealing the full value. */
export function Copyable({
  value,
  display,
  className,
  label = "Copied",
}: {
  value: string;
  display?: string;
  className?: string;
  label?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(value);
            toast.success(label);
          }}
          className={cn(
            "ds-mono group inline-flex items-center gap-1.5 text-ink-muted transition-colors hover:text-ink",
            className,
          )}
        >
          <span>{display ?? value}</span>
          <Copy className="size-3 text-ink-dim transition-colors group-hover:text-jade" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="ds-mono max-w-[320px] break-all text-[11px]">
        {value}
      </TooltipContent>
    </Tooltip>
  );
}
