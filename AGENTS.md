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


<claude-mem-context>
# Memory Context

# [scribezero] recent context, 2026-06-25 1:28am GMT+7

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 27 obs (10,174t read) | 1,062,693t work | 99% savings

### Jun 22, 2026
11959 9:36p ⚖️ Larinova — Doctor-First UX: Minimal Text, No Technical Jargon in Dialogue
11960 " ✅ ScribeZero — Wallet Dialog Rewritten for Doctor-First UX (No Crypto Jargon)
11962 9:38p ✅ ScribeZero — Sign-In Dialog Footer Copy Refined to Emphasize Privacy
11989 10:09p 🟣 ScribeZero — First-Party Email + Google Sign-In Dialog Replaces "Connect Wallet" Button
11990 " 🔄 ScribeZero — WalletProvider Refactored: resolving State + Auto Wallet Creation + connectEmbedded/connectExternal Split
11993 " 🟣 ScribeZero — Doctor-First Sign-In Dialog: Plain-Language UX Replacing Crypto Jargon
12005 10:21p 🔵 iibdaei Landing — Parallel Agent Session State At Continuation Point
12098 11:21p 🔵 ScribeZero — Two Worktrees With Diverged Work, Auth→Onboarding Redirect Missing
12102 11:23p 🔵 ScribeZero Youthful-Taussig Worktree — Fast-Forward Merge Ready, Full Product Mock Architecture Mapped
12117 11:30p 🔵 Brands App — Auth + Onboarding Flow Broken, Worktree Fragmentation Identified
12128 11:33p 🔵 Brands App — Auth-to-Onboarding Flow Broken, Worktree Merge Required
12131 " ✅ ScribeZero — All Worktrees Consolidated into `main` Branch
12138 11:36p 🟣 Wallet Provider Enhanced with Ready State Tracking
12139 " 🟣 Onboarding State Persistence Layer Created
12140 " 🟣 Onboarding Visual Components: Progress Bar, Option Card, Step Identity
12152 11:40p 🔴 ScribeZero Auth Redirect Added to Landing Page
12153 " 🔴 Dashboard Page Refactored with RequireDoctor Guard and Live Profile Hook
12154 " 🔵 ScribeZero Protected Pages Missing RequireDoctor Auth Guard
12157 11:43p 🟣 ScribeZero — RequireDoctor Auth Guard Applied to All Protected Pages
12158 11:44p 🟣 ScribeZero — RequireDoctor Guard Extended to Tasks and Settings Pages
12162 11:46p 🔵 ScribeZero Dev Server — All Routes Healthy, No Runtime Errors, Auth Redirect Still Broken
12164 11:47p 🔵 Brands App — Authentication Post-Login Redirect Broken, Onboarding Not Implemented
12166 11:50p 🔵 Brands App — Auth-to-Onboarding Flow Broken, Multiple Worktrees Fragmented
12167 " ⚖️ Larinova Auth+Onboarding as Reference Pattern for Brands App
### Jun 23, 2026
12222 1:17p 🔵 ScribeZero — 0G Testing Wallet Balance Check Architecture Mapped
12223 1:55p ✅ 0G Testnet Native Token Transfer — 0.1 OG Sent to 4 Addresses
12224 " ✅ 0G Testnet Airdrop Completed — All 4 Transactions Confirmed

Access 1063k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>