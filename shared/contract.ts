/**
 * ScribeZero — shared contract. Forked from VeriScribe's medical seam, retargeted to 0G.
 * Same ConsultNote/Transcript shapes (so the two projects stay compatible), but provenance
 * is 0G Storage (Merkle root hash = ownership handle) + 0G Compute TEE proof.
 * DO NOT import private Larinova code. The 0G layer must do REAL work (no bolt-ons).
 */

// ---- Transcription (matches larinova/app/lib/transcription) ----
export interface TranscriptSegment {
  id: string;
  speaker: "doctor" | "patient" | "unknown";
  text: string;
  confidence: number; // 0–1
  timestamp_start: number; // ms
  timestamp_end: number;
  language?: "en" | "hi" | "ta"; // Sarvam: en-IN / hi-IN / ta-IN
}

export interface TranscriptionResult {
  transcript: string;
  segments: TranscriptSegment[];
  language?: string;
  provider: "0g-router" | "sarvam" | "deepgram";
  proofId?: string;
  proofVerified?: boolean | null;
}

// ---- The finished clinical note (the owned artifact) ----
export interface ConsultNote {
  id: string;
  consultationCode: string;
  createdAt: string; // ISO
  language: "en" | "hi" | "ta";
  chiefComplaint?: string;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  summary: string;
  transcript: TranscriptionResult;
  noteHash: `0x${string}`;
}

// ---- Ownership + verifiability (0G) ----
export interface OwnedRecord {
  noteId: string;
  noteHash: `0x${string}`;
  zgStorageRootHash: string; // 0G Storage Merkle root = the ownership handle
  teeTlsProof: string; // 0G Compute proof id/signature (binds request+response+provider)
  ownerAddress: string; // patient owns the record
  storedAt: string; // ISO
  storageTxHash?: string;
  chainId?: number;
  computeProvider?: string;
  computeModel?: string;
}

export interface VerificationResult {
  noteId: string;
  hashMatches: boolean; // recomputed note hash == stored
  proofValid: boolean; // 0G Compute TEE proof verifies
  storageReachable: boolean; // 0G storage root resolves
}

/**
 * Note-gen seam. The LLM call MUST route through 0G Compute TEE mode so 0G is load-bearing
 * and the inference is verifiable — this is the eligibility unlock, not a cosmetic badge.
 */
export interface NoteGenService {
  transcribe(audio: ArrayBuffer, language: "hi" | "ta" | "en"): Promise<TranscriptionResult>;
  // Runs the SOAP-generation LLM call via 0G Compute TEE; returns note + the proof.
  generateNoteVerifiable(
    t: TranscriptionResult,
    chiefComplaint?: string
  ): Promise<{ note: ConsultNote; teeTlsProof: string }>;
}

/**
 * Storage/ownership seam (0G Storage).
 */
export interface OwnershipService {
  store(note: ConsultNote, proof: string, owner: string): Promise<OwnedRecord>; // -> 0G storage root hash
  retrieve(rootHash: string): Promise<ConsultNote>;
  verify(record: OwnedRecord): Promise<VerificationResult>;
}
