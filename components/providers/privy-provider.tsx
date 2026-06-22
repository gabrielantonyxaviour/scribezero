"use client";

import { PrivyProvider as Privy } from "@privy-io/react-auth";
import { defineChain } from "viem";

export const zgTestnet = defineChain({
  id: 16602,
  name: "0G-Galileo-Testnet",
  nativeCurrency: { name: "0G", symbol: "0G", decimals: 18 },
  rpcUrls: { default: { http: ["https://evmrpc-testnet.0g.ai"] } },
  blockExplorers: {
    default: { name: "0G Chainscan", url: "https://chainscan-galileo.0g.ai" },
  },
  testnet: true,
});

const APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "";

export function PrivyProvider({ children }: { children: React.ReactNode }) {
  // No app id configured -> render children without Privy (wallet falls back to "connect" CTA).
  if (!APP_ID) return <>{children}</>;

  return (
    <Privy
      appId={APP_ID}
      config={{
        // The modal offers BOTH: email/Google -> one-tap embedded wallet (no gas, no extension),
        // and "Continue with a wallet" -> Brave/MetaMask/WalletConnect.
        loginMethods: ["email", "google", "wallet"],
        appearance: {
          theme: "dark",
          accentColor: "#84c4a0",
          showWalletLoginFirst: false,
          walletChainType: "ethereum-only",
        },
        embeddedWallets: {
          ethereum: { createOnLogin: "users-without-wallets" },
          showWalletUIs: true,
        },
        defaultChain: zgTestnet,
        supportedChains: [zgTestnet],
      }}
    >
      {children}
    </Privy>
  );
}
