import assert from "node:assert/strict";
import test from "node:test";
import { ethers } from "ethers";

import {
  SCRIBEZERO_REGISTRY_ABI,
  encodeRegisterPracticeProfile,
  normalizeBytes32,
} from "../lib/0g/registry";

test("encodes doctor profile registry writes with storage and artifact hashes", () => {
  const rootHash = `0x${"11".repeat(32)}`;
  const artifactHash = `0x${"22".repeat(32)}`;
  const storageTxHash = `0x${"33".repeat(32)}`;

  const data = encodeRegisterPracticeProfile({ rootHash, artifactHash, storageTxHash });
  const decoded = new ethers.Interface(SCRIBEZERO_REGISTRY_ABI).decodeFunctionData(
    "registerPracticeProfile",
    data,
  );

  assert.equal(decoded[0], rootHash);
  assert.equal(decoded[1], artifactHash);
  assert.equal(decoded[2], storageTxHash);
});

test("uses zero bytes for optional storage transaction hashes", () => {
  const data = encodeRegisterPracticeProfile({
    rootHash: `0x${"11".repeat(32)}`,
    artifactHash: `0x${"22".repeat(32)}`,
  });
  const decoded = new ethers.Interface(SCRIBEZERO_REGISTRY_ABI).decodeFunctionData(
    "registerPracticeProfile",
    data,
  );

  assert.equal(decoded[2], ethers.ZeroHash);
});

test("rejects malformed bytes32 registry values", () => {
  assert.throws(() => normalizeBytes32("0x1234", "root"), /root must be a 32-byte 0x hash/);
});
