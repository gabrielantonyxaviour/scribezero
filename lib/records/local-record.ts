import type { ConsultNote, OwnedRecord, VerificationResult } from "@/shared/contract";
import type { ProofMode, ProofReceiptInput } from "@/lib/proof/receipt";

export type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

export type StoredRecordMode = "live";

export type StoredScribeRecord = {
  note: ConsultNote;
  record: OwnedRecord;
  verification: VerificationResult;
  mode: StoredRecordMode;
  shareCode: string;
  proof: ProofReceiptInput;
  computeProof?: {
    provider: string;
    model?: string;
    chatID: string;
    verified: boolean | null;
  };
};

const RECORD_PREFIX = "scribezero:record:";
const SHARE_PREFIX = "scribezero:share:";

function ownerKey(owner: string, noteId: string) {
  return `${RECORD_PREFIX}${owner.toLowerCase()}:${noteId}`;
}

function shareKey(code: string) {
  return `${SHARE_PREFIX}${code.toUpperCase()}`;
}

function readJson<T>(storage: StorageLike, key: string): T | null {
  try {
    const raw = storage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function computeMode(mode: StoredRecordMode, verification: VerificationResult): ProofMode {
  return mode === "live" && verification.proofValid ? "live" : "fallback";
}

function storageMode(mode: StoredRecordMode, verification: VerificationResult): ProofMode {
  return mode === "live" && verification.storageReachable ? "live" : "fallback";
}

export function buildStoredRecord(input: {
  note: ConsultNote;
  record: OwnedRecord;
  verification: VerificationResult;
  mode: StoredRecordMode;
  shareCode: string;
  computeProof?: StoredScribeRecord["computeProof"];
}): StoredScribeRecord {
  return {
    ...input,
    proof: {
      noteHashMatches: input.verification.hashMatches,
      computeProofValid: input.verification.proofValid,
      storageReachable: input.verification.storageReachable,
      computeMode: computeMode(input.mode, input.verification),
      storageMode: storageMode(input.mode, input.verification),
    },
  };
}

export function writeStoredRecord(storage: StorageLike, record: StoredScribeRecord) {
  const payload = JSON.stringify(record);
  storage.setItem(ownerKey(record.record.ownerAddress, record.note.id), payload);
  storage.setItem(shareKey(record.shareCode), payload);
}

export function readStoredRecord(
  storage: StorageLike,
  ownerAddress: string,
  noteId: string,
): StoredScribeRecord | null {
  if (!ownerAddress || !noteId) return null;
  return readJson<StoredScribeRecord>(storage, ownerKey(ownerAddress, noteId));
}

export function readStoredShare(storage: StorageLike, code: string): StoredScribeRecord | null {
  if (!code) return null;
  return readJson<StoredScribeRecord>(storage, shareKey(code));
}

export function getBrowserStorage(): StorageLike | null {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}
