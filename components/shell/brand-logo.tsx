import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

const SIZES = {
  sm: { box: "size-7", image: 28, text: "text-[17px]" },
  md: { box: "size-8", image: 32, text: "text-[20px]" },
  lg: { box: "size-9", image: 36, text: "text-[22px]" },
} as const;

type BrandLogoProps = {
  href?: string;
  size?: keyof typeof SIZES;
  showText?: boolean;
  subtitle?: string;
  className?: string;
};

export function BrandLogo({
  href,
  size = "md",
  showText = true,
  subtitle,
  className,
}: BrandLogoProps) {
  const lockup = (
    <span className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <BrandLogoMark size={size} labelled={!showText} />
      {showText ? (
        <span className="min-w-0">
          <span
            className={cn(
              "ds-display block truncate leading-none text-ink",
              SIZES[size].text,
            )}
          >
            ScribeZero
          </span>
          {subtitle ? (
            <span className="ds-mono mt-1 block truncate text-[10px] uppercase text-ink-dim">
              {subtitle}
            </span>
          ) : null}
        </span>
      ) : null}
    </span>
  );

  if (!href) return lockup;

  return (
    <Link href={href} className="rounded-md outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-jade/50">
      {lockup}
    </Link>
  );
}

export function BrandLogoMark({
  size = "md",
  labelled = true,
  className,
}: {
  size?: keyof typeof SIZES;
  labelled?: boolean;
  className?: string;
}) {
  const px = SIZES[size].image;

  return (
    <span
      className={cn(
        "relative block shrink-0 overflow-hidden rounded-md bg-surface-2 shadow-[0_0_18px_rgba(132,196,160,0.18)]",
        SIZES[size].box,
        className,
      )}
    >
      <Image
        src="/brand/scribe-zero-icon.png"
        alt={labelled ? "ScribeZero" : ""}
        width={px}
        height={px}
        sizes={`${px}px`}
        className="size-full object-cover"
      />
    </span>
  );
}
