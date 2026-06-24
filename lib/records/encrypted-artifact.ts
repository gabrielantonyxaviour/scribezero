import { keccak256, toBytes } from "viem";

import { NETWORK } from "../constants";
import type { ConsultNote } from "../../shared/contract";

export type EncryptedRecordArtifact = {
  schema: "scribezero.encrypted-record.v1";
  kind: "consult_note";
  network: {
    chainId: 16602;
    name: string;
    indexer: string;
  };
  public: {
    noteId: string;
    consultationCode: string;
    ownerAddress: string;
    createdAt: string;
    language: ConsultNote["language"];
    noteHash: `0x${string}`;
    transcriptHash: `0x${string}`;
    computeProof: {
      provider: string;
      model?: string;
      chatID: string;
      verified: boolean | null;
    };
    sttProof?: {
      provider: string;
      proofId?: string;
      verified: true;
    };
  };
  encryption: {
    algorithm: "AES-GCM";
    keyDerivation: "wallet-personal-signature-sha256";
    challenge: string;
    iv: string;
    ciphertextHash: `0x${string}`;
  };
  ciphertext: string;
};

export type SignMessage = (message: string) => Promise<string>;

function bytesToBase64(bytes: Uint8Array) {
  if (typeof Buffer !== "undefined") return Buffer.from(bytes).toString("base64");
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToBytes(value: string) {
  if (typeof Buffer !== "undefined") return new Uint8Array(Buffer.from(value, "base64"));
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function bytesToHex(bytes: Uint8Array): `0x${string}` {
  return `0x${Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

export function ciphertextHash(ciphertext: string): `0x${string}` {
  return keccak256(bytesToHex(base64ToBytes(ciphertext)));
}

function transcriptHash(note: ConsultNote): `0x${string}` {
  return keccak256(toBytes(note.transcript.transcript.trim()));
}

function encryptionChallenge(note: ConsultNote, ownerAddress: string) {
  return [
    "ScribeZero encrypted record key",
    `owner=${ownerAddress.toLowerCase()}`,
    `note=${note.id}`,
    `noteHash=${note.noteHash}`,
    `createdAt=${note.createdAt}`,
  ].join("\n");
}

async function keyFromSignature(signature: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(signature));
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt"]);
}

export async function buildEncryptedRecordArtifact(input: {
  note: ConsultNote;
  ownerAddress: string;
  computeProof: {
    provider: string;
    model?: string;
    chatID: string;
    verified: boolean | null;
  };
  signMessage: SignMessage;
}): Promise<EncryptedRecordArtifact> {
  const challenge = encryptionChallenge(input.note, input.ownerAddress);
  const signature = await input.signMessage(challenge);
  const key = await keyFromSignature(signature);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(JSON.stringify(input.note));
  const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext));
  const ciphertext = bytesToBase64(encrypted);

  return {
    schema: "scribezero.encrypted-record.v1",
    kind: "consult_note",
    network: {
      chainId: 16602,
      name: NETWORK.chainLabel,
      indexer: NETWORK.indexer,
    },
    public: {
      noteId: input.note.id,
      consultationCode: input.note.consultationCode,
      ownerAddress: input.ownerAddress,
      createdAt: input.note.createdAt,
      language: input.note.language,
      noteHash: input.note.noteHash,
      transcriptHash: transcriptHash(input.note),
      computeProof: input.computeProof,
      sttProof:
        input.note.transcript.proofVerified === true
          ? {
              provider: input.note.transcript.provider,
              proofId: input.note.transcript.proofId,
              verified: true,
            }
          : undefined,
    },
    encryption: {
      algorithm: "AES-GCM",
      keyDerivation: "wallet-personal-signature-sha256",
      challenge,
      iv: bytesToBase64(iv),
      ciphertextHash: ciphertextHash(ciphertext),
    },
    ciphertext,
  };
}

export function isEncryptedRecordArtifact(value: unknown): value is EncryptedRecordArtifact {
  if (!value || typeof value !== "object") return false;
  const artifact = value as Partial<EncryptedRecordArtifact>;
  return artifact.schema === "scribezero.encrypted-record.v1" &&
    artifact.kind === "consult_note" &&
    typeof artifact.ciphertext === "string" &&
    artifact.encryption?.algorithm === "AES-GCM" &&
    typeof artifact.public?.noteId === "string" &&
    typeof artifact.public?.noteHash === "string";
}
