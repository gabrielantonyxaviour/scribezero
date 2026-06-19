# ScribeZero — verified build facts (checked 2026-06-19)

## Format + dates — CONFIRMED
- **6-round knockout bracket.** Open group stage → judges rank → top 32 seeded → 32→16→8→4→2→1. Community voting is real, **starts at quarter-finals**.
- Group stage Jun 15–27 (**submissions close Jun 23** — date only, ⚠️ no time/timezone published; confirm via platform/Discord) → results+draw Jun 27 → Round of 32 submit Jun 28 → Round of 16 submit Jul 4 → **Jul 8 final build lock** → QF vote Jul 8–10 → SF Jul 12–14 → Final Jul 16–18 → champion Jul 19.
- "Resubmit/improve each round" is true **only through Jul 8**; from QF on, one frozen build rides through.

## Eligibility — CONFIRMED (this is the make-or-break)
- Criterion 01 (mandatory tooling): build AI-native using 0G — storage, compute, **or** chain — doing **real work**. "If it runs the same without it, that's a bolt-on and it doesn't qualify."
- Criterion 03: "your team's own work, made during the tournament window — Jun 15 onward. Open-source libraries are fair game; a pre-existing product or a thin fork is not."
- → Larinova scribe ≠ submission. Build fresh. The sanctioned pattern to wrap an external LLM with a verifiable 0G layer is **0G Compute TeeTLS**.
- Submission: public repo URL + description; prove it runs (live build or demo video that matches the code). Repo snapshot frozen at each deadline. Repo private mid-tournament / vote-rigging = instant DQ.

## 0G Storage — CONFIRMED
- TS: `github.com/0gfoundation/0g-storage-ts-starter-kit`; Go: `@0gfoundation/0g-storage-client`.
- Flow: init Web3 client (EVM RPC + key) → indexer SelectNodes → upload → get a **Merkle root hash** (save it — it's the only retrieval handle); download by root hash. `withProof` for verified downloads.
- Testnet RPC `https://evmrpc-testnet.0g.ai`; turbo indexer `https://indexer-storage-testnet-turbo.0g.ai`.

## 0G Compute (verifiable inference) — CONFIRMED
- Router (recommended): OpenAI-compatible endpoint `https://router-api.0g.ai/v1`, API key from `pc.0g.ai`. Point an OpenAI SDK at it.
- Direct: `@0gfoundation/0g-compute-ts-sdk` (Node ≥22); CLI `0g-compute-cli`. (Legacy name `@0glabs/0g-serving-broker` — trust the `@0gfoundation/...` docs namespace.)
- "Verifiable" = TEE-backed. **TeeML** (model in TEE, signed responses) or **TeeTLS** (broker in TEE proxies to an external LLM over HTTPS → signed routing proof binding request hash + response hash + provider TLS fingerprint + identity). For ScribeZero, use a **TeeTLS** service to wrap the SOAP-generation call.
- Rate limits: ~30 req/min sustained, burst 5, 5 concurrent → HTTP 429.

## Larinova seam — same as VeriScribe
No callable note-gen API; STT is in-process Sarvam streaming (Hindi/Tamil). Build note-gen fresh; call Sarvam via JWT proxy. Real schemas in `shared/contract.ts`.

## Sources
0g.ai/arena/zero-cup (+/submission-criteria, /competition-rules) · docs.0g.ai (storage/sdk, compute-network/inference)
