import test from "node:test";
import assert from "node:assert/strict";

import {
  hasCompleteDoctorProfileReceipt,
  type DoctorProfileCompletionCandidate,
} from "../lib/onboarding/profile-status";

const baseProfile: DoctorProfileCompletionCandidate = {
  name: "Dr. Asha Kumar",
  clinic: "ScribeZero Test Clinic",
  city: "Chennai",
  specialty: "General practice",
  languages: ["Tamil", "Hindi", "English"],
  motivation: "Reduce after-hours note writing",
  degrees: "MBBS",
  registrationNumber: "TNMC 1032",
  registrationCouncil: "Tamil Nadu Medical Council",
  sampleConsultReviewed: true,
};

test("requires live 0G Storage and registry metadata before onboarding is done", () => {
  assert.equal(hasCompleteDoctorProfileReceipt(baseProfile), false);
  assert.equal(
    hasCompleteDoctorProfileReceipt({
      ...baseProfile,
      profileRootHash: `0x${"11".repeat(32)}`,
      profileTxHash: `0x${"22".repeat(32)}`,
      profileArtifactHash: `0x${"33".repeat(32)}`,
      profileStoredAt: "2026-06-25T00:00:00.000Z",
      profileStorageMode: "live",
      profileRegistryAddress: "0x1234567890123456789012345678901234567890",
      profileRegistryTxHash: `0x${"44".repeat(32)}`,
      profileRegistryBlockNumber: 40461428,
    }),
    true,
  );
});
