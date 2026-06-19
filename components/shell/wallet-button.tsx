"use client";

import { ChevronDown, Coins, Copy, KeyRound, LogOut, User } from "lucide-react";
import { useWallet } from "@/components/providers/wallet-provider";
import { OwnerAvatar } from "@/components/sz/owner-avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { truncAddress } from "@/lib/format";

export function WalletButton() {
  const { connected, address, balance, connect, disconnect, copyAddress, manageWallet } =
    useWallet();

  if (!connected) {
    return (
      <Button variant="outline" size="sm" onClick={connect} className="rounded-md">
        Connect wallet
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* native 0G balance pill — left of the wallet button, no chain switcher */}
      <div className="hidden items-center gap-1.5 rounded-full border border-border bg-surface-1 px-2.5 py-1 sm:flex">
        <Coins className="size-3.5 text-ink-dim" />
        <span className="ds-mono text-xs text-ink-muted">{balance} 0G</span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-md border border-border-strong bg-surface-1 px-2 py-1 transition-colors hover:bg-surface-2">
            <OwnerAvatar address={address} size={22} />
            <span className="ds-mono text-xs text-ink-muted">{truncAddress(address)}</span>
            <ChevronDown className="size-3.5 text-ink-dim" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem>
            <User className="size-4" /> Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={manageWallet}>
            <KeyRound className="size-4" /> Manage wallet
          </DropdownMenuItem>
          <DropdownMenuItem onClick={copyAddress}>
            <Copy className="size-4" /> Copy address
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={disconnect} className="text-vermillion focus:text-vermillion">
            <LogOut className="size-4" /> Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
