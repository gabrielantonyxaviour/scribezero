export type ProofMode = "live" | "fallback";
export type ProofVerdict = "verified" | "partial" | "fallback";

export type ProofReceiptInput = {
  noteHashMatches: boolean;
  computeProofValid: boolean;
  storageReachable: boolean;
  computeMode: ProofMode;
  storageMode: ProofMode;
};

export type ProofReceiptSummary = {
  verdict: ProofVerdict;
  passed: number;
  total: 3;
  modeLabel: string;
  integrityLabel: string;
  computeTitle: string;
  computeLabel: string;
  storageLabel: string;
};

export function summarizeProofReceipt(input: ProofReceiptInput): ProofReceiptSummary {
  const passed = [
    input.noteHashMatches,
    input.computeProofValid,
    input.storageReachable,
  ].filter(Boolean).length;

  let verdict: ProofVerdict = "fallback";
  if (passed === 3 && input.computeMode === "live" && input.storageMode === "live") {
    verdict = "verified";
  } else if (input.storageMode === "live" || input.computeMode === "live" || passed > 1) {
    verdict = "partial";
  }

  let modeLabel = "0G unavailable fallback";
  if (input.computeMode === "live" && input.storageMode === "live") {
    modeLabel = "live 0G proof";
  } else if (input.storageMode === "live") {
    modeLabel = "0G Storage live · Compute fallback";
  } else if (input.computeMode === "live") {
    modeLabel = "0G Compute live · Storage fallback";
  }

  return {
    verdict,
    passed,
    total: 3,
    modeLabel,
    integrityLabel: input.noteHashMatches ? "Note hash · match" : "Note hash · mismatch",
    computeTitle:
      input.computeMode === "live" && input.computeProofValid
        ? "0G Compute TEE proof valid"
        : "0G Compute TEE proof unavailable",
    computeLabel:
      input.computeMode === "live" && input.computeProofValid
        ? "0G Compute TEE · live"
        : "Compute fallback · not TEE verified",
    storageLabel:
      input.storageMode === "live" && input.storageReachable
        ? "0G Storage · reachable"
        : "Storage fallback · not reachable on 0G",
  };
}
