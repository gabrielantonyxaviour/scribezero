/** Shared 0G network constants. */
export const OWNER_ADDRESS =
  "0x7a4f3c8e9b2d1a6f5e4c3b2a1908f7e6d5c4e3f2";

export const NETWORK = {
  name: "0G testnet",
  chainLabel: "0G-Galileo-Testnet",
  chainId: 16602,
  rpc: "https://evmrpc-testnet.0g.ai",
  indexer: "https://indexer-storage-testnet-turbo.0g.ai",
  explorer: "https://chainscan-galileo.0g.ai",
  token: "0G",
} as const;

export const COMPUTE = {
  router: "https://router-api-testnet.integratenetwork.work/v1",
  mode: "TEE",
  model: "glm-5.1",
  attestation: "dstack TEE",
} as const;
