import assert from "node:assert/strict";
import test from "node:test";

import { buildRecordIndexEntry, ownerRecordKey, shareRecordKey } from "../lib/records/kv-index";
import { buildStoredRecord } from "../lib/records/local-record";
import type { ConsultNote } from "../shared/contract";

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
  summary: "Private clinical summary that must not be indexed",
  transcript: {
    transcript: "Private transcript that must not be indexed",
    provider: "0g-router",
    language: "ta-IN",
    segments: [],
  },
  noteHash: "0x1b8d5b94000000000000000000000000000000000000000000000000000000e6",
};

test("builds a privacy-preserving 0G KV record index entry", () => {
  const stored = buildStoredRecord({
    note,
    record: {
      noteId: note.id,
      noteHash: note.noteHash,
      zgStorageRootHash: "0x7efc0811d57026e13b5c1cfb06777d0da087ce8117243b200d52f8956440a579",
      teeTlsProof: "0g-compute-proof",
      ownerAddress: owner,
      storedAt: "2026-06-23T06:00:00.000Z",
      storageTxHash: "0x8b79424b7ba51af8405877d698b24bdb7cd0094f052df424581503704ca11514",
      chainId: 16602,
      computeProvider: "0g-router",
      computeModel: "glm-5.1",
    },
    verification: {
      noteId: note.id,
      hashMatches: true,
      proofValid: true,
      storageReachable: true,
    },
    mode: "live",
    shareCode: "HX7K2M",
  });

  const entry = buildRecordIndexEntry(stored, "2026-06-23T06:01:00.000Z");
  const serialized = JSON.stringify(entry);

  assert.equal(entry.kind, "scribezero.record-index");
  assert.equal(entry.ownerAddress, owner);
  assert.equal(entry.storageRootHash, stored.record.zgStorageRootHash);
  assert.equal(entry.proof.computeMode, "live");
  assert.equal(serialized.includes(note.summary), false);
  assert.equal(serialized.includes(note.transcript.transcript), false);
});

test("uses stable owner and share keys for 0G KV", () => {
  assert.equal(ownerRecordKey(owner.toUpperCase(), "note_1"), `${ownerRecordKey(owner, "note_1")}`);
  assert.equal(shareRecordKey("hx7k2m"), "share/HX7K2M");
});
