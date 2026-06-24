# ScribeZero Demo Video Plan

Target runtime: 88-95 seconds.
Audience: first-round judges.
Video style: speaker-led pitch with short app recordings inserted. Do not use one continuous screen recording.
Final public URL: `https://scribezero.pages.dev/demo.mp4`.

## Storyboard

| Time | Screen | Voiceover |
| --- | --- | --- |
| 00:00-00:07 | Logo, product name, one-line thesis over the `/pitch` hero. | "A medical record should survive the app that created it." |
| 00:07-00:20 | Two fast panels: local-language consult, messy note handoff, private record receipt. | "In India, care often happens in Tamil or Hindi, but software pushes doctors back into English-first forms and patients leave without portable proof." |
| 00:20-00:47 | Demo clip 01: `/app`, play or record consult, generate SOAP note. | "ScribeZero keeps the conversation natural. The doctor records or plays the consult, the app structures it into a SOAP note, and the patient receives a sealed record instead of a loose file." |
| 00:47-01:07 | Demo clip 02: receipt or record verification screen, zoom on 0G fields. | "The important part is the seal. 0G Compute can create the note, 0G Storage becomes the ownership handle, and verification proves integrity without exposing private medical content." |
| 01:07-01:23 | `/pitch` proof section plus quick overlay of logo, app URL, repo URL. | "For judges, this is not just a scribe UI. It is a patient-owned medical memory loop: consult, note, seal, verify." |
| 01:23-01:32 | Closing title with live URL and "Built for Zero Cup". | "ScribeZero turns spoken care into private, verifiable records patients can carry forward." |

## Screen Recordings To Capture

Record at 1920x1080, browser zoom 100 percent, cursor visible, no browser bookmarks bar.

1. `scribezero-clip-01-consult-to-note.mp4`
   - URL: `https://scribezero.pages.dev/app`
   - Action: start from the consult screen, use the prepared sample audio or playback button, generate the SOAP note, pause on the completed note.
   - Duration needed in edit: 22-27 seconds.
   - Important framing: keep generated note text and the primary action button visible.

2. `scribezero-clip-02-verify-receipt.mp4`
   - URL: the live record or verification route used by the app.
   - Action: open a generated record, show the receipt/proof state, hover or scroll to the 0G Storage/Compute fields.
   - Duration needed in edit: 15-20 seconds.
   - Important framing: do not reveal private patient data beyond the demo/sample content.

3. `scribezero-clip-03-pitch-proof.mp4`
   - URL: `https://scribezero.pages.dev/pitch`
   - Action: slow scroll from hero to "What judges should verify".
   - Duration needed in edit: 8-10 seconds.

## Voice Recording For Gabriel

Record one clean file named `scribezero-gabriel-voice.wav`.
Pace: confident, warm, 135-145 words per minute. Leave half a second of silence between paragraphs.

Full script:

"A medical record should survive the app that created it.

In India, care often happens in Tamil or Hindi, but software pushes doctors back into English-first forms and patients leave without portable proof.

ScribeZero keeps the conversation natural. The doctor records or plays the consult, the app structures it into a SOAP note, and the patient receives a sealed record instead of a loose file.

The important part is the seal. 0G Compute can create the note, 0G Storage becomes the ownership handle, and verification proves integrity without exposing private medical content.

For judges, this is not just a scribe UI. It is a patient-owned medical memory loop: consult, note, seal, verify.

ScribeZero turns spoken care into private, verifiable records patients can carry forward."

## Remotion Assembly Notes

Composition: `ScribeZeroDemo`, 1920x1080, 30 fps, 92 seconds.

Assets:
- `public/video/raw/scribezero-clip-01-consult-to-note.mp4`
- `public/video/raw/scribezero-clip-02-verify-receipt.mp4`
- `public/video/raw/scribezero-clip-03-pitch-proof.mp4`
- `public/audio/scribezero-gabriel-voice.wav`

Use the pitch page as the visual language: jade accent, clinical paper tones, large thesis type, and receipt-style overlays. Add captions for the hook and final sentence only, not every word.
