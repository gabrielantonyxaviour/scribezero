import test from "node:test";
import assert from "node:assert/strict";

import { buildEncryptedPatientArtifact } from "../lib/patients/artifact";
import {
  buildPatientIndexEntry,
  ownerPatientKey,
  ownerPatientPrefix,
} from "../lib/patients/kv-index";

const owner = "0x2376b66ce2bd9dd1f82e5b559b37ffcd747039ec";

test("builds privacy-preserving patient KV index entries", async () => {
  const artifact = await buildEncryptedPatientArtifact({
    ownerAddress: owner,
    now: "2026-06-24T00:00:00.000Z",
    patient: {
      fullName: "Ravi Narayanan",
      birthYear: "1976",
      preferredLanguage: "hi",
      notes: "Chest pain history",
    },
    signMessage: async (message) => `signature:${message}`,
  });
  const entry = buildPatientIndexEntry({
    artifact,
    storageRootHash: "0x8b79424b7ba51af8405877d698b24bdb7cd0094f052df424581503704ca11514",
    storageTxHash: "0xf48c921da09a91767b43ec4d40a75b7025aeb8eb86f1a43b123eacf1d43b6588",
    indexedAt: "2026-06-24T00:00:01.000Z",
  });

  assert.equal(entry.kind, "scribezero.patient-index");
  assert.equal(entry.ownerAddress, owner);
  assert.equal(entry.preferredLanguage, "hi");
  assert.equal(JSON.stringify(entry).includes("Ravi"), false);
  assert.equal(JSON.stringify(entry).includes("Chest pain"), false);
});

test("uses stable owner patient KV keys", () => {
  assert.equal(
    ownerPatientKey(owner.toUpperCase(), "pat_123"),
    `doctor/${owner}/patients/pat_123`,
  );
  assert.equal(ownerPatientPrefix(owner.toUpperCase()), `doctor/${owner}/patients/`);
});
