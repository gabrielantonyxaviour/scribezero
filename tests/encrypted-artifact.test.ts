import test from "node:test";
import assert from "node:assert/strict";

import {
  buildEncryptedRecordArtifact,
  ciphertextHash,
  isEncryptedRecordArtifact,
} from "../lib/records/encrypted-artifact";
import type { ConsultNote } from "../shared/contract";

const note: ConsultNote = {
  id: "note_live_001",
  consultationCode: "SZ-LIVE-001",
  createdAt: "2026-06-24T06:00:00.000Z",
  language: "ta",
  chiefComplaint: "Fever",
  subjective: "Fever for three days",
  objective: "Stable vitals",
  assessment: "Likely viral URI",
  plan: "Rest and fluids",
  summary: "Fever for three days",
  transcript: {
    transcript: "Patient reports fever for three days.",
    provider: "0g-router",
    language: "ta",
    proofId: "zg-res-123",
    proofVerified: true,
    segments: [],
  },
  noteHash: "0x1b8d5b94000000000000000000000000000000000000000000000000000000e6",
};

test("builds an encrypted 0G record artifact with proof-only public metadata", async () => {
  const artifact = await buildEncryptedRecordArtifact({
    note,
    ownerAddress: "0x2376b66ce2bd9dd1f82e5b559b37ffcd747039ec",
    computeProof: {
      provider: "0x0000000000000000000000000000000000000001",
      model: "glm-5.1",
      chatID: "zg-compute-123",
      verified: true,
    },
    signMessage: async (message) => `0xsigned-${message.length}`,
  });

  assert.equal(artifact.schema, "scribezero.encrypted-record.v1");
  assert.equal(artifact.public.noteId, note.id);
  assert.equal(artifact.public.noteHash, note.noteHash);
  assert.equal(artifact.public.computeProof.verified, true);
  assert.equal(artifact.public.sttProof?.verified, true);
  assert.equal(artifact.ciphertext.includes(note.summary), false);
  assert.equal(ciphertextHash(artifact.ciphertext), artifact.encryption.ciphertextHash);
  assert.equal(isEncryptedRecordArtifact(artifact), true);
});
