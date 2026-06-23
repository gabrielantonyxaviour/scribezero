import test from "node:test";
import assert from "node:assert/strict";

import {
  buildStoredRecord,
  readStoredRecord,
  readStoredShare,
  writeStoredRecord,
  type StorageLike,
} from "../lib/records/local-record";
import type { ConsultNote } from "../shared/contract";

function memoryStorage(): StorageLike {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => data.set(key, value),
    removeItem: (key: string) => data.delete(key),
  };
}

test("persists a sealed record by owner wallet and share code", () => {
  const storage = memoryStorage();
  const owner = "0x2376b66ce2bd9dd1f82e5b559b37ffcd747039ec";
  const note: ConsultNote = {
    id: "note_sz4827ta",
    consultationCode: "SZ-4827-TA",
    createdAt: "2026-06-23T06:00:00.000Z",
    language: "ta",
    chiefComplaint: "Fever",
    subjective: "Fever for three days",
    objective: "Stable vitals",
    assessment: "Likely viral URI",
    plan: "Rest and fluids",
    summary: "Fever for three days",
    transcript: {
      transcript: "fever",
      provider: "sarvam",
      language: "ta-IN",
      segments: [],
    },
    noteHash: "0x1b8d5b94000000000000000000000000000000000000000000000000000000e6",
  };
  const sealed = buildStoredRecord({
    note,
    record: {
      noteId: note.id,
      noteHash: note.noteHash,
      zgStorageRootHash: "0x7efc0811d57026e13b5c1cfb06777d0da087ce8117243b200d52f8956440a579",
      teeTlsProof: "0g-storage",
      ownerAddress: owner,
      storedAt: "2026-06-23T06:00:00.000Z",
    },
    verification: {
      noteId: note.id,
      hashMatches: true,
      proofValid: false,
      storageReachable: true,
    },
    mode: "live",
    shareCode: "HX7K2M",
  });

  writeStoredRecord(storage, sealed);

  assert.equal(readStoredRecord(storage, owner, note.id)?.record.ownerAddress, owner);
  assert.equal(readStoredRecord(storage, owner.toUpperCase(), note.id)?.record.zgStorageRootHash, sealed.record.zgStorageRootHash);
  assert.equal(readStoredShare(storage, "HX7K2M")?.record.ownerAddress, owner);
  assert.equal(readStoredShare(storage, "hx7k2m")?.proof.computeMode, "fallback");
});
