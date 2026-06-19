import type {
  ConsultNote,
  OwnedRecord,
  TranscriptionResult,
  TranscriptSegment,
  VerificationResult,
} from "@/shared/contract";
import { computeNoteHash } from "@/lib/hash";
import { OWNER_ADDRESS, COMPUTE } from "@/lib/constants";

export type Lang = "ta" | "hi" | "en";
export type RecordStatus = "verified" | "pending" | "failed";

/** UI-augmented transcript line: native script + English gloss side by side. */
export interface BilingualSegment {
  id: string;
  speaker: "doctor" | "patient";
  native: string;
  english: string;
  language: Lang;
  confidence: number;
  lowConfidence?: boolean;
}

/** The TeeTLS signed routing proof, broken out for the Proof tab. */
export interface TeeTlsProofDetail {
  model: string;
  requestHash: string;
  responseHash: string;
  providerTlsFingerprint: string;
  teeMeasurement: string;
  routingSignature: string;
  attestation: string;
  signer: string;
}

export interface RecordSummary {
  id: string;
  code: string;
  date: string; // ISO
  complaint: string;
  language: Lang;
  status: RecordStatus;
  root: string;
}

export interface DemoConsult {
  code: string;
  shareCode: string;
  complaint: string;
  languages: Lang[];
  reviewer: string;
  createdAt: string;
  segments: BilingualSegment[];
  note: ConsultNote;
  proof: TeeTlsProofDetail;
  record: OwnedRecord;
  verification: VerificationResult;
}

const STORAGE_ROOT =
  "0x9a3f7e2c8b14d05f6a91c3be77204e1f8a6b0991c4e3f2a1d8b6c0e9f7a2b3c1";

// ---- The live demo consult (Tamil → English) ----
export const DEMO_SEGMENTS: BilingualSegment[] = [
  {
    id: "s1",
    speaker: "doctor",
    native: "என்ன பிரச்சனை?",
    english: "What's troubling you?",
    language: "ta",
    confidence: 0.98,
  },
  {
    id: "s2",
    speaker: "patient",
    native: "மூணு நாளா காய்ச்சல், வறட்டு இருமல்.",
    english: "Fever for three days, and a dry cough.",
    language: "ta",
    confidence: 0.81,
    lowConfidence: true,
  },
  {
    id: "s3",
    speaker: "doctor",
    native: "மூச்சு வாங்குதா? சளி வருதா?",
    english: "Any breathlessness? Any phlegm?",
    language: "ta",
    confidence: 0.96,
  },
  {
    id: "s4",
    speaker: "patient",
    native: "மூச்சு வாங்கல, சளி இல்ல. தலைவலி, உடம்பு வலி இருக்கு.",
    english: "No breathlessness, no phlegm. I have a headache and body pain.",
    language: "ta",
    confidence: 0.94,
  },
  {
    id: "s5",
    speaker: "doctor",
    native: "பயணம் ஏதும் போனீங்களா?",
    english: "Any recent travel?",
    language: "ta",
    confidence: 0.97,
  },
  {
    id: "s6",
    speaker: "patient",
    native: "இல்ல டாக்டர். பாராசிட்டமால் எடுத்துக்கிட்டேன், கொஞ்சம் கம்மி ஆச்சு.",
    english: "No doctor. I took paracetamol, it eased a little.",
    language: "ta",
    confidence: 0.92,
  },
];

const SUMMARY = [
  "38-year-old male presenting with three days of fever, dry cough, headache and generalized body ache.",
  "No breathlessness, no phlegm, no recent travel. Took paracetamol with partial relief.",
  "Vitals stable, throat mildly congested, chest clear. Likely viral upper-respiratory infection;",
  "symptomatic care advised with review in 48 hours.",
].join(" ");

const TRANSCRIPT: TranscriptionResult = {
  transcript: DEMO_SEGMENTS.map((s) => s.native).join(" "),
  provider: "sarvam",
  language: "ta-IN",
  segments: DEMO_SEGMENTS.map<TranscriptSegment>((s, i) => ({
    id: s.id,
    speaker: s.speaker,
    text: s.native,
    confidence: s.confidence,
    timestamp_start: i * 4200,
    timestamp_end: i * 4200 + 3600,
    language: s.language,
  })),
};

const NOTE_HASH = computeNoteHash(SUMMARY);

export const DEMO_NOTE: ConsultNote = {
  id: "note_sz4827ta",
  consultationCode: "SZ-4827-TA",
  createdAt: "2026-06-19T16:42:00+05:30",
  language: "ta",
  chiefComplaint: "Fever for three days, dry cough",
  subjective:
    "38-year-old male presenting with three days of fever, dry cough, generalized body ache and fatigue. Reports mild headache and malaise. No chest pain, no shortness of breath, no recent travel. Patient took paracetamol with partial relief.",
  objective:
    "Temp 38.4°C, HR 92 bpm, BP 118/76 mmHg, SpO₂ 98% on room air. Throat mildly congested, no exudate. Chest clear on auscultation, no added sounds. No lymphadenopathy.",
  assessment:
    "Likely viral upper-respiratory infection. Low suspicion of bacterial cause or lower-respiratory involvement at this stage.",
  plan:
    "Paracetamol 500 mg PRN for fever, oral fluids, rest. Steam inhalation for cough. Safety-net advice given. Review in 48 hours if fever persists, breathlessness develops, or symptoms worsen.",
  summary: SUMMARY,
  transcript: TRANSCRIPT,
  noteHash: NOTE_HASH,
};

export const DEMO_PROOF: TeeTlsProofDetail = {
  model: COMPUTE.model,
  requestHash: "0x6e4c1f9b22a0d4e7c3815ad9f0b2e6c4d1a8f37b90e2c5a4d6f018b7c2e377ae",
  responseHash: "0x9e02b438a17c6d05f29e4b81c037ad6e1f8b2c40d9a73e6c5b1408f2d7e9e438",
  providerTlsFingerprint: "9f:2a:c4:8b:13:6e:a0:d7:c3:81:5a:d9:f0:b2:e6:ce",
  teeMeasurement: "mr_enclave 0x3b1f08e7c2a945d6b0e8f17c… f08",
  routingSignature: "0x88a72d61f0c4e93b15ad8e7c20b6f4d1a9e3c85b… 2d61",
  attestation: COMPUTE.attestation,
  signer: "0g-broker-07",
};

export const DEMO_RECORD: OwnedRecord = {
  noteId: DEMO_NOTE.id,
  noteHash: NOTE_HASH,
  zgStorageRootHash: STORAGE_ROOT,
  teeTlsProof: DEMO_PROOF.routingSignature,
  ownerAddress: OWNER_ADDRESS,
  storedAt: "2026-06-19T16:42:09+05:30",
};

export const DEMO_VERIFICATION: VerificationResult = {
  noteId: DEMO_NOTE.id,
  hashMatches: true,
  proofValid: true,
  storageReachable: true,
};

export const DEMO_CONSULT: DemoConsult = {
  code: "SZ-4827-TA",
  shareCode: "HX7K2M",
  complaint: "Fever, dry cough & body ache",
  languages: ["ta", "en"],
  reviewer: "Dr. A. Kumar",
  createdAt: DEMO_NOTE.createdAt,
  segments: DEMO_SEGMENTS,
  note: DEMO_NOTE,
  proof: DEMO_PROOF,
  record: DEMO_RECORD,
  verification: DEMO_VERIFICATION,
};

// ---- The owned-records library ----
export const DEMO_RECORDS: RecordSummary[] = [
  {
    id: "note_sz4827ta",
    code: "SZ-4827-TA",
    date: "2026-06-19T16:42:00+05:30",
    complaint: "Fever, dry cough & body ache",
    language: "ta",
    status: "verified",
    root: STORAGE_ROOT,
  },
  {
    id: "note_sz4815hi",
    code: "SZ-4815-HI",
    date: "2026-06-16T11:08:00+05:30",
    complaint: "Routine antenatal check, 28 weeks",
    language: "hi",
    status: "verified",
    root: "0x4d2e91c7a0b83f15e6c2740d9ab81f3c… 7f",
  },
  {
    id: "note_sz4790ta",
    code: "SZ-4790-TA",
    date: "2026-06-12T09:35:00+05:30",
    complaint: "Diabetes follow-up, HbA1c review",
    language: "ta",
    status: "verified",
    root: "0xb710e93a5c08d4f162b7e0c9a1d83f5e… 9a",
  },
  {
    id: "note_sz4771hi",
    code: "SZ-4771-HI",
    date: "2026-06-09T17:20:00+05:30",
    complaint: "Child immunisation — 9 months",
    language: "hi",
    status: "pending",
    root: "0x2c84f015d9a6730e8b1c4f02a7d96e35… 05",
  },
  {
    id: "note_sz4758en",
    code: "SZ-4758-EN",
    date: "2026-06-05T14:02:00+05:30",
    complaint: "Right knee pain after a fall",
    language: "en",
    status: "verified",
    root: "0x6f19d3b820a45c7e09f1b6c83d240e7a… d3",
  },
  {
    id: "note_sz4731ta",
    code: "SZ-4731-TA",
    date: "2026-06-01T10:14:00+05:30",
    complaint: "Postpartum review, day 10",
    language: "ta",
    status: "failed",
    root: "0xe05af72c184b6309d5e1c80a7f23b94d… 8c",
  },
];
