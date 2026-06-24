"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ShieldCheck,
  CircleCheck,
  Info,
  Loader2,
} from "lucide-react";
import { AppShell } from "@/components/shell/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VerifyResult, type PublicVerifyFact } from "@/components/sz/verify-result";
import {
  truncHash,
  formatIST,
  LANGUAGE_LABEL,
} from "@/lib/format";
import { summarizeProofReceipt } from "@/lib/proof/receipt";
import type { ConsultNote, VerificationResult } from "@/shared/contract";
import {
  ciphertextHash as recordCiphertextHash,
  isEncryptedRecordArtifact,
  type EncryptedRecordArtifact,
} from "@/lib/records/encrypted-artifact";
import {
  ciphertextHash as documentCiphertextHash,
  isEncryptedDocumentArtifact,
  type EncryptedDocumentArtifact,
} from "@/lib/documents/artifact";
import {
  ciphertextHash as patientCiphertextHash,
  isEncryptedPatientArtifact,
  type EncryptedPatientArtifact,
} from "@/lib/patients/artifact";

type Phase = "idle" | "checking" | "verified";
type VerifiableArtifact =
  | EncryptedRecordArtifact
  | EncryptedDocumentArtifact
  | EncryptedPatientArtifact;

type VerifiedRoot = {
  note?: ConsultNote;
  artifact?: VerifiableArtifact;
  verification: VerificationResult;
  proof: ReturnType<typeof summarizeProofReceipt>;
  publicFacts: PublicVerifyFact[];
  noteHash: `0x${string}`;
  integrityTitle: string;
  integrityDetail: string;
  computeValue: string;
  computeSubFacts?: { label: string; value: string }[];
  privacyCopy: string;
  elapsedMs: number;
};

function isRootHash(value: string) {
  return /^0x[a-fA-F0-9]{64}$/.test(value.trim());
}

function asNote(payload: unknown): ConsultNote | null {
  const candidate =
    payload && typeof payload === "object" && "note" in payload
      ? (payload as { note?: unknown }).note
      : payload;
  if (!candidate || typeof candidate !== "object") return null;
  const note = candidate as Partial<ConsultNote>;
  return typeof note.id === "string" &&
    typeof note.summary === "string" &&
    typeof note.noteHash === "string" &&
    typeof note.createdAt === "string"
    ? (note as ConsultNote)
    : null;
}

function asEncryptedArtifact(payload: unknown): VerifiableArtifact | null {
  if (isEncryptedRecordArtifact(payload)) return payload;
  if (isEncryptedDocumentArtifact(payload)) return payload;
  if (isEncryptedPatientArtifact(payload)) return payload;
  return null;
}

function artifactCiphertextHash(artifact: VerifiableArtifact): `0x${string}` {
  if (isEncryptedDocumentArtifact(artifact)) return documentCiphertextHash(artifact.ciphertext);
  if (isEncryptedPatientArtifact(artifact)) return patientCiphertextHash(artifact.ciphertext);
  return recordCiphertextHash(artifact.ciphertext);
}

function artifactPublicFacts(artifact: VerifiableArtifact, rootHash: string) {
  const base: PublicVerifyFact[] = [
    { label: "storage root", value: rootHash, copy: true },
    { label: "owner address", value: artifact.public.ownerAddress, copy: true },
    { label: "created", value: formatIST(artifact.public.createdAt) },
  ];
  if (isEncryptedDocumentArtifact(artifact)) {
    return [
      ...base,
      { label: "artifact type", value: "clinical document" },
      { label: "document id", value: artifact.public.documentId, copy: true },
      { label: "patient id", value: artifact.public.patientId, copy: true },
      { label: "language", value: LANGUAGE_LABEL[artifact.public.language] },
    ];
  }
  if (isEncryptedPatientArtifact(artifact)) {
    return [
      ...base,
      { label: "artifact type", value: "patient profile" },
      { label: "patient id", value: artifact.public.patientId, copy: true },
      { label: "language", value: LANGUAGE_LABEL[artifact.public.preferredLanguage] },
    ];
  }
  return [
    ...base,
    { label: "artifact type", value: "consult note" },
    { label: "note id", value: artifact.public.noteId, copy: true },
    { label: "language", value: LANGUAGE_LABEL[artifact.public.language] },
  ];
}

function artifactComputeProof(artifact: VerifiableArtifact) {
  if (isEncryptedPatientArtifact(artifact)) return null;
  return artifact.public.computeProof;
}

export default function VerifyPage() {
  const [root, setRoot] = useState(() =>
    typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("root") ?? "" : "",
  );
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<VerifiedRoot | null>(null);
  const [error, setError] = useState("");

  async function handleVerify() {
    if (phase === "checking") return;
    setError("");
    setResult(null);
    const rootHash = root.trim();
    if (!isRootHash(rootHash)) {
      setError("Paste a valid 0G Storage root: 0x followed by 64 hex characters.");
      return;
    }
    setPhase("checking");
    const t0 = Date.now();
    try {
      const download = await fetch(`/api/0g/download?root=${encodeURIComponent(rootHash)}`);
      const text = await download.text();
      if (!download.ok) throw new Error(text || `0G download failed with ${download.status}`);
      const payload = JSON.parse(text) as unknown;
      const encrypted = asEncryptedArtifact(payload);
      const note = encrypted ? null : asNote(payload);
      if (!encrypted && !note) {
        throw new Error("0G root did not contain a ScribeZero note or encrypted artifact.");
      }

      const verifyBody = encrypted
        ? { rootHash }
        : {
            rootHash,
            summary: note?.summary,
            noteHash: note?.noteHash,
            proofValid: false,
          };
      const verify = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(verifyBody),
      });
      const verification = (await verify.json()) as Omit<VerificationResult, "noteId"> & { error?: string };
      if (!verify.ok || verification.error) {
        throw new Error(verification.error || `0G verification failed with ${verify.status}`);
      }
      const encryptedHashMatches = encrypted
        ? artifactCiphertextHash(encrypted) === encrypted.encryption.ciphertextHash
        : verification.hashMatches;
      const computeProof = encrypted ? artifactComputeProof(encrypted) : null;
      const computeLive = computeProof?.verified === true;
      const proof = summarizeProofReceipt({
        noteHashMatches: encryptedHashMatches,
        computeProofValid: computeLive,
        storageReachable: verification.storageReachable,
        computeMode: computeLive ? "live" : "fallback",
        storageMode: verification.storageReachable ? "live" : "fallback",
      });
      const noteId = isEncryptedRecordArtifact(encrypted) ? encrypted.public.noteId : note?.id ?? "unknown";
      const noteHash = (encrypted ? encrypted.encryption.ciphertextHash : note?.noteHash) as `0x${string}`;
      const publicFacts: PublicVerifyFact[] = encrypted
        ? artifactPublicFacts(encrypted, rootHash)
        : [
            { label: "storage root", value: rootHash, copy: true },
            { label: "note id", value: noteId, copy: true },
            { label: "created", value: formatIST(note?.createdAt ?? new Date().toISOString()) },
            { label: "language", value: LANGUAGE_LABEL[note?.language ?? "en"] },
          ];
      publicFacts.splice(3, 0, { label: "verification result", value: `${proof.verdict} · ${proof.modeLabel}` });
      const computeSubFacts = encrypted
        ? [
            { label: "Provider", value: computeProof?.provider ?? "not applicable" },
            { label: "TEE verified", value: String(computeLive) },
            { label: "Ciphertext hash", value: truncHash(encrypted.encryption.ciphertextHash) },
          ]
        : undefined;
      setResult({
        note: note ?? undefined,
        artifact: encrypted ?? undefined,
        verification: { noteId, ...verification, hashMatches: encryptedHashMatches, proofValid: computeLive },
        proof,
        publicFacts,
        noteHash,
        integrityTitle: encrypted ? "Ciphertext hash matches" : "Note hash matches",
        integrityDetail: encrypted
          ? encryptedHashMatches
            ? "Ciphertext hash · match"
            : "Ciphertext hash · mismatch"
          : proof.integrityLabel,
        computeValue: computeProof?.chatID
          ? `proof ${truncHash(computeProof.chatID)}`
          : encrypted
            ? "not required for this artifact"
            : "proof bundle not present in stored artifact",
        computeSubFacts,
        privacyCopy: encrypted
          ? "The artifact stays encrypted and wallet-owned. Public verification exposes only owner, ids, hashes, proof status, and 0G Storage reachability."
          : "The note stays encrypted and owned by the patient. The chief complaint, transcript, and SOAP note are never exposed here — only the integrity above is publicly verifiable.",
        elapsedMs: Date.now() - t0,
      });
      setPhase("verified");
    } catch (err) {
      setError((err as Error).message);
      setPhase("idle");
    }
  }

  const checking = phase === "checking";
  const verified = phase === "verified";

  return (
    <AppShell walletless contained={false}>
      <div className="mx-auto w-full max-w-[660px] px-5 pb-16 pt-10 sm:pt-14">
        <header className="text-center">
          <div className="ds-eyebrow inline-flex items-center gap-1.5 text-ink-muted">
            <ShieldCheck className="size-3.5" />
            public verifier · trustless
          </div>
          <h1 className="ds-display mt-4 text-[40px] leading-[1.04] text-ink sm:text-[44px]">
            Prove a record without
            <br />
            reading it.
          </h1>
          <p className="mx-auto mt-3.5 max-w-[452px] text-[15px] leading-relaxed text-ink-muted">
            Paste a 0G Storage root or a proof receipt. ScribeZero re-checks its
            integrity on-chain. The note stays encrypted and owned by the
            patient.
          </p>
        </header>

        <section className="mt-7 rounded-xl border border-border bg-surface-1 p-4 sm:p-[18px]">
          <Label
            htmlFor="verify-root"
            className="ds-eyebrow mb-2.5 block text-ink-dim"
          >
            0G storage root or proof receipt
          </Label>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify();
            }}
            className="flex flex-col items-stretch gap-2.5 sm:flex-row"
          >
            <Input
              id="verify-root"
              value={root}
              onChange={(e) => {
                setRoot(e.target.value);
                if (phase === "verified") setPhase("idle");
              }}
              spellCheck={false}
              autoComplete="off"
              placeholder="Paste a 0G storage root or proof receipt…"
              className="ds-mono h-[46px] flex-1 bg-surface-3 text-[13px] text-ink"
            />
            <Button
              type="submit"
              variant="live"
              size="lg"
              disabled={checking}
              className="h-[46px] shrink-0 px-[22px]"
            >
              {checking ? (
                <>
                  <Loader2 className="size-[18px] animate-spin" />
                  Verifying…
                </>
              ) : (
                <>
                  <CircleCheck className="size-[18px]" />
                  Verify on 0G
                </>
              )}
            </Button>
          </form>
          <div className="mt-3 flex items-start gap-2 text-[13px] leading-snug text-ink-dim">
            <Info className="mt-px size-3.5 shrink-0" />
            <span>
              Accepts a <span className="ds-mono text-ink-muted">0x…</span>{" "}
              Merkle root or a{" "}
              <span className="ds-mono text-ink-muted">scribe.proof</span>{" "}
              receipt. Nothing you paste is stored.
            </span>
          </div>
        </section>

        {error ? (
          <div className="mt-4 rounded-xl border border-vermillion/40 bg-vermillion/10 p-4 text-sm text-ink">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-vermillion" />
              <div>
                <p className="font-medium text-vermillion">Verification failed</p>
                <p className="mt-1 text-ink-muted">{error}</p>
              </div>
            </div>
          </div>
        ) : null}

        {verified && result ? (
          <VerifyResult
            proof={result.proof}
            integrityTitle={result.integrityTitle}
            integrityDetail={result.integrityDetail}
            noteHash={truncHash(result.noteHash)}
            computeValue={result.computeValue}
            computeSubFacts={result.computeSubFacts}
            publicFacts={result.publicFacts}
            durationMs={result.elapsedMs}
            storageValue={truncHash(root)}
            privacyCopy={result.privacyCopy}
          />
        ) : null}
      </div>
    </AppShell>
  );
}
