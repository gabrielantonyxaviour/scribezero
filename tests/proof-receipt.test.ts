import test from "node:test";
import assert from "node:assert/strict";
import { summarizeProofReceipt } from "../lib/proof/receipt";

test("summarizes a fully live and verified record receipt", () => {
  const summary = summarizeProofReceipt({
    noteHashMatches: true,
    computeProofValid: true,
    storageReachable: true,
    computeMode: "live",
    storageMode: "live",
  });

  assert.equal(summary.verdict, "verified");
  assert.equal(summary.passed, 3);
  assert.equal(summary.total, 3);
  assert.equal(summary.computeLabel, "0G Compute TEE · live");
  assert.equal(summary.computeTitle, "0G Compute TEE proof valid");
  assert.equal(summary.storageLabel, "0G Storage · reachable");
  assert.equal(summary.modeLabel, "live 0G proof");
});

test("summarizes a storage-only receipt without overstating Compute", () => {
  const summary = summarizeProofReceipt({
    noteHashMatches: true,
    computeProofValid: false,
    storageReachable: true,
    computeMode: "fallback",
    storageMode: "live",
  });

  assert.equal(summary.verdict, "partial");
  assert.equal(summary.passed, 2);
  assert.equal(summary.computeLabel, "Compute fallback · not TEE verified");
  assert.equal(summary.computeTitle, "0G Compute TEE proof unavailable");
  assert.equal(summary.storageLabel, "0G Storage · reachable");
  assert.equal(summary.modeLabel, "0G Storage live · Compute fallback");
});

test("summarizes unavailable 0G receipts as unverified fallback", () => {
  const summary = summarizeProofReceipt({
    noteHashMatches: true,
    computeProofValid: false,
    storageReachable: false,
    computeMode: "fallback",
    storageMode: "fallback",
  });

  assert.equal(summary.verdict, "fallback");
  assert.equal(summary.passed, 1);
  assert.equal(summary.storageLabel, "Storage fallback · not reachable on 0G");
  assert.equal(summary.modeLabel, "0G unavailable fallback");
});
