import test from "node:test";
import assert from "node:assert/strict";

import { buildEncryptedDocumentArtifact } from "../lib/documents/artifact";
import {
  buildDocumentIndexEntry,
  ownerDocumentKey,
  ownerDocumentPrefix,
  patientDocumentKey,
  patientDocumentPrefix,
} from "../lib/documents/kv-index";
import type { GeneratedClinicalDocument } from "../lib/documents/generation";

const owner = "0x2376b66ce2bd9dd1f82e5b559b37ffcd747039ec";
const patientId = "pat_507b26327be9";

const document: GeneratedClinicalDocument = {
  title: "Referral for chest pain",
  type: "referral_letter",
  patientId,
  language: "en",
  body: "Patient reports chest pain and needs cardiology review.",
  sections: [{ heading: "Reason", text: "Cardiology review." }],
  cautions: [],
};

test("builds privacy-preserving document KV index entries", async () => {
  const artifact = await buildEncryptedDocumentArtifact({
    ownerAddress: owner,
    document,
    now: "2026-06-24T00:00:00.000Z",
    computeProof: {
      provider: "0g-router",
      model: "glm-5.1",
      chatID: "zg-doc-proof",
      verified: true,
    },
    signMessage: async (message) => `signature:${message}`,
  });
  const entry = buildDocumentIndexEntry({
    artifact,
    storageRootHash: "0x3b96e18c73cbb250d9c4e96f8299401c8f7eaf8cd703d9570e1420d158a38002",
    storageTxHash: "0xebe99cd0672cf772e63da24dbbccf209dcb451037dd877d9792efd4da6b9553c",
    indexedAt: "2026-06-24T00:00:01.000Z",
  });

  assert.equal(entry.kind, "scribezero.document-index");
  assert.equal(entry.computeProofValid, true);
  assert.equal(entry.title, "Referral letter");
  assert.equal(JSON.stringify(entry).includes("chest pain"), false);
  assert.equal(JSON.stringify(entry).includes("Cardiology"), false);
});

test("uses stable document KV keys", () => {
  assert.equal(ownerDocumentPrefix(owner.toUpperCase()), `doctor/${owner}/documents/`);
  assert.equal(
    ownerDocumentKey(owner.toUpperCase(), "doc_123"),
    `doctor/${owner}/documents/doc_123`,
  );
  assert.equal(
    patientDocumentPrefix(owner.toUpperCase(), patientId),
    `doctor/${owner}/patients/${patientId}/documents/`,
  );
  assert.equal(
    patientDocumentKey(owner.toUpperCase(), patientId, "doc_123"),
    `doctor/${owner}/patients/${patientId}/documents/doc_123`,
  );
});
