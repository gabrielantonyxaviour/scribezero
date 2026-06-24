import test from "node:test";
import assert from "node:assert/strict";

import {
  BROKER_MIN_LEDGER_OG,
  computeFundingError,
  getLastComputeFundingFailure,
  isRecoverableComputeError,
  isRouterInsufficientBalanceError,
} from "../lib/0g/compute";
import { isRecoverableSttError } from "../lib/0g/stt";

test("recognizes 0G Router payment balance failures", () => {
  assert.equal(
    isRouterInsufficientBalanceError(
      new Error('router 402: {"error":{"message":"Insufficient balance","code":"insufficient_balance"}}'),
    ),
    true,
  );
  assert.equal(isRouterInsufficientBalanceError(new Error("router 500: provider unavailable")), false);
});

test("recognizes recoverable 0G Compute errors for Sarvam fallback", () => {
  assert.equal(isRecoverableComputeError(new Error("router 429: rate limit exceeded")), true);
  assert.equal(isRecoverableComputeError(new Error("router 503: provider unavailable")), true);
  assert.equal(isRecoverableComputeError(new Error("fetch failed: ENOTFOUND router")), true);
  assert.equal(isRecoverableComputeError(new Error("invalid JSON from model")), false);
});

test("recognizes recoverable 0G STT errors for Sarvam fallback", () => {
  assert.equal(isRecoverableSttError(new Error("0G STT 429: Too Many Requests")), true);
  assert.equal(isRecoverableSttError(new Error("0G STT 503: provider unavailable")), true);
  assert.equal(isRecoverableSttError(new Error("unsupported audio file")), false);
});

test("explains both 0G Compute funding paths", () => {
  const message = computeFundingError({
    routerError: "router 402: insufficient_balance",
    brokerBalance: "0.695",
  });

  assert.match(message, /Router billing failed/);
  assert.match(message, /server wallet has 0.695 OG/);
  assert.match(message, new RegExp(`${BROKER_MIN_LEDGER_OG} OG required`));
  assert.equal(getLastComputeFundingFailure(), null);
});
