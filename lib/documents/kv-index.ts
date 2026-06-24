import { getKvJson, listKvJson, putKvJsonEntries, type KvWriteReceipt } from "../0g/kv";
import type { EncryptedDocumentArtifact } from "./artifact";

export type DocumentIndexEntry = {
  kind: "scribezero.document-index";
  version: 1;
  ownerAddress: string;
  patientId: string;
  documentId: string;
  type: string;
  title: string;
  language: string;
  createdAt: string;
  documentHash: `0x${string}`;
  storageRootHash: string;
  storageTxHash?: string;
  ciphertextHash: `0x${string}`;
  computeProvider: string;
  computeModel?: string;
  computeProof: string;
  computeProofValid: boolean;
  chainId: 16602;
  indexedAt: string;
};

export type DocumentIndexReceipt = {
  streamId: `0x${string}`;
  txHash: string;
  keys: string[];
};

export function ownerDocumentKey(ownerAddress: string, documentId: string) {
  return `doctor/${ownerAddress.toLowerCase()}/documents/${documentId}`;
}

export function ownerDocumentPrefix(ownerAddress: string) {
  return `doctor/${ownerAddress.toLowerCase()}/documents/`;
}

export function patientDocumentKey(ownerAddress: string, patientId: string, documentId: string) {
  return `doctor/${ownerAddress.toLowerCase()}/patients/${patientId}/documents/${documentId}`;
}

export function patientDocumentPrefix(ownerAddress: string, patientId: string) {
  return `doctor/${ownerAddress.toLowerCase()}/patients/${patientId}/documents/`;
}

export function buildDocumentIndexEntry(input: {
  artifact: EncryptedDocumentArtifact;
  storageRootHash: string;
  storageTxHash?: string;
  indexedAt?: string;
}): DocumentIndexEntry {
  return {
    kind: "scribezero.document-index",
    version: 1,
    ownerAddress: input.artifact.public.ownerAddress,
    patientId: input.artifact.public.patientId,
    documentId: input.artifact.public.documentId,
    type: input.artifact.public.type,
    title: input.artifact.public.title,
    language: input.artifact.public.language,
    createdAt: input.artifact.public.createdAt,
    documentHash: input.artifact.public.documentHash,
    storageRootHash: input.storageRootHash,
    storageTxHash: input.storageTxHash,
    ciphertextHash: input.artifact.encryption.ciphertextHash,
    computeProvider: input.artifact.public.computeProof.provider,
    computeModel: input.artifact.public.computeProof.model,
    computeProof: input.artifact.public.computeProof.chatID,
    computeProofValid: input.artifact.public.computeProof.verified === true,
    chainId: 16602,
    indexedAt: input.indexedAt ?? new Date().toISOString(),
  };
}

export async function indexDocumentArtifact(input: {
  artifact: EncryptedDocumentArtifact;
  storageRootHash: string;
  storageTxHash?: string;
}): Promise<DocumentIndexReceipt> {
  const entry = buildDocumentIndexEntry(input);
  const receipt = await putKvJsonEntries([
    { key: ownerDocumentKey(entry.ownerAddress, entry.documentId), value: entry },
    { key: patientDocumentKey(entry.ownerAddress, entry.patientId, entry.documentId), value: entry },
  ]);
  return mergeReceipts([receipt]);
}

export async function readDocumentIndex(ownerAddress: string, documentId: string) {
  if (!ownerAddress || !documentId) return null;
  return getKvJson<DocumentIndexEntry>(ownerDocumentKey(ownerAddress, documentId));
}

export async function listDocumentIndex(ownerAddress: string, patientId?: string) {
  if (!ownerAddress) return [];
  const prefix = patientId
    ? patientDocumentPrefix(ownerAddress, patientId)
    : ownerDocumentPrefix(ownerAddress);
  const rows = await listKvJson<DocumentIndexEntry>(prefix, 100);
  return rows.map((row) => row.value);
}

function mergeReceipts(receipts: KvWriteReceipt[]): DocumentIndexReceipt {
  return {
    streamId: receipts[0].streamId,
    txHash: receipts.map((receipt) => receipt.txHash).filter(Boolean).join(","),
    keys: receipts.flatMap((receipt) => receipt.keys || [receipt.key]),
  };
}
