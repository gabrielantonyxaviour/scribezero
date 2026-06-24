import test from "node:test";
import assert from "node:assert/strict";

import {
  buildEncryptedDocumentArtifact,
  computeDocumentHash,
  isEncryptedDocumentArtifact,
} from "../lib/documents/artifact";
import type { GeneratedClinicalDocument } from "../lib/documents/generation";

const owner = "0x2376b66ce2bd9dd1f82e5b559b37ffcd747039ec";

const document: GeneratedClinicalDocument = {
  title: "Fever certificate for Live 0G Patient",
  type: "medical_certificate",
  patientId: "pat_507b26327be9",
  language: "en",
  body: "Live 0G Patient was advised rest after fever.",
  sections: [{ heading: "Advice", text: "Rest for two days." }],
  cautions: ["Review before issue."],
};

test("builds encrypted document artifacts with proof-only public metadata", async () => {
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

  assert.equal(isEncryptedDocumentArtifact(artifact), true);
  assert.equal(artifact.public.title, "Medical certificate");
  assert.equal(artifact.public.documentHash, computeDocumentHash(document));
  const publicJson = JSON.stringify({ public: artifact.public, encryption: artifact.encryption });
  assert.equal(publicJson.includes("Live 0G Patient"), false);
  assert.equal(publicJson.includes("fever"), false);
});

test("rejects document artifacts without verified 0G Compute proof", async () => {
  await assert.rejects(
    buildEncryptedDocumentArtifact({
      ownerAddress: owner,
      document,
      computeProof: {
        provider: "0g-router",
        model: "glm-5.1",
        chatID: "zg-doc-proof",
        verified: false,
      } as never,
      signMessage: async (message) => `signature:${message}`,
    }),
    /0G Compute proof/,
  );
});
