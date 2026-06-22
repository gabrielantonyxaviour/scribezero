"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LockOpen, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { WalletButton } from "@/components/shell/wallet-button";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

const LINKS = [
  { href: "/dashboard", label: "Today" },
  { href: "/app", label: "Scribe" },
  { href: "/patients", label: "Patients" },
  { href: "/records", label: "Records" },
  { href: "/verify", label: "Verify" },
  { href: "/settings", label: "Settings" },
];

export function TopNav({ walletless = false }: { walletless?: boolean }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/app" ? pathname === "/app" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-bg">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-5 lg:px-6">
        <div className="flex items-center gap-7">
          <Link href="/app" className="ds-display text-[22px] leading-none text-ink">
            ScribeZero
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "relative py-4 text-sm transition-colors",
                  isActive(l.href)
                    ? "font-medium text-ink"
                    : "text-ink-muted hover:text-ink",
                )}
              >
                {l.label}
                {isActive(l.href) && (
                  <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-jade" />
                )}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {walletless ? (
            <span className="ds-mono flex items-center gap-1.5 text-xs text-ink-dim">
              <LockOpen className="size-3.5" /> no wallet needed
            </span>
          ) : (
            <WalletButton />
          )}
        </div>

        {/* mobile */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80vw] border-border-strong bg-surface-1">
              <SheetHeader>
                <SheetTitle className="ds-display text-2xl text-ink">ScribeZero</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">
                {LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={cn(
                      "rounded-md px-3 py-3 text-lg transition-colors",
                      isActive(l.href)
                        ? "border-l-2 border-jade bg-surface-2 font-medium text-ink"
                        : "text-ink-muted hover:text-ink",
                    )}
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
              <Separator className="my-4" />
              <div className="px-4">{!walletless && <WalletButton />}</div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
