# ScribeZero

> Speak Tamil or Hindi. Get a structured medical note you actually own — its inference verifiable, its record yours, on 0G.

Built for **The Zero Cup by 0G** (knockout, community-voted).

## The one-liner
Your doctor's visit, in your language, turned into a verifiable medical record that *you* hold — not a hospital silo, not a SaaS vendor. The note is generated through 0G's verifiable compute and stored on 0G, so "private and owned by you" is true at the protocol level.

## The flow (one screen)
```
🎙️ speak (Tamil / Hindi)
   → live bilingual transcript (Sarvam STT)
   → SOAP note generated via 0G Compute TeeTLS  (verifiable inference)
   → stored on 0G Storage  (you get the ownership handle)
   → "owned + verifiable" badge: proof + storage root
```

## Why 0G is load-bearing (not a bolt-on)
The note is generated *inside* 0G's TEE-backed compute (TeeTLS), producing a signed routing proof, and persisted on 0G Storage. Remove 0G and the privacy/ownership guarantee disappears — which is the entire pitch.

## Stack
0G Storage · 0G Compute (TeeTLS) · Next.js + Editorial Dark · Sarvam STT. Seam in `shared/contract.ts`.

## Status
Scaffold. Forks VeriScribe's contract. Build in progress.
