import test from "node:test";
import assert from "node:assert/strict";

import { buildRecordExportBundle } from "../lib/records/export-bundle";
import type { ConsultNote } from "../shared/contract";

test("builds a portable record proof export bundle", () => {
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
  const root = "0x7efc0811d57026e13b5c1cfb06777d0da087ce8117243b200d52f8956440a579";
  const bundle = buildRecordExportBundle({
    note,
    record: {
      noteId: note.id,
      noteHash: note.noteHash,
      zgStorageRootHash: root,
      teeTlsProof: "0g-storage",
      ownerAddress: "0x2376b66ce2bd9dd1f82e5b559b37ffcd747039ec",
      storedAt: "2026-06-23T06:00:00.000Z",
    },
    verification: {
      noteId: note.id,
      hashMatches: true,
      proofValid: false,
      storageReachable: true,
    },
    proof: {
      noteHashMatches: true,
      computeProofValid: false,
      storageReachable: true,
      computeMode: "fallback",
      storageMode: "live",
    },
    shareCode: "HX7K2M",
    origin: "http://localhost:3025/",
    exportedAt: "2026-06-23T07:00:00.000Z",
  });

  assert.equal(bundle.schema, "scribezero.record.export.v1");
  assert.equal(bundle.shareCode, "HX7K2M");
  assert.equal(bundle.publicVerifyUrl, `http://localhost:3025/verify?root=${root}`);
  assert.equal(bundle.storageDownloadUrl, `https://indexer-storage-testnet-turbo.0g.ai/file?root=${root}`);
  assert.equal(bundle.verification.storageReachable, true);
});
