import test from "node:test";
import assert from "node:assert/strict";

import {
  buildEncryptedPatientArtifact,
  isEncryptedPatientArtifact,
  validatePatientProfile,
} from "../lib/patients/artifact";

const owner = "0x2376b66ce2bd9dd1f82e5b559b37ffcd747039ec";

test("builds an encrypted patient artifact without public PHI", async () => {
  const artifact = await buildEncryptedPatientArtifact({
    ownerAddress: owner,
    now: "2026-06-24T00:00:00.000Z",
    patient: {
      fullName: "Meera Krishnan",
      birthYear: "1988",
      phone: "+91 90000 00000",
      preferredLanguage: "ta",
      notes: "Diabetes follow up",
    },
    signMessage: async (message) => `signature:${message}`,
  });

  assert.equal(isEncryptedPatientArtifact(artifact), true);
  assert.equal(artifact.public.ownerAddress, owner);
  assert.equal(artifact.public.preferredLanguage, "ta");
  const publicJson = JSON.stringify({ public: artifact.public, encryption: artifact.encryption });
  assert.equal(publicJson.includes("Meera"), false);
  assert.equal(publicJson.includes("Diabetes"), false);
});

test("validates patient profile boundaries", () => {
  assert.throws(
    () => validatePatientProfile({ fullName: "", birthYear: "1988", preferredLanguage: "en" }),
    /Patient name/,
  );
  assert.throws(
    () => validatePatientProfile({ fullName: "Asha", birthYear: "88", preferredLanguage: "en" }),
    /Birth year/,
  );
});
