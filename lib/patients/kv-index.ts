import { getKvJson, listKvJson, putKvJsonEntries, type KvWriteReceipt } from "../0g/kv";
import type { EncryptedPatientArtifact } from "./artifact";

export type PatientIndexEntry = {
  kind: "scribezero.patient-index";
  version: 1;
  ownerAddress: string;
  patientId: string;
  createdAt: string;
  preferredLanguage: string;
  patientCommitment: `0x${string}`;
  storageRootHash: string;
  storageTxHash?: string;
  ciphertextHash: `0x${string}`;
  chainId: 16602;
  indexedAt: string;
};

export type PatientIndexReceipt = {
  streamId: `0x${string}`;
  txHash: string;
  keys: string[];
};

export function ownerPatientKey(ownerAddress: string, patientId: string) {
  return `doctor/${ownerAddress.toLowerCase()}/patients/${patientId}`;
}

export function ownerPatientPrefix(ownerAddress: string) {
  return `doctor/${ownerAddress.toLowerCase()}/patients/`;
}

export function buildPatientIndexEntry(input: {
  artifact: EncryptedPatientArtifact;
  storageRootHash: string;
  storageTxHash?: string;
  indexedAt?: string;
}): PatientIndexEntry {
  return {
    kind: "scribezero.patient-index",
    version: 1,
    ownerAddress: input.artifact.public.ownerAddress,
    patientId: input.artifact.public.patientId,
    createdAt: input.artifact.public.createdAt,
    preferredLanguage: input.artifact.public.preferredLanguage,
    patientCommitment: input.artifact.public.patientCommitment,
    storageRootHash: input.storageRootHash,
    storageTxHash: input.storageTxHash,
    ciphertextHash: input.artifact.encryption.ciphertextHash,
    chainId: 16602,
    indexedAt: input.indexedAt ?? new Date().toISOString(),
  };
}

export async function indexPatientArtifact(input: {
  artifact: EncryptedPatientArtifact;
  storageRootHash: string;
  storageTxHash?: string;
}): Promise<PatientIndexReceipt> {
  const entry = buildPatientIndexEntry(input);
  const receipt = await putKvJsonEntries([
    { key: ownerPatientKey(entry.ownerAddress, entry.patientId), value: entry },
  ]);
  return mergeReceipts([receipt]);
}

export async function readPatientIndex(ownerAddress: string, patientId: string) {
  if (!ownerAddress || !patientId) return null;
  return getKvJson<PatientIndexEntry>(ownerPatientKey(ownerAddress, patientId));
}

export async function listPatientIndex(ownerAddress: string) {
  if (!ownerAddress) return [];
  const rows = await listKvJson<PatientIndexEntry>(ownerPatientPrefix(ownerAddress), 100);
  return rows.map((row) => row.value);
}

function mergeReceipts(receipts: KvWriteReceipt[]): PatientIndexReceipt {
  return {
    streamId: receipts[0].streamId,
    txHash: receipts.map((receipt) => receipt.txHash).filter(Boolean).join(","),
    keys: receipts.flatMap((receipt) => receipt.keys || [receipt.key]),
  };
}
