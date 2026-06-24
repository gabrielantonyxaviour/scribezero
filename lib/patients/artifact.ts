import { keccak256, toBytes } from "viem";

import { NETWORK } from "../constants";
import type { SignMessage } from "../records/encrypted-artifact";

export type PatientLanguage = "en" | "hi" | "ta";

export type PatientPrivateProfile = {
  fullName: string;
  birthYear: string;
  phone?: string;
  preferredLanguage: PatientLanguage;
  notes?: string;
};

export type EncryptedPatientArtifact = {
  schema: "scribezero.encrypted-patient.v1";
  kind: "patient_profile";
  network: {
    chainId: 16602;
    name: string;
    indexer: string;
  };
  public: {
    patientId: string;
    ownerAddress: string;
    createdAt: string;
    preferredLanguage: PatientLanguage;
    patientCommitment: `0x${string}`;
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

function ciphertextHash(ciphertext: string): `0x${string}` {
  return keccak256(bytesToHex(base64ToBytes(ciphertext)));
}

function patientId() {
  return `pat_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

function normalizePatient(input: PatientPrivateProfile): PatientPrivateProfile {
  return {
    fullName: input.fullName.trim(),
    birthYear: input.birthYear.trim(),
    phone: input.phone?.trim() || undefined,
    preferredLanguage: input.preferredLanguage,
    notes: input.notes?.trim() || undefined,
  };
}

function patientCommitment(privateProfile: PatientPrivateProfile, salt: string): `0x${string}` {
  return keccak256(toBytes(JSON.stringify({ ...privateProfile, salt })));
}

function encryptionChallenge(input: {
  ownerAddress: string;
  patientId: string;
  commitment: `0x${string}`;
  createdAt: string;
}) {
  return [
    "ScribeZero encrypted patient key",
    `owner=${input.ownerAddress.toLowerCase()}`,
    `patient=${input.patientId}`,
    `commitment=${input.commitment}`,
    `createdAt=${input.createdAt}`,
  ].join("\n");
}

async function keyFromSignature(signature: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(signature));
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt"]);
}

export function validatePatientProfile(input: PatientPrivateProfile) {
  const patient = normalizePatient(input);
  if (patient.fullName.length < 2) throw new Error("Patient name is required");
  if (!/^(19|20)\d{2}$/.test(patient.birthYear)) throw new Error("Birth year must be four digits");
  if (!["en", "hi", "ta"].includes(patient.preferredLanguage)) {
    throw new Error("Preferred language must be English, Hindi, or Tamil");
  }
  return patient;
}

export async function buildEncryptedPatientArtifact(input: {
  ownerAddress: string;
  patient: PatientPrivateProfile;
  signMessage: SignMessage;
  now?: string;
}): Promise<EncryptedPatientArtifact> {
  if (!/^0x[0-9a-fA-F]{40}$/.test(input.ownerAddress)) throw new Error("Owner wallet is required");
  const privateProfile = validatePatientProfile(input.patient);
  const createdAt = input.now ?? new Date().toISOString();
  const id = patientId();
  const salt = crypto.randomUUID();
  const commitment = patientCommitment(privateProfile, salt);
  const challenge = encryptionChallenge({
    ownerAddress: input.ownerAddress,
    patientId: id,
    commitment,
    createdAt,
  });
  const signature = await input.signMessage(challenge);
  const key = await keyFromSignature(signature);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(JSON.stringify({ ...privateProfile, salt }));
  const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext));
  const ciphertext = bytesToBase64(encrypted);

  return {
    schema: "scribezero.encrypted-patient.v1",
    kind: "patient_profile",
    network: {
      chainId: 16602,
      name: NETWORK.chainLabel,
      indexer: NETWORK.indexer,
    },
    public: {
      patientId: id,
      ownerAddress: input.ownerAddress,
      createdAt,
      preferredLanguage: privateProfile.preferredLanguage,
      patientCommitment: commitment,
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

export function isEncryptedPatientArtifact(value: unknown): value is EncryptedPatientArtifact {
  const artifact = value as Partial<EncryptedPatientArtifact> | null;
  return Boolean(
    artifact &&
      artifact.schema === "scribezero.encrypted-patient.v1" &&
      artifact.kind === "patient_profile" &&
      /^0x[0-9a-fA-F]{40}$/.test(artifact.public?.ownerAddress || "") &&
      typeof artifact.public?.patientId === "string" &&
      /^0x[0-9a-fA-F]{64}$/.test(artifact.public?.patientCommitment || "") &&
      artifact.encryption?.algorithm === "AES-GCM" &&
      /^0x[0-9a-fA-F]{64}$/.test(artifact.encryption?.ciphertextHash || "") &&
      typeof artifact.ciphertext === "string",
  );
}
