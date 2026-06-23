# Larinova to ScribeZero implementation map

Date: 2026-06-23

This audit treats Larinova as a product-depth reference, not as code to copy.
ScribeZero must remain a fresh Zero Cup build where 0G Compute and 0G Storage
are required for the core experience.

## Design direction

- Surface type: clinical AI product, public hackathon demo, doctor-first app.
- User job: record a Tamil/Hindi consult, review a structured note, seal it as
  a patient-owned verifiable record, and share proof.
- Visual system: shadcn/ui New York, dark clinical surfaces, clean sans stack,
  tight operational density, jade only for live/proof states.
- Not allowed: cursive, script, decorative fonts, Larinova branding, generic
  hackathon dashboards, fake live 0G claims.

## Product map

| Larinova surface | Useful product depth | ScribeZero adaptation | Files to adapt/create | 0G integration point | Not copied |
|---|---|---|---|---|---|
| Auth and access gates | Doctor-first sign-in, gated onboarding, resume progress | Wallet/email sign-in, `RequireDoctor`, wallet-keyed onboarding state | `components/providers/wallet-provider.tsx`, `components/shell/require-doctor.tsx`, `app/onboarding/page.tsx` | Wallet becomes owner address for profile and records | Supabase auth tables, invite-code alpha gating |
| Onboarding | Name, motivation, specialty, sample SOAP magic, credentials, celebration | Five-step wallet onboarding with identity, practice, credentials, sample consult, profile seal | `components/onboarding/*`, `lib/onboarding/*`, `app/api/practice-profile/route.ts` | PracticeProfile JSON is uploaded to 0G Storage; root saved against wallet profile | Larinova photos, particle dust, private invite copy |
| Dashboard home | Next patient, tasks, follow-up risk, inline assistant | Decision desk for starting sample consult, verifying latest record, and reviewing live/fallback status | `app/dashboard/page.tsx`, `lib/mock/product.ts` | Shows storage/compute readiness and latest receipt | Stat-card hero, Helena assistant, Supabase task feed |
| Consultation workspace | Recording state, diarized transcript, SOAP generation, proof flow | Single shareable flow: mic/sample consult -> bilingual transcript -> 0G Compute SOAP -> 0G Storage seal | `app/app/page.tsx`, `app/api/notegen/route.ts`, `app/api/store/route.ts`, `lib/services.ts` | TeeTLS generation and storage root are the main action | Larinova in-process note engine or private APIs |
| SOAP and prescription review | Structured clinical output, review before sending, care instructions | SOAP note plus care-plan preview when clinically useful; no prescription clone unless it supports demo clarity | `app/app/page.tsx`, `app/records/[id]/page.tsx`, `lib/mock/data.ts` | Note hash and proof bundle stored with record | Full prescription PDF workflow, formulary, Razorpay |
| Patient records | List/detail records with patient context and documents | Owned record library keyed by wallet owner and share code | `app/records/page.tsx`, `app/records/[id]/page.tsx`, `app/patients/*` | Every record shows note hash, storage root, proof status | Supabase patient table dependency |
| Documents | Verified PDFs, certificates, share/view tracking | Verifiable note/document receipts and export affordances | `app/documents/page.tsx`, `app/r/[code]/page.tsx` | Public share cards expose only proof facts | Certificate templates and messaging webhooks |
| Settings | Clinic identity, templates, signatures, data controls | Doctor profile, clinic, languages, credentials, wallet owner, 0G profile root, reset onboarding | `app/settings/page.tsx`, `lib/onboarding/store.ts` | Live/mock integration status and profile root | Billing, subscriptions, admin controls |
| Verification | Document integrity checks | Public verifier for storage root/proof receipt with understandable judge/user language | `app/verify/page.tsx`, `app/api/verify/route.ts` | Recompute hash, check proof flag, check storage reachability | Larinova document verifier copy |

## Execution priority

1. Lock the profile artifact: onboarding must produce a real PracticeProfile
   JSON object, attempt live 0G Storage upload, and label fallback honestly.
2. Make `/app` the primary knockout demo journey, not just a mock recording UI.
3. Ensure `/records`, `/records/[id]`, `/verify`, and `/r/[code]` all explain
   owner, note hash, 0G Storage root, 0G Compute proof, timestamp, and share code.
4. Convert settings from placeholders into profile and integration controls.
5. Run lint/build/browser checks and collect mobile/tablet/desktop screenshots.

## Current known fallback areas

- If `ZEROG_PRIVATE_KEY` or 0G testnet connectivity is unavailable, profile and
  note storage must fall back to deterministic local roots and say so.
- If `ZEROG_ROUTER_API_KEY` or compute ledger funding is unavailable, note
  generation may use the local deterministic SOAP note while still labeling
  Compute as fallback or storage-only.
- No external DB should be introduced unless 0G Storage plus wallet-local state
  cannot reasonably represent the data needed for the demo.
