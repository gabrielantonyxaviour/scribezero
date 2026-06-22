"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { toast } from "sonner";

type WalletState = {
  connected: boolean;
  address: string;
  balance: string; // native 0G balance, formatted
  connect: () => void;
  disconnect: () => void;
  copyAddress: () => void;
  manageWallet: () => void; // exportWallet() for embedded wallets
};

const WalletContext = createContext<WalletState | null>(null);
const APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "";
const RPC = "https://evmrpc-testnet.0g.ai";

function useOgBalance(address: string) {
  const [balance, setBalance] = useState("…");
  useEffect(() => {
    if (!address) {
      setBalance("…");
      return;
    }
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
        if (active) setBalance(og.toFixed(2));
      } catch {
        if (active) setBalance("—");
      }
    })();
    return () => {
      active = false;
    };
  }, [address]);
  return balance;
}

/** Real wallet, backed by Privy (embedded + external). */
function PrivyWallet({ children }: { children: React.ReactNode }) {
  const { ready, authenticated, login, logout, exportWallet, user } = usePrivy();
  const { wallets } = useWallets();
  const address = wallets[0]?.address || user?.wallet?.address || "";
  const connected = ready && authenticated && !!address;
  const balance = useOgBalance(connected ? address : "");

  const connect = useCallback(() => login(), [login]);
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
    () => ({ connected, address, balance, connect, disconnect, copyAddress, manageWallet }),
    [connected, address, balance, connect, disconnect, copyAddress, manageWallet],
  );
  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

/** Fallback when no Privy app id is configured — keeps the app rendering. */
function StubWallet({ children }: { children: React.ReactNode }) {
  const value = useMemo<WalletState>(
    () => ({
      connected: false,
      address: "",
      balance: "…",
      connect: () => toast("Wallet not configured (set NEXT_PUBLIC_PRIVY_APP_ID)"),
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
