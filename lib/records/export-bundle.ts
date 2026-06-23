import type { ConsultNote, OwnedRecord, VerificationResult } from "@/shared/contract";
import type { ProofReceiptInput } from "@/lib/proof/receipt";
import type { StoredScribeRecord } from "@/lib/records/local-record";
import { NETWORK } from "../constants";

export type RecordExportBundle = {
  schema: "scribezero.record.export.v1";
  exportedAt: string;
  network: typeof NETWORK;
  shareCode: string;
  publicVerifyUrl: string;
  storageDownloadUrl: string;
  note: ConsultNote;
  record: OwnedRecord;
  verification: VerificationResult;
  proof: ProofReceiptInput;
  computeProof?: StoredScribeRecord["computeProof"];
};

export function buildRecordExportBundle(input: {
  note: ConsultNote;
  record: OwnedRecord;
  verification: VerificationResult;
  proof: ProofReceiptInput;
  computeProof?: StoredScribeRecord["computeProof"];
  shareCode: string;
  origin?: string;
  exportedAt?: string;
}): RecordExportBundle {
  const origin = input.origin?.replace(/\/$/, "") ?? "";
  const root = encodeURIComponent(input.record.zgStorageRootHash);

  return {
    schema: "scribezero.record.export.v1",
    exportedAt: input.exportedAt ?? new Date().toISOString(),
    network: NETWORK,
    shareCode: input.shareCode,
    publicVerifyUrl: `${origin}/verify?root=${root}`,
    storageDownloadUrl: `${NETWORK.indexer}/file?root=${root}`,
    note: input.note,
    record: input.record,
    verification: input.verification,
    proof: input.proof,
    computeProof: input.computeProof,
  };
}
