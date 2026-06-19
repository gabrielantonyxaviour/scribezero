"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { toast } from "sonner";
import { OWNER_ADDRESS } from "@/lib/constants";

type WalletState = {
  connected: boolean;
  address: string;
  balance: string; // native 0G balance, formatted
  connect: () => void;
  disconnect: () => void;
  copyAddress: () => void;
  manageWallet: () => void; // Privy exportWallet() in the real build
};

const WalletContext = createContext<WalletState | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  // Demo starts connected so the owned-records experience is visible immediately.
  const [connected, setConnected] = useState(true);
  const address = OWNER_ADDRESS;
  const balance = "14.20";

  const connect = useCallback(() => {
    setConnected(true);
    toast.success("Wallet connected", { description: "Privy embedded wallet" });
  }, []);

  const disconnect = useCallback(() => {
    setConnected(false);
    toast("Wallet disconnected");
  }, []);

  const copyAddress = useCallback(() => {
    navigator.clipboard?.writeText(address);
    toast.success("Address copied");
  }, [address]);

  const manageWallet = useCallback(() => {
    toast("Opening wallet manager", {
      description: "Privy exportWallet() in the live build",
    });
  }, []);

  const value = useMemo<WalletState>(
    () => ({ connected, address, balance, connect, disconnect, copyAddress, manageWallet }),
    [connected, address, balance, connect, disconnect, copyAddress, manageWallet],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
