# ScribeZero — session operating instructions (auto-loaded)

**You are building a PUBLIC submission for The Zero Cup by 0G — a 6-round KNOCKOUT, community-voted tournament. Read `KICKOFF.md` for the full brief, `FACTS.md` for verified facts, `shared/contract.ts` for the seam.**

## What this is
A verifiable Indian-language AI health scribe: speak Tamil/Hindi → instant structured note you OWN, persisted on **0G Storage**, with inference run verifiably via **0G Compute (TeeTLS)**. "Your medical record, verifiably private, owned by you."

## Format shapes the build
6-round knockout. Group-stage submissions close **Jun 23**; judges seed top 32; **community voting from quarter-finals**; build improvable through the **Jul 8 final lock**. → **Optimize for 5-second legibility + shareable demo wow**, not infra depth. One gorgeous single flow a non-technical voter gets instantly.

## Load-bearing rules (do not violate)
- **Stay on `main`.** No feature branches.
- **PUBLIC repo, kept public for the whole tournament** (taking it private mid-tournament = instant DQ). No private Larinova/company code.
- **Eligibility is the trap.** 0G rule: "made during the tournament window — Jun 15 onward; a pre-existing product or a thin fork is not [eligible]" AND "if it runs the same without 0G, that's a bolt-on and it doesn't qualify."
  1. The submission is NOT the Larinova scribe (which has no callable note API anyway). Build the note-gen layer FRESH; treat the scribe only as an external dependency.
  2. Make 0G **load-bearing**: route the LLM note-gen call through **0G Compute TeeTLS** (TEE broker proxies your model over HTTPS, emits a signed routing proof) and persist the owned record on **0G Storage** (returns a Merkle root hash). Both already shaped in `shared/contract.ts`.
- **Contract-first, mock-first. Plan mode for UX** (present screen, wait for approval). **Screenshot** built screens and iterate.
- **Design = Editorial Dark** — `~/Documents/agents/design-system/AGENTS.md`. Instrument Serif italic, jade `#84C4A0` live-only, dark-only.
- **Demo must match the code** (faking = DQ).

## Reuse
- Fork VeriScribe's `shared/contract.ts` (already done here — same ConsultNote/Transcript, OwnedRecord swapped in for ProvenanceRecord).
- Same Sarvam STT pattern as VeriScribe (Hindi/Tamil via JWT proxy; never ship the raw key).

## First action
Write the plan (one shareable single-flow demo: mic → live bilingual transcript → owned, verifiable note on 0G). **Stop after the plan for Gabriel's approval.** Build for the Jun 23 cut; keep it improvable.
