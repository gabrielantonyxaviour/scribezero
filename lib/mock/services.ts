import type {
  ConsultNote,
  NoteGenService,
  OwnedRecord,
  OwnershipService,
  TranscriptionResult,
  VerificationResult,
} from "@/shared/contract";
import {
  DEMO_NOTE,
  DEMO_PROOF,
  DEMO_RECORD,
  DEMO_VERIFICATION,
} from "@/lib/mock/data";
import { OWNER_ADDRESS } from "@/lib/constants";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Mock NoteGenService — stands in for Sarvam STT + the 0G Compute TeeTLS note-gen call.
 * Same shape the real adapter will implement; swap by env presence later.
 */
export const mockNoteGen: NoteGenService = {
  async transcribe(): Promise<TranscriptionResult> {
    await wait(400);
    return DEMO_NOTE.transcript;
  },
  async generateNoteVerifiable(): Promise<{ note: ConsultNote; teeTlsProof: string }> {
    await wait(900);
    return { note: DEMO_NOTE, teeTlsProof: DEMO_PROOF.routingSignature };
  },
};

/** Mock OwnershipService — stands in for 0G Storage upload/download + verify. */
export const mockOwnership: OwnershipService = {
  async store(): Promise<OwnedRecord> {
    await wait(800);
    return DEMO_RECORD;
  },
  async retrieve(): Promise<ConsultNote> {
    await wait(300);
    return DEMO_NOTE;
  },
  async verify(): Promise<VerificationResult> {
    await wait(600);
    return DEMO_VERIFICATION;
  },
};

// ---- Stepped seal orchestration for the /app capture flow ----
export type StepId = "route" | "generate" | "proof" | "persist" | "sealed";
export type StepStatus = "idle" | "active" | "done" | "error";

export interface SealStep {
  id: StepId;
  label: string;
  detail: string;
}

export const SEAL_STEPS: SealStep[] = [
  { id: "route", label: "Routing through 0G TEE", detail: "TeeTLS broker · attested enclave" },
  { id: "generate", label: "Generating note in attested enclave", detail: `${DEMO_PROOF.model} · response stays inside the TEE` },
  { id: "proof", label: "Signed routing proof received", detail: "binds request + response + provider" },
  { id: "persist", label: "Persisting to 0G Storage", detail: "Merkle root · stored with inclusion proof" },
  { id: "sealed", label: "Sealed & owned", detail: `bound to ${OWNER_ADDRESS.slice(0, 6)}…${OWNER_ADDRESS.slice(-4)}` },
];

export interface SealResult {
  note: ConsultNote;
  record: OwnedRecord;
  verification: VerificationResult;
}

/**
 * Runs the full verifiable seal, emitting per-step status as each 0G call resolves.
 * The real build keeps this exact shape — only the service bodies change.
 */
export async function sealConsult(
  onStep: (id: StepId, status: StepStatus, durationMs?: number) => void,
): Promise<SealResult> {
  const durations: Record<StepId, number> = {
    route: 420,
    generate: 1240,
    proof: 360,
    persist: 900,
    sealed: 0,
  };

  for (const step of SEAL_STEPS) {
    if (step.id === "sealed") break;
    onStep(step.id, "active");
    await wait(durations[step.id]);
    onStep(step.id, "done", durations[step.id]);
  }

  const { note } = await mockNoteGen.generateNoteVerifiable(DEMO_NOTE.transcript);
  const record = await mockOwnership.store(note, DEMO_PROOF.routingSignature, OWNER_ADDRESS);
  const verification = await mockOwnership.verify(record);

  onStep("sealed", "done");
  return { note, record, verification };
}
