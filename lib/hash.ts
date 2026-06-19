import { keccak256, toBytes } from "viem";

/**
 * Canonical note hash — keccak256 of the human-readable summary.
 * This is what gets anchored alongside the 0G Storage root and re-checked on verify.
 */
export function computeNoteHash(summary: string): `0x${string}` {
  return keccak256(toBytes(summary.trim()));
}
