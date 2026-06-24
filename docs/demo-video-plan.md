# ScribeZero 4-Minute Demo Video Plan

Target duration: 4:00.
Audience: first-round judges.
Video style: founder pitch plus live app footage, not one continuous screen recording.
Final public URL: `https://scribezero.pages.dev/demo.mp4`.

## Timing

| Time | Scene | Visual direction | Audio file |
| --- | --- | --- | --- |
| 00:00-00:20 | Hook | Logo, strong headline, medical-record fragments becoming a sealed receipt. | `public/audio/final/scribezero-01-hook.mp3` |
| 00:20-00:48 | Problem | Tamil/Hindi consult, English-first form pressure, patient leaves with no portable record. | `public/audio/final/scribezero-02-problem.mp3` |
| 00:48-01:14 | Product thesis | Animated loop: speak, structure, seal, verify. | `public/audio/final/scribezero-03-product-loop.mp3` |
| 01:14-01:58 | Footage 01 | Insert `public/video/final/scribezero-01-consult-to-note.mp4`. | `public/audio/final/scribezero-04-demo-consult.mp3` |
| 01:58-02:38 | Footage 02 | Insert `public/video/final/scribezero-02-patients-records.mp4`. | `public/audio/final/scribezero-05-demo-records.mp3` |
| 02:38-03:15 | Proof | Insert `public/video/final/scribezero-03-verify-proof.mp4` plus 0G proof overlay. | `public/audio/final/scribezero-06-proof.mp3` |
| 03:15-03:40 | Why it wins | Judge checklist: real workflow, privacy posture, 0G ownership handle, business path. | `public/audio/final/scribezero-07-judge-case.mp3` |
| 03:40-04:00 | Close | Logo, URL, final thesis, three proof badges. | `public/audio/final/scribezero-08-close.mp3` |

## ElevenLabs Script Chunks

Record each chunk as its own MP3. Keep the filenames exactly as listed above.

### 01 Hook

A medical record should survive the app that created it.

ScribeZero starts with a simple belief: the most important part of healthcare is the conversation, but most software treats that conversation like an inconvenience. The doctor speaks naturally. The patient explains symptoms in the language they are comfortable with. Then, after all that trust, the record often becomes a rushed note, a PDF, or nothing the patient can actually carry forward.

ScribeZero turns that moment into patient-owned medical memory.

### 02 Problem

In India, real care often happens in Tamil, Hindi, or a mix of local language and English. But the software layer is still built around English-first forms, manual typing, and hospital-owned portals. That creates three problems at once.

Doctors lose time translating conversation into structure. Patients leave without a portable record. And when a second doctor needs context, everyone depends on screenshots, prescriptions, or memory.

The result is not just inconvenience. It is missing medical continuity for the people who need it most.

### 03 Product Loop

ScribeZero is a bilingual AI health scribe designed around a complete record loop: listen, structure, seal, and verify.

The doctor keeps the consult natural. The app turns the encounter into a structured SOAP note, attaches it to the patient timeline, and creates a proof-backed record handle. The patient does not need to understand blockchains or storage networks. They just receive a private, portable record that can be verified later.

The key is that the product is not only transcription. It is the workflow around the record after transcription.

### 04 Demo Consult

Here is the live consult flow.

The doctor starts in the scribe experience, records or plays a sample consult, and lets the app structure the conversation into a clinical note. The important detail is that the interface stays close to the doctor workflow. It is not asking the doctor to become a data-entry operator.

As the note is generated, the product organizes symptoms, assessment, and plan into a usable medical format. The doctor can review it, adjust it, and move from a spoken encounter into a record that is ready to store.

This is where ScribeZero saves time without removing clinical judgment.

### 05 Demo Records

After the note is created, the record moves into the patient and records layer.

This is the part many scribe tools ignore. A note is only valuable if it can be found, connected to a patient, and used again later. In the live app, the dashboard, patients view, and records view show how ScribeZero becomes a continuity system, not only a one-screen demo.

The doctor can inspect patient context, open previous records, and keep the workflow organized around real follow-up care.

For a clinic, that means less repeated explanation. For the patient, it means their health story does not reset every time they meet a new provider.

### 06 Proof

Now the record becomes verifiable.

ScribeZero uses the 0G layer for the part that matters most: a portable ownership handle and integrity proof for the record. The private medical content does not need to be exposed publicly. The proof can say that a record exists, that it belongs in the patient timeline, and that it has not silently changed.

That is the difference between a normal note app and a patient-owned record system.

0G storage gives durability. The proof screen gives judges something inspectable. The privacy boundary keeps the product realistic for healthcare.

### 07 Judge Case

For judges, the winning point is that ScribeZero connects a real user pain to a real 0G advantage.

The pain is local-language healthcare documentation. The workflow is consult to note to patient timeline. The 0G advantage is portable verification without leaking private content. And the business path is clear: clinics, private doctors, and care networks already pay for tools that reduce documentation time and improve follow-up.

This can start as an AI scribe, but the larger product is a medical memory layer owned by patients.

### 08 Close

ScribeZero turns spoken care into private, verifiable records patients can carry forward.

It is not trying to make doctors work like software. It lets healthcare stay human, then gives the record a structure, a seal, and a future.

Live demo: scribezero.pages.dev.

## Footage To Record

Record at 1920x1080, browser zoom 100 percent, cursor visible, no bookmarks bar, no password manager popups. Capture clean MP4s without audio.

1. `scribezero-01-consult-to-note.mp4`
   - URL: `https://scribezero.pages.dev/app`
   - Length to record: 55-70 seconds.
   - Show: open scribe, start/play sample consult, generate SOAP note, pause on completed note.
   - Important: keep generated note and main action button readable.

2. `scribezero-02-patients-records.mp4`
   - URL sequence: `/dashboard`, `/patients`, `/records`
   - Length to record: 45-60 seconds.
   - Show: dashboard metrics, patient list/detail, records list/detail.
   - Important: use only demo/sample patient content.

3. `scribezero-03-verify-proof.mp4`
   - URL sequence: `/verify`, then `/pitch`
   - Length to record: 35-45 seconds.
   - Show: verification state, 0G fields, then slow scroll through judge proof section.
   - Important: pause on proof labels so they can be read.

## Remotion Assembly Notes

Use eight audio sequences rather than one long file. Footage should occupy roughly 1:25-1:45 of the 4:00 runtime. Pitch scenes should use ScribeZero's jade and clinical-paper brand language, receipt-style proof panels, and restrained motion.
