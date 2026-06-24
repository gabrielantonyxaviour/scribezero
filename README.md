# ScribeZero

> Speak Tamil or Hindi. Get a structured medical note you actually own — its inference verifiable, its record yours, on 0G.

Built for **The Zero Cup by 0G** (knockout, community-voted).

## The one-liner
Your doctor's visit, in your language, turned into a verifiable medical record that *you* hold — not a hospital silo, not a SaaS vendor. The note is generated through 0G's verifiable compute and stored on 0G, so "private and owned by you" is true at the protocol level.

## The flow (one screen)
```
🎙️ speak (Tamil / Hindi)
   → live bilingual transcript
   → SOAP note generated via 0G Compute  (verifiable inference, TEE)
   → stored on 0G Storage  (you get the Merkle-root ownership handle)
   → "owned + verifiable" seal: TeeTLS proof + storage root
```

## Why 0G is load-bearing (not a bolt-on)
- **0G Compute** generates the SOAP note inside a TEE. The response carries a routing trace, and the proof is verified **independently on-chain** via the broker's `processResponse` (read-only) — so "which model saw your words, and what it returned" is provable. Remove it and there is no verifiable inference.
- **0G Storage** is the only place the record lives; its **Merkle root hash is the ownership handle** bound to your wallet. Remove it and there is no owned record.

Both are real calls, not cosmetics — see `lib/0g/`.

## Pages
| Route | What it is |
|---|---|
| `/` | Landing — the pitch + demo CTA |
| `/app` | Capture — mic → live bilingual transcript → 0G seal sequence → owned receipt |
| `/records` | Your owned consultation library |
| `/records/[id]` | The note + ownership + TeeTLS proof + inline verify |
| `/verify` | Walletless public verifier — prove a record by its root hash |
| `/r/[code]` | Shareable, OG-image-worthy "verified on 0G" card |

## Stack
Next.js 16 (App Router) · React 19 · Tailwind v4 · shadcn/ui themed **Editorial Dark** · `@0gfoundation/0g-storage-ts-sdk` · `@0gfoundation/0g-compute-ts-sdk` · ethers v6. The FE/BE seam lives in [`shared/contract.ts`](shared/contract.ts).

## Run it
```bash
pnpm install
pnpm dev          # http://localhost:3000
```
The app runs out of the box on a deterministic mock seam. To enable the **real** 0G path, set in `.env.local`:
```bash
ZEROG_PRIVATE_KEY=0x...            # a funded 0G-Galileo-testnet wallet
ZEROG_ROUTER_API_KEY=sk-...        # 0G Compute router key (pc.0g.ai) — enables verifiable inference
# optional overrides:
ZEROG_RPC=https://evmrpc-testnet.0g.ai
ZEROG_INDEXER=https://indexer-storage-testnet-turbo.0g.ai
ZEROG_COMPUTE_MODEL=qwen2.5-omni
```
`GET /api/status` reports whether the wallet is enabled and funded; `/app` switches to the live 0G path automatically when it is, and falls back to a clearly-labeled mock otherwise.

## Status
- ✅ Full 6-page app, Editorial Dark, mobile-responsive.
- ✅ **0G Storage live** — uploads confirmed on the Galileo testnet (root + tx on `chainscan-galileo.0g.ai`).
- ✅ **0G Compute wired** — hosted router path (`router-api.0g.ai`, model `glm-5.2`) with on-chain TEE-proof verification; broker/ledger path also supported. Set `ZEROG_ROUTER_API_KEY` to go live.
- Public repo, kept public for the whole tournament.
