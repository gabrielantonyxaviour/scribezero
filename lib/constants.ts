/** Shared demo constants. The owner address is the wallet that owns every demo record. */
export const OWNER_ADDRESS =
  "0x7a4f3c8e9b2d1a6f5e4c3b2a1908f7e6d5c4e3f2";

export const NETWORK = {
  name: "0G testnet",
  chainLabel: "0G-Galileo-Testnet",
  rpc: "https://evmrpc-testnet.0g.ai",
  indexer: "https://indexer-storage-testnet-turbo.0g.ai",
  explorer: "https://chainscan-galileo.0g.ai",
  token: "0G",
} as const;

export const COMPUTE = {
  router: "https://router-api.0g.ai/v1",
  mode: "TeeTLS",
  model: "llama-3.3-70b-instruct",
  attestation: "intel sgx",
} as const;
