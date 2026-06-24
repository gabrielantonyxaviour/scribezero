import { keccak256, toBytes } from "viem";

import { NETWORK } from "../constants";
import type { ComputeProof } from "../0g/compute";
import type { SignMessage } from "../records/encrypted-artifact";
import { documentTypeLabel, type GeneratedClinicalDocument } from "./generation";

export type EncryptedDocumentArtifact = {
  schema: "scribezero.encrypted-document.v1";
  kind: "clinical_document";
  network: {
    chainId: 16602;
    name: string;
    indexer: string;
  };
  public: {
    documentId: string;
    ownerAddress: string;
    patientId: string;
    type: GeneratedClinicalDocument["type"];
    title: string;
    language: GeneratedClinicalDocument["language"];
    createdAt: string;
    documentHash: `0x${string}`;
    computeProof: {
      provider: string;
      model?: string;
      chatID: string;
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

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, val]) => `${JSON.stringify(key)}:${stableStringify(val)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

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

export function computeDocumentHash(document: GeneratedClinicalDocument): `0x${string}` {
  return keccak256(toBytes(stableStringify(document)));
}

function documentId() {
  return `doc_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

function challenge(input: {
  ownerAddress: string;
  documentId: string;
  documentHash: `0x${string}`;
  createdAt: string;
}) {
  return [
    "ScribeZero encrypted document key",
    `owner=${input.ownerAddress.toLowerCase()}`,
    `document=${input.documentId}`,
    `documentHash=${input.documentHash}`,
    `createdAt=${input.createdAt}`,
  ].join("\n");
}

function publicTitle(type: GeneratedClinicalDocument["type"]) {
  const label = documentTypeLabel(type);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

async function keyFromSignature(signature: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(signature));
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt"]);
}

export async function buildEncryptedDocumentArtifact(input: {
  ownerAddress: string;
  document: GeneratedClinicalDocument;
  computeProof: ComputeProof & { verified: true };
  signMessage: SignMessage;
  now?: string;
}): Promise<EncryptedDocumentArtifact> {
  if (!/^0x[0-9a-fA-F]{40}$/.test(input.ownerAddress)) throw new Error("Owner wallet is required");
  if (input.computeProof.verified !== true) throw new Error("0G Compute proof is required");
  const createdAt = input.now ?? new Date().toISOString();
  const id = documentId();
  const docHash = computeDocumentHash(input.document);
  const message = challenge({
    ownerAddress: input.ownerAddress,
    documentId: id,
    documentHash: docHash,
    createdAt,
  });
  const signature = await input.signMessage(message);
  const key = await keyFromSignature(signature);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(JSON.stringify(input.document));
  const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext));
  const ciphertext = bytesToBase64(encrypted);

  return {
    schema: "scribezero.encrypted-document.v1",
    kind: "clinical_document",
    network: {
      chainId: 16602,
      name: NETWORK.chainLabel,
      indexer: NETWORK.indexer,
    },
    public: {
      documentId: id,
      ownerAddress: input.ownerAddress,
      patientId: input.document.patientId,
      type: input.document.type,
      title: publicTitle(input.document.type),
      language: input.document.language,
      createdAt,
      documentHash: docHash,
      computeProof: {
        provider: input.computeProof.provider,
        model: input.computeProof.model,
        chatID: input.computeProof.chatID,
        verified: true,
      },
    },
    encryption: {
      algorithm: "AES-GCM",
      keyDerivation: "wallet-personal-signature-sha256",
      challenge: message,
      iv: bytesToBase64(iv),
      ciphertextHash: ciphertextHash(ciphertext),
    },
    ciphertext,
  };
}

export function isEncryptedDocumentArtifact(value: unknown): value is EncryptedDocumentArtifact {
  const artifact = value as Partial<EncryptedDocumentArtifact> | null;
  return Boolean(
    artifact &&
      artifact.schema === "scribezero.encrypted-document.v1" &&
      artifact.kind === "clinical_document" &&
      /^0x[0-9a-fA-F]{40}$/.test(artifact.public?.ownerAddress || "") &&
      /^doc_[a-z0-9]{12}$/i.test(artifact.public?.documentId || "") &&
      /^pat_[a-z0-9]{12}$/i.test(artifact.public?.patientId || "") &&
      /^0x[0-9a-fA-F]{64}$/.test(artifact.public?.documentHash || "") &&
      artifact.public?.computeProof?.verified === true &&
      artifact.encryption?.algorithm === "AES-GCM" &&
      /^0x[0-9a-fA-F]{64}$/.test(artifact.encryption?.ciphertextHash || "") &&
      typeof artifact.ciphertext === "string",
  );
}
