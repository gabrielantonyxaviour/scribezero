import type { StoredScribeRecord } from "./local-record";
import { getKvJson, listKvJson, putKvJsonEntries, type KvWriteReceipt } from "../0g/kv";

export type RecordIndexEntry = {
  kind: "scribezero.record-index";
  version: 1;
  ownerAddress: string;
  noteId: string;
  consultationCode: string;
  language: string;
  createdAt: string;
  storedAt: string;
  shareCode: string;
  noteHash: `0x${string}`;
  storageRootHash: string;
  storageTxHash?: string;
  teeTlsProof: string;
  chainId?: number;
  computeProvider?: string;
  computeModel?: string;
  proof: StoredScribeRecord["proof"];
  indexedAt: string;
};

export type RecordIndexReceipt = {
  streamId: `0x${string}`;
  txHash: string;
  keys: string[];
};

export function buildRecordIndexEntry(
  stored: StoredScribeRecord,
  indexedAt = new Date().toISOString(),
): RecordIndexEntry {
  return {
    kind: "scribezero.record-index",
    version: 1,
    ownerAddress: stored.record.ownerAddress,
    noteId: stored.note.id,
    consultationCode: stored.note.consultationCode,
    language: stored.note.language,
    createdAt: stored.note.createdAt,
    storedAt: stored.record.storedAt,
    shareCode: stored.shareCode,
    noteHash: stored.record.noteHash,
    storageRootHash: stored.record.zgStorageRootHash,
    storageTxHash: stored.record.storageTxHash,
    teeTlsProof: stored.record.teeTlsProof,
    chainId: stored.record.chainId,
    computeProvider: stored.record.computeProvider,
    computeModel: stored.record.computeModel,
    proof: stored.proof,
    indexedAt,
  };
}

export function ownerRecordKey(ownerAddress: string, noteId: string) {
  return `doctor/${ownerAddress.toLowerCase()}/records/${noteId}`;
}

export function ownerRecordPrefix(ownerAddress: string) {
  return `doctor/${ownerAddress.toLowerCase()}/records/`;
}

export function shareRecordKey(shareCode: string) {
  return `share/${shareCode.toUpperCase()}`;
}

export async function indexStoredRecord(stored: StoredScribeRecord): Promise<RecordIndexReceipt> {
  const entry = buildRecordIndexEntry(stored);
  const ownerKey = ownerRecordKey(entry.ownerAddress, entry.noteId);
  const shareKey = shareRecordKey(entry.shareCode);
  const receipt = await putKvJsonEntries([
    { key: ownerKey, value: entry },
    { key: shareKey, value: entry },
  ]);
  return mergeReceipts([receipt]);
}

export async function readRecordIndex(
  ownerAddress: string,
  noteId: string,
): Promise<RecordIndexEntry | null> {
  if (!ownerAddress || !noteId) return null;
  return getKvJson<RecordIndexEntry>(ownerRecordKey(ownerAddress, noteId));
}

export async function readShareIndex(shareCode: string): Promise<RecordIndexEntry | null> {
  if (!shareCode) return null;
  return getKvJson<RecordIndexEntry>(shareRecordKey(shareCode));
}

export async function listRecordIndex(ownerAddress: string): Promise<RecordIndexEntry[]> {
  if (!ownerAddress) return [];
  const rows = await listKvJson<RecordIndexEntry>(ownerRecordPrefix(ownerAddress), 100);
  return rows.map((row) => row.value);
}

function mergeReceipts(receipts: KvWriteReceipt[]): RecordIndexReceipt {
  return {
    streamId: receipts[0].streamId,
    txHash: receipts.map((receipt) => receipt.txHash).filter(Boolean).join(","),
    keys: receipts.flatMap((receipt) => receipt.keys || [receipt.key]),
  };
}
