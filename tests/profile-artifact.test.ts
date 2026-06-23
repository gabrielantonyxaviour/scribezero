import test from "node:test";
import assert from "node:assert/strict";
import {
  buildPracticeProfileArtifact,
  isPracticeProfileArtifact,
  stableStringify,
  type PracticeProfileInput,
} from "../lib/onboarding/practice-profile";

const profile: PracticeProfileInput = {
  name: "Dr. Ananya Rao",
  clinic: "Rao Family Clinic",
  city: "Chennai",
  specialty: "General practice",
  languages: ["Tamil", "Hindi", "English"],
  motivation: "Give patients a record they can verify",
  degrees: "MBBS, DNB Family Medicine",
  registrationNumber: "TNMC 84217",
  registrationCouncil: "Tamil Nadu Medical Council",
  sampleConsultReviewed: true,
};

const owner = "0x7a4f3c8e9b2d1a6f5e4c3b2a1908f7e6d5c4e3f2";
const createdAt = "2026-06-23T00:00:00.000Z";

test("builds a 0G-bound PracticeProfile artifact from the doctor profile", () => {
  const artifact = buildPracticeProfileArtifact(profile, owner, createdAt);

  assert.equal(artifact.kind, "scribezero.practice-profile");
  assert.equal(artifact.ownerAddress, owner);
  assert.equal(artifact.createdAt, createdAt);
  assert.equal(artifact.doctor.registrationCouncil, "Tamil Nadu Medical Council");
  assert.deepEqual(artifact.practice.languages, ["Tamil", "Hindi", "English"]);
  assert.equal(artifact.demo.noteGeneration, "0g-compute-teetls");
  assert.equal(artifact.demo.storage, "0g-storage");
});

test("accepts only complete PracticeProfile artifacts with a valid owner wallet", () => {
  const artifact = buildPracticeProfileArtifact(profile, owner, createdAt);

  assert.equal(isPracticeProfileArtifact(artifact), true);
  assert.equal(isPracticeProfileArtifact({ ...artifact, ownerAddress: "not-a-wallet" }), false);
  assert.equal(
    isPracticeProfileArtifact({
      ...artifact,
      practice: { ...artifact.practice, languages: [] },
    }),
    false,
  );
});

test("serializes equivalent PracticeProfile artifacts deterministically", () => {
  const first = buildPracticeProfileArtifact(profile, owner, createdAt);
  const second = {
    ...first,
    practice: {
      motivation: first.practice.motivation,
      languages: first.practice.languages,
      city: first.practice.city,
      clinic: first.practice.clinic,
    },
  };

  assert.equal(stableStringify(first), stableStringify(second));
});
