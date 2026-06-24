import test from "node:test";
import assert from "node:assert/strict";

import {
  BROKER_MIN_LEDGER_OG,
  computeFundingError,
  getLastComputeFundingFailure,
  isRouterInsufficientBalanceError,
} from "../lib/0g/compute";

test("recognizes 0G Router payment balance failures", () => {
  assert.equal(
    isRouterInsufficientBalanceError(
      new Error('router 402: {"error":{"message":"Insufficient balance","code":"insufficient_balance"}}'),
    ),
    true,
  );
  assert.equal(isRouterInsufficientBalanceError(new Error("router 500: provider unavailable")), false);
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
