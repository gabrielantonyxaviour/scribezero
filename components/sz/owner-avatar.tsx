import { cn } from "@/lib/utils";

/**
 * Canonical flat "shapes" avatar, deterministically seeded by the owner address.
 * Flat surfaces only — no gradients. Used identically everywhere an owner is shown.
 */
export function OwnerAvatar({
  address,
  size = 24,
  className,
}: {
  address: string;
  size?: number;
  className?: string;
}) {
  const seed = address.toLowerCase().replace(/[^a-f0-9]/g, "");
  const n = (i: number) => parseInt(seed.slice(i * 2, i * 2 + 2) || "0", 16);
  const palette = ["#3e6b52", "#6e6d66", "#84c4a0", "#a9897e"];
  const c1 = palette[n(0) % palette.length];
  const c2 = palette[(n(1) + 1) % palette.length];
  const r = 30;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 30 30"
      aria-hidden="true"
      className={cn("shrink-0 rounded-[4px]", className)}
      style={{ display: "block" }}
    >
      <rect width={r} height={r} rx="4" fill="#1e211d" />
      <circle cx={6 + (n(2) % 8)} cy={8 + (n(3) % 6)} r={6} fill={c1} />
      <rect
        x={12 + (n(4) % 4)}
        y={12 + (n(5) % 4)}
        width="11"
        height="11"
        rx="2"
        fill={c2}
      />
    </svg>
  );
}
