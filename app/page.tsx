"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Mic,
  Cpu,
  Stethoscope,
  Lock,
  ShieldCheck,
  Award,
  Database,
  AlertTriangle,
  Check,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiveDot } from "@/components/sz/live-dot";
import { Copyable } from "@/components/sz/copyable";
import { useWallet } from "@/components/providers/wallet-provider";
import { DEMO_PROOF, DEMO_RECORD, DEMO_NOTE } from "@/lib/mock/data";
import { truncHash, truncAddress } from "@/lib/format";

/* ---------- entrance (CSS on-load, visible by default) ---------- */

function Reveal({
  children,
  index = 0,
  className,
}: {
  children: React.ReactNode;
  index?: number;
  className?: string;
}) {
  return (
    <div className={cn("ds-rise", className)} style={{ animationDelay: `${index * 70}ms` }}>
      {children}
    </div>
  );
}

const STORAGE_ROOT = DEMO_RECORD.zgStorageRootHash;
const OWNER = DEMO_RECORD.ownerAddress;

/* ---------- page ---------- */

export default function LandingPage() {
  const { connect } = useWallet();

  return (
    <div className="min-h-screen bg-bg text-ink">
      {/* sticky marketing chrome */}
      <header className="sticky top-0 z-40 border-b border-border bg-bg/90">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-6">
          <span className="ds-display text-[22px] leading-none text-ink">ScribeZero</span>
          <nav className="flex items-center gap-5">
            <a
              href="#how"
              className="hidden text-[13px] text-ink-muted transition-colors hover:text-ink sm:inline"
            >
              How it works
            </a>
            <a
              href="#verify"
              className="hidden text-[13px] text-ink-muted transition-colors hover:text-ink sm:inline"
            >
              Verify
            </a>
            <Button variant="outline" size="sm" onClick={connect}>
              Connect wallet
            </Button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6">
        <Hero />
        <Rule />
        <Problem />
        <Rule />
        <HowItWorks />
        <Rule />
        <WhyOnlyOnG />
        <Rule />
        <Callout />
        <Rule />
        <CtaBand />
      </main>

      <Footer />
    </div>
  );
}

function Rule() {
  return <div className="h-px bg-border" />;
}

/* ---------- hero ---------- */

function Hero() {
  return (
    <section className="flex flex-col gap-8 py-11 md:flex-row md:items-start md:gap-8">
      <Reveal className="min-w-0 flex-1">
        <div className="mb-[18px] inline-flex items-center gap-2">
          <LiveDot size={7} />
          <span className="ds-eyebrow text-jade">live on 0G testnet</span>
        </div>
        <h1 className="ds-display text-[42px] leading-[1.03] tracking-[-0.01em] text-ink sm:text-[50px]">
          Speak your language.
          <br />
          Own your record.
        </h1>
        <p className="mt-[18px] max-w-[380px] text-[15px] text-ink-muted">
          A verifiable health scribe for India. Speak Tamil or Hindi — get a structured clinical
          note that is provably yours, sealed on 0G, and tamper-evident by anyone.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button asChild size="lg">
            <Link href="/app">Try the scribe</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/verify">Verify a record</Link>
          </Button>
        </div>
        <div className="mt-[30px] flex items-stretch gap-[22px]">
          <HeroStat value="ta-IN · hi-IN" label="languages" />
          <div className="w-px bg-border" />
          <HeroStat value="TeeTLS" label="verified inference" />
          <div className="w-px bg-border" />
          <HeroStat value={truncHash(STORAGE_ROOT)} label="your root hash" />
        </div>
      </Reveal>

      <Reveal index={1} className="md:w-[258px] md:flex-shrink-0">
        <LiveScribeCard />
      </Reveal>
    </section>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="ds-mono text-[18px] text-ink">{value}</div>
      <div className="ds-eyebrow mt-1">{label}</div>
    </div>
  );
}

function LiveScribeCard() {
  return (
    <div className="overflow-hidden rounded-xl border border-border-strong bg-surface-1">
      <div className="flex items-center justify-between border-b border-border px-[13px] py-[11px]">
        <div className="flex items-center gap-[7px]">
          <LiveDot size={8} />
          <span className="ds-mono text-[11px] text-jade">recording · 00:42</span>
        </div>
        <span className="ds-mono text-[11px] text-ink-dim">ta-IN</span>
      </div>

      <div className="border-b border-border px-[13px] py-3">
        <div className="ds-eyebrow mb-2">transcript</div>
        <p className="mb-1.5 text-[13px] text-ink-muted">
          <span className="ds-mono text-[11px] text-ink-dim">patient</span>
          <br />
          மூணு நாளா காய்ச்சல், உலர்ந்த இருமல்
        </p>
        <p className="text-[13px] text-ink">
          <span className="ds-mono text-[11px] text-ink-dim">en</span>
          <br />
          Fever for three days, dry cough
          <span className="ml-0.5 inline-block animate-pulse text-jade">▍</span>
        </p>
      </div>

      <div className="border-b border-border px-[13px] py-3">
        <div className="ds-eyebrow mb-2">SOAP note</div>
        <div className="text-[12px]">
          <span className="ds-mono text-[11px] text-ink-dim">A · </span>
          <span className="text-ink">Likely viral upper-respiratory infection</span>
        </div>
        <div className="mt-1.5 text-[12px]">
          <span className="ds-mono text-[11px] text-ink-dim">P · </span>
          <span className="text-ink-muted">Rest, fluids, paracetamol 500mg PRN</span>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-surface-3 px-[13px] py-[11px]">
        <ShieldCheck className="size-4 shrink-0 text-jade" />
        <div className="min-w-0">
          <div className="ds-mono text-[11px] text-jade">sealed on 0G</div>
          <div className="ds-mono truncate text-[11px] text-ink-dim">
            root {truncHash(STORAGE_ROOT)} · owner {truncAddress(OWNER)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- problem ---------- */

function Problem() {
  return (
    <section className="py-12">
      <Reveal>
        <div className="ds-eyebrow text-vermillion">the problem</div>
        <p className="ds-display mt-[14px] max-w-[540px] text-[30px] leading-[1.12] text-ink sm:text-[34px]">
          Your health story lives in hospital systems you will never log into again.
        </p>
        <p className="mt-[18px] max-w-[500px] text-[15px] text-ink-muted">
          A consultation in Chennai. A note typed in English you don&apos;t speak, stored on a
          server you don&apos;t control, exported never. When you change doctors, the record stays
          behind. You were the patient — you were never the owner.
        </p>
      </Reveal>

      <Reveal index={1}>
        <div className="mt-[26px] grid grid-cols-1 overflow-hidden rounded-lg border border-border sm:grid-cols-2">
          <div className="border-b border-border px-[18px] py-4 sm:border-b-0 sm:border-r">
            <div className="ds-mono text-[11px] text-ink-dim">today</div>
            <div className="mt-2 text-[14px] text-ink-muted">Note locked in hospital EMR</div>
            <div className="mt-1 text-[14px] text-ink-muted">Language barrier at the desk</div>
            <div className="mt-1 text-[14px] text-ink-muted">No copy you can verify</div>
          </div>
          <div className="px-[18px] py-4">
            <div className="ds-mono text-[11px] text-jade">with ScribeZero</div>
            <div className="mt-2 text-[14px] text-ink">Note bound to your wallet</div>
            <div className="mt-1 text-[14px] text-ink">Spoken in your own language</div>
            <div className="mt-1 text-[14px] text-ink">Cryptographically yours</div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ---------- how it works ---------- */

type Step = {
  num: string;
  active?: boolean;
  icon: React.ReactNode;
  title: string;
  body: string;
  aside: React.ReactNode;
};

function HowItWorks() {
  const steps: Step[] = [
    {
      num: "01",
      icon: <Mic className="size-[18px] text-ink-muted" />,
      title: "Speak the consult",
      body: "Tamil or Hindi, doctor and patient. Sarvam streaming STT transcribes live and translates inline as you talk.",
      aside: (
        <StepAside>
          <div className="ds-mono mb-1.5 text-[11px] text-ink-dim">hi-IN · doctor</div>
          <p className="text-[13px] text-ink">तीन दिन से बुखार है</p>
          <p className="ds-mono mt-[5px] text-[11px] text-ink-muted">conf 0.96</p>
        </StepAside>
      ),
    },
    {
      num: "02",
      icon: <Cpu className="size-[18px] text-ink-muted" />,
      title: "Structure inside 0G Compute",
      body: "The note-generation call runs through a 0G Compute TeeTLS broker. The model writes Subjective, Objective, Assessment, Plan — and signs the run.",
      aside: (
        <StepAside>
          <div className="ds-mono mb-1.5 text-[11px] text-ink-dim">S · subjective</div>
          <p className="text-[13px] text-ink">
            Dry cough, low-grade fever ×3 days, no breathlessness
          </p>
        </StepAside>
      ),
    },
    {
      num: "03",
      icon: <Stethoscope className="size-[18px] text-ink-muted" />,
      title: "Read the clinical note",
      body: "A clean SOAP note with the chief complaint, assessment and plan — in English and your own language, side by side.",
      aside: (
        <StepAside>
          <div className="ds-mono mb-1.5 text-[11px] text-ink-dim">A · assessment</div>
          <p className="text-[13px] text-ink">
            {(DEMO_NOTE.assessment ?? "").split(".")[0]}
          </p>
        </StepAside>
      ),
    },
    {
      num: "04",
      active: true,
      icon: <Lock className="size-[18px] text-jade" />,
      title: "Own it on 0G Storage",
      body: "The note and its proof are written to 0G Storage. You get back a Merkle root hash bound to your wallet — the one and only handle to your record.",
      aside: (
        <StepAside active>
          <div className="ds-mono mb-1.5 text-[11px] text-jade">storage root</div>
          <Copyable
            value={STORAGE_ROOT}
            display={truncHash(STORAGE_ROOT)}
            className="text-[12px] text-ink"
            label="Storage root copied"
          />
          <p className="ds-mono mt-[5px] text-[11px] text-ink-dim">owner {truncAddress(OWNER)}</p>
        </StepAside>
      ),
    },
  ];

  return (
    <section id="how" className="scroll-mt-20 py-12">
      <Reveal>
        <div className="ds-eyebrow">how it works</div>
        <p className="ds-display mt-[14px] max-w-[520px] text-[30px] leading-[1.1] text-ink sm:text-[34px]">
          One flow. Mic to owned record, in under a minute.
        </p>
      </Reveal>

      <div className="mt-[30px]">
        {steps.map((step, i) => (
          <Reveal key={step.num} index={i}>
            <div
              className={`flex flex-col gap-5 border-t border-border py-[22px] sm:flex-row sm:gap-5 ${
                i === steps.length - 1 ? "border-b" : ""
              }`}
            >
              <div className="w-[54px] flex-shrink-0">
                <span
                  className={`ds-display text-[40px] leading-none ${
                    step.active ? "text-jade" : "text-jade-deep"
                  }`}
                >
                  {step.num}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {step.icon}
                  <span className="text-[16px] font-medium text-ink">{step.title}</span>
                </div>
                <p className="mt-1.5 max-w-[360px] text-[14px] text-ink-muted">{step.body}</p>
              </div>
              <div className="sm:w-[160px] sm:flex-shrink-0">{step.aside}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function StepAside({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <div
      className={`rounded-md px-3 py-[11px] ${
        active ? "border border-jade-deep bg-surface-3" : "border border-border bg-surface-1"
      }`}
    >
      {children}
    </div>
  );
}

/* ---------- why only on 0G ---------- */

function WhyOnlyOnG() {
  return (
    <section id="verify" className="scroll-mt-20 py-12">
      <Reveal>
        <div className="ds-eyebrow text-jade">why only on 0G</div>
        <p className="ds-display mt-[14px] max-w-[540px] text-[30px] leading-[1.12] text-ink sm:text-[34px]">
          The privacy and ownership are the protocol — not a promise.
        </p>
        <p className="mt-4 max-w-[520px] text-[15px] text-ink-muted">
          Two 0G primitives carry the whole guarantee. A signed TeeTLS routing proof says exactly
          which model saw your words and what it returned. A 0G Storage Merkle root says the record
          is yours and unaltered. Anyone can check both, no account needed.
        </p>
      </Reveal>

      <div className="mt-[26px] grid grid-cols-1 gap-3.5 md:grid-cols-2">
        <Reveal index={1}>
          <ProofCard
            icon={<Award className="size-[17px] text-ink-muted" />}
            title="TeeTLS routing proof"
            body="The broker runs in a TEE and signs a proof binding the request, the response and the provider's TLS fingerprint."
            rows={[
              { label: "request hash", node: <ProofValue value={DEMO_PROOF.requestHash} /> },
              { label: "response hash", node: <ProofValue value={DEMO_PROOF.responseHash} /> },
              {
                label: "tls fingerprint",
                node: (
                  <Copyable
                    value={DEMO_PROOF.providerTlsFingerprint}
                    display={`sha256:${DEMO_PROOF.providerTlsFingerprint.slice(0, 2)}…${DEMO_PROOF.providerTlsFingerprint.slice(-2)}`}
                    className="text-[11px]"
                    label="Fingerprint copied"
                  />
                ),
              },
            ]}
            footer={{ label: "signature", value: "valid" }}
          />
        </Reveal>

        <Reveal index={2}>
          <ProofCard
            icon={<Database className="size-[17px] text-ink-muted" />}
            title="0G Storage Merkle root"
            body="The note is content-addressed. Recompute the hash, resolve the root — if they match, nothing was changed."
            rows={[
              { label: "storage root", node: <ProofValue value={STORAGE_ROOT} /> },
              { label: "note hash", node: <ProofValue value={DEMO_NOTE.noteHash} /> },
              {
                label: "owner",
                node: (
                  <Copyable
                    value={OWNER}
                    display={truncAddress(OWNER)}
                    className="text-[11px]"
                    label="Owner address copied"
                  />
                ),
              },
            ]}
            footer={{ label: "hash matches", value: "true" }}
          />
        </Reveal>
      </div>

      <Reveal index={3}>
        <div className="mt-[18px] flex items-start gap-2.5 rounded-lg border border-border bg-surface-3 px-4 py-[13px]">
          <AlertTriangle className="mt-0.5 size-[17px] shrink-0 text-amber" />
          <p className="text-[14px] text-ink">
            <span className="font-medium">Remove 0G and the guarantee disappears.</span>{" "}
            <span className="text-ink-muted">
              No TEE proof means no way to know which model read your record; no Merkle root means no
              proof it&apos;s untouched, or yours.
            </span>
          </p>
        </div>
      </Reveal>
    </section>
  );
}

function ProofValue({ value }: { value: string }) {
  return <Copyable value={value} display={truncHash(value)} className="text-[11px]" label="Copied" />;
}

function ProofCard({
  icon,
  title,
  body,
  rows,
  footer,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  rows: { label: string; node: React.ReactNode }[];
  footer: { label: string; value: string };
}) {
  return (
    <div className="h-full rounded-lg border border-border bg-surface-1 px-[17px] py-4">
      <div className="mb-[11px] flex items-center gap-2">
        {icon}
        <span className="text-[14px] font-medium text-ink">{title}</span>
      </div>
      <p className="text-[13px] text-ink-muted">{body}</p>
      <div className="mt-3 flex flex-col gap-[7px]">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-2">
            <span className="ds-mono text-[11px] text-ink-dim">{row.label}</span>
            {row.node}
          </div>
        ))}
        <div className="flex items-center justify-between gap-2 border-t border-border pt-2">
          <span className="ds-mono text-[11px] text-ink-dim">{footer.label}</span>
          <span className="ds-mono inline-flex items-center gap-1 text-[11px] text-jade">
            <Check className="size-3" />
            {footer.value}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------- big typographic callout ---------- */

function Callout() {
  return (
    <section className="py-14 text-center">
      <Reveal>
        <p className="ds-eyebrow mb-5">your medical record</p>
        <p className="ds-display text-[40px] leading-[1.06] tracking-[-0.01em] text-ink sm:text-[46px]">
          Verifiably private.
          <br />
          <span className="text-jade">Owned by you.</span>
        </p>
      </Reveal>
    </section>
  );
}

/* ---------- cta band ---------- */

function CtaBand() {
  return (
    <section className="py-11">
      <Reveal>
        <div className="flex flex-col items-start justify-between gap-6 rounded-xl border border-border-strong bg-surface-1 px-7 py-7 sm:flex-row sm:items-center sm:gap-6">
          <div className="min-w-0 flex-1">
            <p className="ds-display text-[28px] leading-[1.1] text-ink sm:text-[30px]">
              Try a sample consult.
            </p>
            <p className="mt-2 max-w-[340px] text-[14px] text-ink-muted">
              No setup. Hear a Tamil consultation become a SOAP note, sealed on 0G in front of you.
              Connect a wallet to keep it.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-shrink-0">
            <Button asChild className="justify-center">
              <Link href="/app">
                Launch the scribe
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-center">
              <Link href="/verify">Verify a record</Link>
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ---------- footer ---------- */

function Footer() {
  return (
    <footer className="border-t border-border bg-surface-3">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4 px-6 py-[18px]">
        <span className="ds-display text-[17px] text-ink">ScribeZero</span>
        <span className="ds-mono min-w-[200px] flex-1 text-center text-[11px] text-ink-dim">
          Inference via 0G Compute TeeTLS · Records on 0G Storage
        </span>
        <div className="inline-flex items-center gap-[7px] rounded-full border border-border bg-surface-1 px-[11px] py-[5px]">
          <LiveDot size={7} />
          <span className="ds-mono text-[11px] text-jade">0G testnet · live</span>
        </div>
      </div>
    </footer>
  );
}
