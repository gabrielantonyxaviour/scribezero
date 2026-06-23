import test from "node:test";
import assert from "node:assert/strict";

import { isStorageReachableStatus } from "../lib/0g/reachability";

test("treats a successful 0G indexer GET as reachable even when HEAD is unsupported", () => {
  assert.equal(isStorageReachableStatus(200), true);
  assert.equal(isStorageReachableStatus(204), true);
  assert.equal(isStorageReachableStatus(404), false);
});
