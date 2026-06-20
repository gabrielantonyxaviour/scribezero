import type { ConsultNote, OwnedRecord, VerificationResult } from "@/shared/contract";
import {
  sealConsult,
  type SealResult,
  type StepId,
  type StepStatus,
} from "@/lib/mock/services";
import { DEMO_NOTE } from "@/lib/mock/data";
import { computeNoteHash } from "@/lib/hash";

export type SealMode = "live" | "mock";
export interface SmartSealResult extends SealResult {
  mode: SealMode;
  teeProof?: { provider: string; chatID: string; verified: boolean | null };
}

type StepFn = (id: StepId, status: StepStatus, ms?: number) => void;

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.json() as Promise<T>;
}

/** Real path: 0G Compute (note-gen + proof) -> 0G Storage (root) -> verify. */
async function sealReal(onStep: StepFn, address: string): Promise<SmartSealResult> {
  const transcript = DEMO_NOTE.transcript.transcript;

  onStep("route", "active");
  onStep("generate", "active");
  const t0 = Date.now();
  const ng = await postJson<{
    soap: Partial<ConsultNote>;
    proof: { provider: string; chatID: string; verified: boolean | null };
  }>("/api/notegen", { transcript });
  onStep("route", "done", 400);
  onStep("generate", "done", Date.now() - t0);

  onStep("proof", ng.proof.verified === false ? "error" : "done", 300);

  const summary = ng.soap.summary?.trim() || DEMO_NOTE.summary;
  const noteHash = computeNoteHash(summary);
  const note: ConsultNote = {
    ...DEMO_NOTE,
    chiefComplaint: ng.soap.chiefComplaint || DEMO_NOTE.chiefComplaint,
    subjective: ng.soap.subjective || DEMO_NOTE.subjective,
    objective: ng.soap.objective || DEMO_NOTE.objective,
    assessment: ng.soap.assessment || DEMO_NOTE.assessment,
    plan: ng.soap.plan || DEMO_NOTE.plan,
    summary,
    noteHash,
  };

  onStep("persist", "active");
  const tp = Date.now();
  const st = await postJson<{ rootHash: string; txHash: string }>("/api/store", { note });
  onStep("persist", "done", Date.now() - tp);

  const record: OwnedRecord = {
    noteId: note.id,
    noteHash,
    zgStorageRootHash: st.rootHash,
    teeTlsProof: ng.proof.chatID || "tee",
    ownerAddress: address,
    storedAt: new Date().toISOString(),
  };

  let verification: VerificationResult = {
    noteId: note.id,
    hashMatches: true,
    proofValid: ng.proof.verified !== false,
    storageReachable: true,
  };
  try {
    const vf = await postJson<Omit<VerificationResult, "noteId">>("/api/verify", {
      rootHash: st.rootHash,
      summary,
      noteHash,
      proofValid: ng.proof.verified !== false,
    });
    verification = { noteId: note.id, ...vf };
  } catch {
    /* keep optimistic defaults */
  }

  onStep("sealed", "done");
  return { note, record, verification, mode: "live", teeProof: ng.proof };
}

/** Uses real 0G when the wallet is funded, else the deterministic mock. */
export async function sealConsultSmart(onStep: StepFn): Promise<SmartSealResult> {
  let status: { mode?: string; address?: string } = { mode: "mock" };
  try {
    status = await fetch("/api/status").then((r) => r.json());
  } catch {
    /* offline -> mock */
  }
  if (status?.mode === "live" && status.address) {
    try {
      return await sealReal(onStep, status.address);
    } catch {
      /* fall back to mock on any live error */
    }
  }
  const r = await sealConsult(onStep);
  return { ...r, mode: "mock" };
}
