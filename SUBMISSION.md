# ScribeZero — The Zero Cup by 0G

**A verifiable Indian-language AI health scribe.** Speak Tamil or Hindi → a structured clinical note that is generated inside 0G Compute and owned by you on 0G Storage. *Your medical record, verifiably private, owned by you* — true at the protocol level, not cosmetic.

## 30-second demo script (for voters)
1. Open `/` — the pitch. Hit **Try the scribe**.
2. On `/app`, press the mic (or **Play sample consult**) — a Tamil doctor↔patient consult streams in as a **live bilingual transcript** (native + English, speaker-diarized).
3. Press **Generate** — watch the **Sealing on 0G** sequence: routed through the 0G TEE → note generated in the attested enclave → signed routing proof → **persisted to 0G Storage** → sealed & owned.
4. The receipt shows the **storage root** (your ownership handle) + **owner = your wallet**. Hit **Open record** to read the SOAP note, the TeeTLS proof, and re-run the 3 verification checks; or **Share** for a public, walletless proof card.
5. Anyone can independently confirm it at `/verify` by pasting the root — integrity is public, the note stays private.

## Why 0G is load-bearing (not a bolt-on)
Remove 0G and the product's core promise disappears:
- **0G Storage** is the *only* place the record lives; its **Merkle root is the ownership handle**, bound to the patient's wallet. No Storage → no owned record. *(Real, live, on-chain — see evidence below.)*
- **0G Compute (TEE)** generates the SOAP note; the response is verified **independently on-chain** via the broker's `processResponse`, so "which model saw your words and what it returned" is provable. No Compute → no verifiable inference.

The note-gen layer is built **fresh** for this submission (the seam is `shared/contract.ts`); the external scribe/STT is only an input. It does **not** run the same without 0G — the inference is routed through 0G Compute and the record's existence + ownership are 0G Storage primitives.

## On-chain evidence (0G-Galileo testnet)
- 0G Storage uploads confirmed live from the app's `/api/store`:
  - root `0x195783…5a57`, tx [`0x378a97…9744`](https://chainscan-galileo.0g.ai/tx/0x378a9754318b010efa540cf9e0c61f3686badd11883d963339748e4147129744)
  - root `0x7efc…79` (created by the live `/app` seal flow), owner = wallet `0x2F20…F586`
- The `/app` receipt is honest about state: **`0G Storage · live`** (Storage real on-chain) and **`Compute · demo (add key)`** until the 0G Compute key is set; it flips to **`0G testnet`** (Compute+Storage live) automatically.

## Architecture
- `shared/contract.ts` — the FE/BE seam (ConsultNote / Transcript / OwnedRecord / VerificationResult).
- `lib/0g/storage.ts` — real 0G Storage upload (`MemData` → `merkleTree()` → `indexer.upload`) + reachability.
- `lib/0g/compute.ts` — real 0G Compute: hosted router (`router-api.0g.ai`, model `glm-5.2`) **or** wallet/broker ledger; TEE proof verified on-chain via `processResponse`.
- `app/api/{notegen,store,verify,status}` — Node-runtime routes exposing the real path; `lib/services.ts` chooses live vs deterministic mock by `GET /api/status` and degrades gracefully (Storage stays real even if the Compute key is absent).

## Enabling the full live path
The app runs on a deterministic mock out of the box. To run **fully real**, set in `.env.local`:
```
ZEROG_PRIVATE_KEY=0x...          # funded 0G-Galileo-testnet wallet (Storage gas + broker)
ZEROG_ROUTER_API_KEY=sk-...      # 0G Compute router key (pc.0g.ai) → verifiable inference
```
With the wallet funded, Storage is live immediately; adding the router key flips Compute live (or fund the wallet to ≥3 0G to use the broker ledger path instead — no key).

## Tournament hygiene
- Built during the window (Jun 15+), team's own work, fresh note-gen layer.
- **Public repo, kept public for the whole tournament** (no mid-tournament private flip).
- Demo matches the code — the live flow does real on-chain 0G work; no faked calls.
