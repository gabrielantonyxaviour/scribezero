import {
  Batcher,
  Indexer,
  KvClient,
  getFlowContract,
} from "@0gfoundation/0g-storage-ts-sdk";

import { getWallet, ZEROG_INDEXER, ZEROG_RPC } from "./server";

export type KvWriteReceipt = {
  streamId: `0x${string}`;
  key: string;
  keys?: string[];
  txHash: string;
  txSeq?: number;
};

export type KvConfig = {
  configured: boolean;
  rpc?: string;
  streamId?: `0x${string}`;
  error?: string;
};

export function getKvConfig(): KvConfig {
  const rpc = process.env.ZEROG_KV_RPC;
  const streamId = process.env.ZEROG_KV_STREAM_ID;
  if (!rpc || !streamId) {
    return {
      configured: false,
      error: "ZEROG_KV_RPC and ZEROG_KV_STREAM_ID are required for 0G KV indexing",
    };
  }
  if (!/^0x[0-9a-fA-F]{64}$/.test(streamId)) {
    return {
      configured: false,
      rpc,
      error: "ZEROG_KV_STREAM_ID must be a 32-byte 0x hash",
    };
  }
  return { configured: true, rpc, streamId: streamId as `0x${string}` };
}

export function requireKvConfig() {
  const config = getKvConfig();
  if (!config.configured || !config.rpc || !config.streamId) {
    throw new Error(config.error || "0G KV is not configured");
  }
  return { rpc: config.rpc, streamId: config.streamId };
}

export async function putKvJson(key: string, value: unknown): Promise<KvWriteReceipt> {
  return putKvJsonEntries([{ key, value }]);
}

export async function putKvJsonEntries(
  entries: Array<{ key: string; value: unknown }>,
): Promise<KvWriteReceipt> {
  if (!entries.length) throw new Error("0G KV batch requires at least one entry");
  const { streamId } = requireKvConfig();
  const signer = getWallet();
  const indexer = new Indexer(ZEROG_INDEXER);
  const [nodes, nodeErr] = await indexer.selectNodes(1);
  if (nodeErr !== null) throw new Error(`0G KV node selection failed: ${nodeErr.message}`);
  if (!nodes[0]) throw new Error("0G KV node selection returned no nodes");

  const status = await nodes[0].getStatus();
  const flowAddress = status?.networkIdentity?.flowAddress;
  if (!flowAddress) throw new Error("0G KV selected node did not return a flow contract address");

  const flow = getFlowContract(flowAddress, signer);
  const batcher = new Batcher(1, nodes, flow, ZEROG_RPC);
  for (const entry of entries) {
    batcher.streamDataBuilder.set(
      streamId,
      Buffer.from(entry.key, "utf8"),
      Buffer.from(JSON.stringify(entry.value), "utf8"),
    );
  }
  const [tx, batchErr] = await batcher.exec();
  if (batchErr !== null) throw new Error(`0G KV batch execution failed: ${batchErr.message}`);

  return {
    streamId,
    key: entries[0].key,
    keys: entries.map((entry) => entry.key),
    txHash: (tx as { txHash?: string })?.txHash || "",
    txSeq: (tx as { txSeq?: number })?.txSeq,
  };
}

export async function getKvJson<T>(key: string): Promise<T | null> {
  const { rpc, streamId } = requireKvConfig();
  const client = new KvClient(rpc);
  const value = await client.getValue(streamId, Buffer.from(key, "utf8"));
  if (!value) return null;
  const raw = Buffer.from(value.data, "base64").toString("utf8");
  return JSON.parse(raw) as T;
}

export async function listKvJson<T>(
  prefix: string,
  limit = 50,
): Promise<Array<{ key: string; value: T }>> {
  const { rpc, streamId } = requireKvConfig();
  const client = new KvClient(rpc);
  const rows: Array<{ key: string; value: T }> = [];
  let cursor = prefix;
  let inclusive = true;

  while (rows.length < limit) {
    const next = await client.getNextWithValue(streamId, Buffer.from(cursor, "utf8"), inclusive);
    if (!next) break;
    const key = decodeKvKey(next.key).toString("utf8");
    if (!key.startsWith(prefix)) break;
    const raw = Buffer.from(next.data, "base64").toString("utf8");
    rows.push({ key, value: JSON.parse(raw) as T });
    cursor = key;
    inclusive = false;
  }

  return rows;
}

function decodeKvKey(value: string | Uint8Array | ArrayLike<number>) {
  if (typeof value === "string") return Buffer.from(value, "base64");
  return Buffer.from(value);
}
