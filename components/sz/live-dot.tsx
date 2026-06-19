import { cn } from "@/lib/utils";

/** The jade live signal. Jade is reserved for genuinely live/active states. */
export function LiveDot({ size = 7, className }: { size?: number; className?: string }) {
  return (
    <span
      className={cn("ds-anim-pulse-jade inline-block rounded-full bg-jade", className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}
