"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useCreateWallet, usePrivy, useWallets } from "@privy-io/react-auth";
import { toast } from "sonner";

type WalletState = {
  connected: boolean;
  resolving: boolean;
  address: string;
  balance: string; // native 0G balance, formatted
  connect: () => void;
  connectEmbedded: () => void;
  connectExternal: () => void;
  disconnect: () => void;
  copyAddress: () => void;
  manageWallet: () => void; // exportWallet() for embedded wallets
};

const WalletContext = createContext<WalletState | null>(null);
const APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "";
const RPC = "https://evmrpc-testnet.0g.ai";

function useOgBalance(address: string) {
  const [balance, setBalance] = useState({ address: "", value: "…" });
  useEffect(() => {
    if (!address) return;
    let active = true;
    (async () => {
      try {
        const res = await fetch(RPC, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_getBalance",
            params: [address, "latest"],
            id: 1,
          }),
        });
        const j = await res.json();
        const og = Number(BigInt(j.result || "0x0")) / 1e18;
        if (active) setBalance({ address, value: og.toFixed(2) });
      } catch {
        if (active) setBalance({ address, value: "—" });
      }
    })();
    return () => {
      active = false;
    };
  }, [address]);
  if (!address || balance.address !== address) return "…";
  return balance.value;
}

/** Real wallet, backed by Privy (embedded + external). */
function PrivyWallet({ children }: { children: React.ReactNode }) {
  const { ready, authenticated, login, connectWallet, logout, exportWallet, user } = usePrivy();
  const { createWallet } = useCreateWallet();
  const { wallets } = useWallets();
  const address = wallets[0]?.address || user?.wallet?.address || "";
  const connected = ready && authenticated && !!address;
  const resolving = ready && authenticated && !address;
  const balance = useOgBalance(connected ? address : "");
  const walletCreateStarted = useRef(false);

  useEffect(() => {
    if (!resolving || walletCreateStarted.current) return;
    walletCreateStarted.current = true;
    createWallet().catch(() => {
      walletCreateStarted.current = false;
      toast("Could not finish account setup. Please try again.");
    });
  }, [createWallet, resolving]);

  const connectEmbedded = useCallback(
    () => login({ loginMethods: ["email", "google"] }),
    [login],
  );
  const connectExternal = useCallback(
    () =>
      connectWallet({
        walletChainType: "ethereum-only",
        description: "Use an existing browser wallet for your ScribeZero record owner.",
      }),
    [connectWallet],
  );
  const connect = connectEmbedded;
  const disconnect = useCallback(() => logout(), [logout]);
  const copyAddress = useCallback(() => {
    if (!address) return;
    navigator.clipboard?.writeText(address);
    toast.success("Address copied");
  }, [address]);
  const manageWallet = useCallback(async () => {
    try {
      await exportWallet();
    } catch {
      toast("Key export is available for embedded wallets");
    }
  }, [exportWallet]);

  const value = useMemo<WalletState>(
    () => ({
      connected,
      resolving,
      address,
      balance,
      connect,
      connectEmbedded,
      connectExternal,
      disconnect,
      copyAddress,
      manageWallet,
    }),
    [
      connected,
      resolving,
      address,
      balance,
      connect,
      connectEmbedded,
      connectExternal,
      disconnect,
      copyAddress,
      manageWallet,
    ],
  );
  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

/** Fallback when no Privy app id is configured — keeps the app rendering. */
function StubWallet({ children }: { children: React.ReactNode }) {
  const value = useMemo<WalletState>(
    () => ({
      connected: false,
      resolving: false,
      address: "",
      balance: "…",
      connect: () => toast("Wallet not configured (set NEXT_PUBLIC_PRIVY_APP_ID)"),
      connectEmbedded: () => toast("Wallet not configured (set NEXT_PUBLIC_PRIVY_APP_ID)"),
      connectExternal: () => toast("Wallet not configured (set NEXT_PUBLIC_PRIVY_APP_ID)"),
      disconnect: () => {},
      copyAddress: () => {},
      manageWallet: () => {},
    }),
    [],
  );
  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return APP_ID ? <PrivyWallet>{children}</PrivyWallet> : <StubWallet>{children}</StubWallet>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
