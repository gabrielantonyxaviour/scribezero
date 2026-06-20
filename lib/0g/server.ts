import { ethers } from "ethers";

/** Server-only 0G wallet/provider. Only import from route handlers, never client components. */
const RPC = process.env.ZEROG_RPC || "https://evmrpc-testnet.0g.ai";

export const ZEROG_ENABLED = Boolean(process.env.ZEROG_PRIVATE_KEY);

export function getProvider() {
  return new ethers.JsonRpcProvider(RPC);
}

export function getWallet(): ethers.Wallet {
  const pk = process.env.ZEROG_PRIVATE_KEY;
  if (!pk) throw new Error("ZEROG_PRIVATE_KEY not set — 0G integration disabled");
  return new ethers.Wallet(pk, getProvider());
}

/** Native 0G balance of the signer, in ether units (string). */
export async function getBalance(): Promise<string> {
  const w = getWallet();
  const bal = await getProvider().getBalance(w.address);
  return ethers.formatEther(bal);
}

export const ZEROG_RPC = RPC;
export const ZEROG_INDEXER =
  process.env.ZEROG_INDEXER || "https://indexer-storage-testnet-turbo.0g.ai";
