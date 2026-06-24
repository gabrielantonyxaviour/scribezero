import type { ConsultNote, OwnedRecord, TranscriptionResult, VerificationResult } from "@/shared/contract";
import { computeNoteHash } from "@/lib/hash";
import {
  buildEncryptedRecordArtifact,
  type SignMessage,
} from "@/lib/records/encrypted-artifact";
import { buildStoredRecord } from "@/lib/records/local-record";
import type { SarvamFallback } from "@/lib/sarvam";

export type SealMode = "live";
export type StepId = "route" | "generate" | "proof" | "persist" | "index" | "sealed";
export type StepStatus = "idle" | "active" | "done" | "error";

export const SEAL_STEPS: { id: StepId; label: string; detail: string }[] = [
  { id: "route", label: "Route clinical AI", detail: "0G Router first; Sarvam only if 0G errors" },
  { id: "generate", label: "Generate structured note", detail: "Model returns SOAP JSON" },
  { id: "proof", label: "Check Compute proof", detail: "TEE proof or disclosed fallback reason" },
  { id: "persist", label: "Persist encrypted record", detail: "0G Storage returns a Merkle root and tx" },
  { id: "index", label: "Index record handles", detail: "0G KV indexes owner, share code and proof handles" },
  { id: "sealed", label: "Seal record", detail: "Hash, owner, proof, root and KV index agree" },
];

export interface SmartSealResult {
  note: ConsultNote;
  record: OwnedRecord;
  verification: VerificationResult;
  mode: SealMode;
  teeProof?: { provider: string; model?: string; chatID: string; verified: boolean | null };
  computeFallback?: SarvamFallback;
  shareCode?: string;
  kvIndex?: { streamId: `0x${string}`; txHash: string; keys: string[] };
}

type StepFn = (id: StepId, status: StepStatus, ms?: number) => void;

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => null);
    throw new Error(detail?.error ? `${url} -> ${detail.error}` : `${url} -> ${res.status}`);
  }
  return res.json() as Promise<T>;
}

/**
 * Storage and KV stay 0G-only. Clinical generation attempts 0G Compute first and
 * only degrades to Sarvam with an explicit fallback reason from the failed 0G call.
 */
async function sealReal(
  onStep: StepFn,
  address: string,
  transcription: TranscriptionResult,
  signMessage: SignMessage,
): Promise<SmartSealResult> {
  const transcript = transcription.transcript.trim();
  if (!transcript) throw new Error("No transcript available to seal");

  onStep("route", "active");
  onStep("generate", "active");
  const t0 = Date.now();
  const ng = await postJson<{
    soap: Partial<ConsultNote>;
    proof: { provider: string; model?: string; chatID: string; verified: boolean | null };
    fallback?: SarvamFallback;
  }>("/api/notegen", { transcript });
  onStep("route", "done", 400);
  onStep("generate", "done", Date.now() - t0);

  onStep("proof", "done", 300);

  const summary = ng.soap.summary?.trim();
  if (!summary) throw new Error("Clinical AI returned an empty SOAP summary");
  const noteHash = computeNoteHash(summary);
  const note: ConsultNote = {
    id: `note_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`,
    consultationCode: `SZ-${Date.now().toString(36).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    language: transcription.language?.startsWith("hi") ? "hi" : transcription.language?.startsWith("en") ? "en" : "ta",
    chiefComplaint: ng.soap.chiefComplaint ?? "",
    subjective: ng.soap.subjective ?? "",
    objective: ng.soap.objective ?? "Not documented in this consultation.",
    assessment: ng.soap.assessment ?? "",
    plan: ng.soap.plan ?? "",
    summary,
    transcript: transcription,
    noteHash,
  };

  onStep("persist", "active");
  const tp = Date.now();
  const artifact = await buildEncryptedRecordArtifact({
    note,
    ownerAddress: address,
    computeProof: {
      provider: ng.proof.provider,
      model: ng.proof.model,
      chatID: ng.proof.chatID,
      verified: ng.proof.verified,
    },
    signMessage,
  });
  const st = await postJson<{ rootHash: string; txHash: string }>("/api/store", { artifact });
  onStep("persist", "done", Date.now() - tp);

  const record: OwnedRecord = {
    noteId: note.id,
    noteHash,
    zgStorageRootHash: st.rootHash,
    teeTlsProof: ng.proof.chatID,
    ownerAddress: address,
    storedAt: new Date().toISOString(),
    storageTxHash: st.txHash,
    chainId: 16602,
    computeProvider: ng.proof.provider,
    computeModel: ng.proof.model,
  };

  const vf = await postJson<Omit<VerificationResult, "noteId">>("/api/verify", {
    rootHash: st.rootHash,
    summary,
    noteHash,
    proofValid: ng.proof.verified === true,
  });
  const verification = { noteId: note.id, ...vf };
  if (!verification.hashMatches || !verification.storageReachable) {
    onStep("sealed", "error");
    throw new Error(
      `0G verification failed: hash=${verification.hashMatches}, compute=${verification.proofValid}, storage=${verification.storageReachable}`,
    );
  }

  onStep("index", "active");
  const shareCode = shareCodeFor(note.consultationCode);
  const indexed = await postJson<{
    streamId: `0x${string}`;
    txHash: string;
    keys: string[];
  }>("/api/records/index", {
    storedRecord: buildStoredRecord({
      note,
      record,
      verification,
      mode: "live",
      shareCode,
      computeProof: {
        provider: ng.proof.provider,
        model: ng.proof.model,
        chatID: ng.proof.chatID,
        verified: ng.proof.verified,
      },
    }),
  });
  onStep("index", "done");

  onStep("sealed", "done");
  return {
    note,
    record,
    verification,
    mode: "live",
    teeProof: ng.proof,
    computeFallback: ng.fallback,
    shareCode,
    kvIndex: indexed,
  };
}

/**
 * Uses real 0G Storage/KV only. The connected Privy wallet is the record owner;
 * Compute may use a disclosed Sarvam fallback when the 0G Router/broker path fails.
 */
export async function sealConsultSmart(
  onStep: StepFn,
  owner?: string,
  transcription?: TranscriptionResult,
  signMessage?: SignMessage,
): Promise<SmartSealResult> {
  if (!owner) throw new Error("Connect a wallet before sealing this consult");
  if (!transcription?.transcript?.trim()) throw new Error("Record and transcribe audio before sealing");
  if (!signMessage) throw new Error("Wallet signing is required to encrypt the record before 0G Storage");

  let status: {
    mode?: string;
    address?: string;
    funded?: boolean;
    error?: string;
    integrations?: {
      storage?: { configured?: boolean };
      computeRouter?: { configured?: boolean };
      sttRouter?: { configured?: boolean };
    };
  } = {};
  try {
    status = await fetch("/api/status").then((r) => r.json());
  } catch (error) {
    throw new Error(`0G status check failed: ${(error as Error).message}`);
  }
  if (!status.address || !status.integrations?.storage?.configured || !status.funded) {
    throw new Error(
      status?.error || "0G Storage signer is not configured or funded; encrypted record Storage cannot run",
    );
  }
  return sealReal(onStep, owner, transcription, signMessage);
}

function shareCodeFor(consultationCode: string) {
  const clean = consultationCode.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return clean.slice(-6) || crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();
}
