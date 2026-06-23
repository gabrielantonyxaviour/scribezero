"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useWallet } from "@/components/providers/wallet-provider";
import { useOnboarding } from "@/lib/onboarding/store";

function Waiting({ label }: { label: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <div className="flex items-center gap-2 text-ink-muted">
        <Loader2 className="size-4 animate-spin text-jade" />
        <span className="ds-mono text-xs">{label}</span>
      </div>
    </div>
  );
}

/**
 * Gate for protected product pages. Once Privy is ready:
 *  - not signed in        -> back to the landing page (which opens sign-in)
 *  - signed in, no profile -> onboarding
 *  - signed in + onboarded -> render the page
 */
export function RequireDoctor({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { ready, connected, resolving } = useWallet();
  const { status } = useOnboarding();

  useEffect(() => {
    if (!ready || resolving) return;
    if (!connected) {
      router.replace("/");
      return;
    }
    if (status === "needed") router.replace("/onboarding");
  }, [ready, connected, resolving, status, router]);

  if (!ready || resolving) return <Waiting label="loading workspace" />;
  if (!connected) return <Waiting label="redirecting to sign in" />;
  if (status === "loading") return <Waiting label="loading workspace" />;
  if (status === "needed") return <Waiting label="opening onboarding" />;
  return <>{children}</>;
}

/**
 * Mounted on the landing page. The moment a doctor signs in, send them into
 * the product: onboarding if new, dashboard if returning. This is the
 * redirect-after-auth behavior that was missing.
 */
export function AuthRedirect() {
  const router = useRouter();
  const { ready, connected, resolving } = useWallet();
  const { status } = useOnboarding();

  useEffect(() => {
    if (!ready || resolving || !connected || status === "loading") return;
    router.replace(status === "done" ? "/dashboard" : "/onboarding");
  }, [ready, connected, resolving, status, router]);

  return null;
}
