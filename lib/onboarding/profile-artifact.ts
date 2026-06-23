import { computeNoteHash } from "../hash";
import {
  buildPracticeProfileArtifact,
  isPracticeProfileArtifact,
  stableStringify,
  type PracticeProfileArtifact,
} from "./practice-profile";

export { buildPracticeProfileArtifact, isPracticeProfileArtifact, type PracticeProfileArtifact };

export function profileArtifactHash(artifact: PracticeProfileArtifact): `0x${string}` {
  return computeNoteHash(stableStringify(artifact));
}
