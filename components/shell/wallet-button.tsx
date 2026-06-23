"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  Coins,
  Copy,
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  ShieldCheck,
  User,
  Wallet,
} from "lucide-react";
import { useLoginWithEmail, useLoginWithOAuth } from "@privy-io/react-auth";
import { useWallet } from "@/components/providers/wallet-provider";
import { OwnerAvatar } from "@/components/sz/owner-avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { truncAddress } from "@/lib/format";

type SignInStep = "choice" | "email-code";

export function WalletButton() {
  const {
    connected,
    resolving,
    address,
    balance,
    connectExternal,
    disconnect,
    copyAddress,
    manageWallet,
  } = useWallet();
  const { sendCode, loginWithCode, state: emailState } = useLoginWithEmail();
  const { initOAuth, loading: oauthLoading } = useLoginWithOAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<SignInStep>("choice");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  const isEmailBusy =
    emailState.status === "sending-code" || emailState.status === "submitting-code";

  function resetDialog(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setStep("choice");
      setCode("");
      setMessage("");
    }
  }

  function chooseExternal() {
    setOpen(false);
    connectExternal();
  }

  async function submitEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    try {
      await sendCode({ email: email.trim() });
      setStep("email-code");
      setMessage("Code sent.");
    } catch {
      setMessage("Could not send code.");
    }
  }

  async function submitCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    try {
      await loginWithCode({ code: code.trim() });
      setOpen(false);
    } catch {
      setMessage("Check the code and try again.");
    }
  }

  async function continueWithGoogle() {
    setMessage("");
    try {
      await initOAuth({ provider: "google" });
    } catch {
      setMessage("Google sign-in did not start.");
    }
  }

  if (resolving) {
    return (
      <Button variant="outline" size="sm" disabled className="rounded-md border-jade-deep text-jade">
        <Loader2 className="size-3.5 animate-spin" />
        Setting up
      </Button>
    );
  }

  if (!connected) {
    return (
      <Dialog open={open} onOpenChange={resetDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="rounded-md border-jade-deep text-jade">
            Sign in
          </Button>
        </DialogTrigger>
        <DialogContent
          className="max-w-[560px] gap-0 overflow-hidden border-border-strong bg-[#111610] p-0 text-ink shadow-[0_24px_90px_rgba(0,0,0,0.58)]"
        >
          <DialogHeader className="border-b border-border px-5 py-5 pr-12 text-left">
            <p className="ds-eyebrow text-ink-dim">Doctor account</p>
            <DialogTitle className="mt-1 text-[20px] font-medium leading-tight text-ink">
              Sign in to ScribeZero
            </DialogTitle>
            <DialogDescription className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">
              Choose how you want to save and verify patient records.
            </DialogDescription>
          </DialogHeader>

          {step === "choice" ? (
            <div className="space-y-3 p-3">
              <form onSubmit={submitEmail} className="rounded-md border border-jade-deep bg-jade-soft p-3">
                <label htmlFor="scribezero-email" className="sr-only">
                  Email address
                </label>
                <div className="flex items-center gap-2 rounded-md border border-jade-deep bg-[#0d1d15] px-3 py-2">
                  <Mail className="size-4 shrink-0 text-jade" />
                  <Input
                    id="scribezero-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    placeholder="doctor@email.com"
                    className="h-8 min-w-0 flex-1 border-0 bg-transparent px-0 text-[14px] text-ink shadow-none focus-visible:ring-0"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isEmailBusy}
                    className="h-8 rounded-md px-3"
                  >
                    {isEmailBusy ? <Loader2 className="size-3.5 animate-spin" /> : "Continue"}
                  </Button>
                </div>
                <p className="mt-2 text-[12px] text-ink-muted">No wallet app needed.</p>
              </form>

              <Button
                type="button"
                onClick={continueWithGoogle}
                disabled={oauthLoading}
                variant="outline"
                className="h-12 w-full justify-start gap-3"
              >
                <span className="flex size-7 items-center justify-center rounded bg-ink text-[13px] font-semibold text-bg">
                  G
                </span>
                Continue with Google
                {oauthLoading && <Loader2 className="ml-auto size-3.5 animate-spin text-jade" />}
              </Button>

              <Button
                type="button"
                onClick={chooseExternal}
                variant="outline"
                className="h-12 w-full justify-start gap-3 text-ink-muted hover:text-ink"
              >
                <span className="flex size-7 items-center justify-center rounded border border-border bg-surface-3">
                  <Wallet className="size-3.5" />
                </span>
                Use wallet app
              </Button>
            </div>
          ) : (
            <form onSubmit={submitCode} className="space-y-3 p-3">
              <Button
                type="button"
                onClick={() => {
                  setStep("choice");
                  setCode("");
                  setMessage("");
                }}
                variant="ghost"
                size="sm"
                className="h-7 justify-start px-0 text-[12px] text-ink-muted hover:bg-transparent hover:text-ink"
              >
                <ArrowLeft className="size-3.5" />
                Back
              </Button>
              <div className="rounded-md border border-jade-deep bg-jade-soft p-3">
                <label htmlFor="scribezero-code" className="text-[13px] font-medium text-ink">
                  Enter the code sent to {email}
                </label>
                <div className="mt-3 flex items-center gap-2 rounded-md border border-jade-deep bg-[#0d1d15] px-3 py-2">
                  <KeyRound className="size-4 shrink-0 text-jade" />
                  <Input
                    id="scribezero-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={code}
                    onChange={(event) => setCode(event.target.value.replace(/[^0-9]/g, ""))}
                    required
                    placeholder="123456"
                    className="h-8 min-w-0 flex-1 border-0 bg-transparent px-0 text-[16px] tracking-[0.16em] text-ink shadow-none focus-visible:ring-0"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isEmailBusy}
                    className="h-8 rounded-md px-3"
                  >
                    {isEmailBusy ? <Loader2 className="size-3.5 animate-spin" /> : "Verify"}
                  </Button>
                </div>
              </div>
            </form>
          )}

          {message ? <div className="px-5 pb-3 text-[12px] text-ink-muted">{message}</div> : null}

          <div className="flex items-start gap-2 border-t border-border bg-surface-3 px-5 py-3 text-[12px] leading-relaxed text-ink-dim">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-jade" />
            Your clinical workflow stays normal. We only use this to identify the record owner.
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* native 0G balance pill — left of the wallet button, no chain switcher */}
      <div className="hidden items-center gap-1.5 rounded-full border border-border bg-surface-1 px-2.5 py-1 sm:flex">
        <Coins className="size-3.5 text-ink-dim" />
        <span className="ds-mono text-xs text-ink-muted">{balance} 0G</span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 px-2">
            <OwnerAvatar address={address} size={22} />
            <span className="ds-mono text-xs text-ink-muted">{truncAddress(address)}</span>
            <ChevronDown className="size-3.5 text-ink-dim" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <User className="size-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={manageWallet}>
              <KeyRound className="size-4" /> Manage wallet
            </DropdownMenuItem>
            <DropdownMenuItem onClick={copyAddress}>
              <Copy className="size-4" /> Copy address
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={disconnect} className="text-vermillion focus:text-vermillion">
              <LogOut className="size-4" /> Disconnect
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
