import { Indexer, MemData } from "@0gfoundation/0g-storage-ts-sdk";
import { getWallet, ZEROG_RPC, ZEROG_INDEXER } from "./server";
import { isStorageReachableStatus } from "./reachability";

/**
 * Upload an arbitrary JSON object to 0G Storage.
 * Returns the Merkle root hash (the ownership handle) + the on-chain tx hash.
 */
export async function uploadJson(
  obj: unknown,
): Promise<{ rootHash: string; txHash: string }> {
  const signer = getWallet();
  const indexer = new Indexer(ZEROG_INDEXER);
  const bytes = new TextEncoder().encode(JSON.stringify(obj));
  const data = new MemData(bytes);

  const [tree, treeErr] = await data.merkleTree();
  if (treeErr !== null) throw new Error(`merkle: ${treeErr}`);
  const computedRoot = tree?.rootHash() ?? "";

  const [tx, uploadErr] = await indexer.upload(data, ZEROG_RPC, signer);
  if (uploadErr !== null) throw new Error(`upload: ${uploadErr}`);

  const rootHash =
    (tx as { rootHash?: string })?.rootHash ?? computedRoot;
  const txHash = (tx as { txHash?: string })?.txHash ?? "";
  return { rootHash, txHash };
}

/** True if the root resolves on the 0G Storage indexer (used by verify). */
export async function storageReachable(rootHash: string): Promise<boolean> {
  try {
    const url = `${ZEROG_INDEXER}/file?root=${rootHash}`;
    const head = await fetch(url, { method: "HEAD" });
    if (isStorageReachableStatus(head.status)) return true;
    const get = await fetch(url, { method: "GET" });
    return isStorageReachableStatus(get.status);
  } catch {
    return false;
  }
}
