import { ethers } from "ethers";

export const SCRIBEZERO_REGISTRY_ABI = [
  {
    type: "function",
    name: "registerPracticeProfile",
    stateMutability: "nonpayable",
    inputs: [
      { name: "rootHash", type: "bytes32" },
      { name: "artifactHash", type: "bytes32" },
      { name: "storageTxHash", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "profiles",
    stateMutability: "view",
    inputs: [{ name: "doctor", type: "address" }],
    outputs: [
      { name: "rootHash", type: "bytes32" },
      { name: "artifactHash", type: "bytes32" },
      { name: "storageTxHash", type: "bytes32" },
      { name: "updatedAt", type: "uint64" },
      { name: "version", type: "uint64" },
    ],
  },
  {
    type: "event",
    name: "PracticeProfileRegistered",
    anonymous: false,
    inputs: [
      { name: "doctor", type: "address", indexed: true },
      { name: "rootHash", type: "bytes32", indexed: true },
      { name: "artifactHash", type: "bytes32", indexed: false },
      { name: "storageTxHash", type: "bytes32", indexed: false },
      { name: "version", type: "uint64", indexed: false },
    ],
  },
] as const;

export const ZEROG_CHAIN_ID_HEX =
  process.env.NEXT_PUBLIC_ZEROG_CHAIN_ID_HEX || "0x40da";
export const ZEROG_CHAIN_ID = Number.parseInt(ZEROG_CHAIN_ID_HEX, 16);
export const ZEROG_RPC =
  process.env.NEXT_PUBLIC_ZEROG_RPC || "https://evmrpc-testnet.0g.ai";
export const ZEROG_REGISTRY_ADDRESS =
  process.env.NEXT_PUBLIC_ZEROG_REGISTRY_ADDRESS || "";

const registryInterface = new ethers.Interface(SCRIBEZERO_REGISTRY_ABI);

export type RegistryReceipt = {
  transactionHash: `0x${string}`;
  blockNumber: number;
  status: "0x1" | "0x0";
};

export type PracticeProfileRegistration = {
  doctor: `0x${string}`;
  rootHash: `0x${string}`;
  artifactHash: `0x${string}`;
  storageTxHash: `0x${string}`;
  version: number;
  registryAddress: `0x${string}`;
  registryTxHash: `0x${string}`;
  registryBlockNumber: number;
};

type JsonRpcError = { message?: string };

export function isRegistryConfigured() {
  return ethers.isAddress(ZEROG_REGISTRY_ADDRESS);
}

export function requireRegistryAddress() {
  if (!isRegistryConfigured()) {
    throw new Error("NEXT_PUBLIC_ZEROG_REGISTRY_ADDRESS is not set");
  }
  return ZEROG_REGISTRY_ADDRESS as `0x${string}`;
}

export function normalizeBytes32(value: string | undefined, label: string): `0x${string}` {
  if (!value) return ethers.ZeroHash as `0x${string}`;
  if (!/^0x[0-9a-fA-F]{64}$/.test(value)) {
    throw new Error(`${label} must be a 32-byte 0x hash`);
  }
  return value as `0x${string}`;
}

export function encodeRegisterPracticeProfile({
  rootHash,
  artifactHash,
  storageTxHash,
}: {
  rootHash: string;
  artifactHash: string;
  storageTxHash?: string;
}): `0x${string}` {
  return registryInterface.encodeFunctionData("registerPracticeProfile", [
    normalizeBytes32(rootHash, "profile root"),
    normalizeBytes32(artifactHash, "artifact hash"),
    normalizeBytes32(storageTxHash, "storage transaction hash"),
  ]) as `0x${string}`;
}

export async function waitForRegistryReceipt(
  txHash: `0x${string}`,
  {
    rpc = ZEROG_RPC,
    timeoutMs = 120_000,
    intervalMs = 2_500,
  }: { rpc?: string; timeoutMs?: number; intervalMs?: number } = {},
): Promise<RegistryReceipt> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const res = await fetch(rpc, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getTransactionReceipt",
        params: [txHash],
      }),
    });
    const json = (await res.json()) as {
      error?: { message?: string };
      result?: { transactionHash: string; blockNumber: string; status: "0x1" | "0x0" } | null;
    };
    if (json.error) throw new Error(json.error.message || "0G receipt lookup failed");
    if (json.result) {
      return {
        transactionHash: json.result.transactionHash as `0x${string}`,
        blockNumber: Number.parseInt(json.result.blockNumber, 16),
        status: json.result.status,
      };
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error(`0G registry transaction did not confirm within ${timeoutMs / 1000}s`);
}

async function rpcCall<T>(rpc: string, method: string, params: unknown[]): Promise<T> {
  const res = await fetch(rpc, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method,
      params,
    }),
  });
  const json = (await res.json()) as { error?: JsonRpcError; result?: T };
  if (json.error) throw new Error(json.error.message || `${method} failed on 0G RPC`);
  if (json.result === undefined) throw new Error(`${method} returned no result from 0G RPC`);
  return json.result;
}

function parseHexNumber(value: string | undefined) {
  return Number.parseInt(value || "0x0", 16);
}

export async function findLatestPracticeProfileRegistration(
  doctor: string,
  {
    rpc = ZEROG_RPC,
    registryAddress = requireRegistryAddress(),
    lookbackBlocks = 250_000,
  }: {
    rpc?: string;
    registryAddress?: `0x${string}`;
    lookbackBlocks?: number;
  } = {},
): Promise<PracticeProfileRegistration | null> {
  if (!ethers.isAddress(doctor)) throw new Error("valid doctor wallet address required");
  const normalizedDoctor = ethers.getAddress(doctor) as `0x${string}`;
  const latestHex = await rpcCall<string>(rpc, "eth_blockNumber", []);
  const latest = parseHexNumber(latestHex);
  const fromBlock = Math.max(0, latest - lookbackBlocks);
  const registeredEvent = registryInterface.getEvent("PracticeProfileRegistered");
  if (!registeredEvent) throw new Error("PracticeProfileRegistered event is missing from registry ABI");
  const logs = await rpcCall<
    Array<{
      address: string;
      blockNumber?: string;
      data: string;
      logIndex?: string;
      topics: string[];
      transactionHash: string;
    }>
  >(rpc, "eth_getLogs", [
    {
      address: registryAddress,
      fromBlock: `0x${fromBlock.toString(16)}`,
      toBlock: "latest",
      topics: [registeredEvent.topicHash, ethers.zeroPadValue(normalizedDoctor, 32)],
    },
  ]);

  const latestLog = logs
    .map((log) => ({ log, blockNumber: parseHexNumber(log.blockNumber), logIndex: parseHexNumber(log.logIndex) }))
    .sort((a, b) => b.blockNumber - a.blockNumber || b.logIndex - a.logIndex)[0]?.log;
  if (!latestLog) return null;

  const parsed = registryInterface.parseLog({ topics: latestLog.topics, data: latestLog.data });
  if (!parsed || parsed.name !== "PracticeProfileRegistered") return null;

  return {
    doctor: ethers.getAddress(parsed.args.doctor) as `0x${string}`,
    rootHash: parsed.args.rootHash as `0x${string}`,
    artifactHash: parsed.args.artifactHash as `0x${string}`,
    storageTxHash: parsed.args.storageTxHash as `0x${string}`,
    version: Number(parsed.args.version),
    registryAddress,
    registryTxHash: latestLog.transactionHash as `0x${string}`,
    registryBlockNumber: parseHexNumber(latestLog.blockNumber),
  };
}
