# ScribeZero — kickoff prompt

Paste this into the Claude Code session (or say "read CLAUDE.md and KICKOFF.md, then start"). **Build VeriScribe first** — this forks its `shared/contract.ts`.

```
Goal: ship ScribeZero for The Zero Cup by 0G — a 6-round KNOCKOUT tournament (group-stage submissions close Jun 23; judges seed top 32; community voting from quarter-finals; build improvable through the Jul 8 final lock). Optimize for 5-second legibility + shareable demo wow. ScribeZero = a verifiable Indian-language AI health scribe: speak Tamil/Hindi -> instant structured note you OWN, persisted on 0G storage, inference run verifiably via 0G Compute.

ELIGIBILITY IS THE TRAP — read carefully. 0G rule (confirmed): "your team's own work, made during the tournament window — Jun 15 onward; a pre-existing product or a thin fork is not [eligible]" AND "if it runs the same without 0G, that's a bolt-on and it doesn't qualify." So:
  1. The submission is NOT the Larinova scribe. Build the note-gen layer FRESH (there is no Larinova note API anyway — it's in-process + Supabase-gated). Treat the scribe engine only as an external dependency.
  2. Make 0G LOAD-BEARING: route the LLM note-generation call through 0G Compute TeeTLS mode (TEE broker proxies your model over HTTPS and emits a signed routing proof) — this is the sanctioned way to wrap an external LLM with verifiable 0G compute. Persist the owned record on 0G Storage (returns a Merkle root hash = the ownership handle). "Your medical record, verifiably private, owned by you" must be true at the protocol level, not cosmetic.

Reuse, don't rebuild:
- Read ~/Documents/agents/docs/hackathons/research-sessions/2026-06-19-0g-zero-cup-ideas.md (ScribeZero section + voting dynamics).
- shared/contract.ts here is already forked from VeriScribe (same ConsultNote/Transcript; OwnedRecord swapped in for the 0G provenance). Keep them compatible with ~/Documents/hackathons/sui-overflow-2026/veriscribe/shared/contract.ts.
- Same Sarvam STT pattern as VeriScribe (Hindi/Tamil via JWT proxy; never ship the raw key).
- ./FACTS.md has the 0G build facts. Editorial Dark from ~/Documents/agents/design-system/AGENTS.md.

Build: one gorgeous single-flow demo (mic -> live bilingual transcript -> owned, verifiable note on 0G) a non-technical voter gets instantly and wants to share. Plan mode + screenshot before finalizing UI. Build for the Jun 23 cut, keep it improvable. Public repo (do NOT take it private mid-tournament = instant DQ); demo must match the code. Stay on main. Start with the plan; stop for my approval.
```
