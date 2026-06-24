import { NextResponse } from "next/server";

import { getKvConfig } from "@/lib/0g/kv";
import { isEncryptedPatientArtifact } from "@/lib/patients/artifact";
import { indexPatientArtifact, listPatientIndex, readPatientIndex } from "@/lib/patients/kv-index";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isOwner(value: string) {
  return /^0x[0-9a-fA-F]{40}$/.test(value);
}

function isRoot(value: string) {
  return /^0x[0-9a-fA-F]{64}$/.test(value);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const owner = url.searchParams.get("owner") || "";
  const patientId = url.searchParams.get("patientId") || "";
  if (!isOwner(owner)) {
    return NextResponse.json({ error: "owner wallet is required" }, { status: 400 });
  }

  const config = getKvConfig();
  if (!config.configured) {
    return NextResponse.json({ error: config.error }, { status: 503 });
  }

  try {
    if (patientId) {
      const patient = await readPatientIndex(owner, patientId);
      return NextResponse.json({ mode: "live", patient });
    }
    const patients = await listPatientIndex(owner);
    return NextResponse.json({ mode: "live", patients });
  } catch (error) {
    return NextResponse.json(
      { error: `0G KV patient index read failed: ${(error as Error).message}` },
      { status: 502 },
    );
  }
}

export async function POST(req: Request) {
  const config = getKvConfig();
  if (!config.configured) {
    return NextResponse.json({ error: config.error }, { status: 503 });
  }

  let body: {
    artifact?: unknown;
    storageRootHash?: string;
    storageTxHash?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  if (!isEncryptedPatientArtifact(body.artifact)) {
    return NextResponse.json({ error: "encrypted patient artifact is required" }, { status: 400 });
  }
  if (!body.storageRootHash || !isRoot(body.storageRootHash)) {
    return NextResponse.json({ error: "valid 0G Storage root is required" }, { status: 400 });
  }

  try {
    const receipt = await indexPatientArtifact({
      artifact: body.artifact,
      storageRootHash: body.storageRootHash,
      storageTxHash: body.storageTxHash,
    });
    return NextResponse.json({ mode: "live", patientId: body.artifact.public.patientId, ...receipt });
  } catch (error) {
    return NextResponse.json(
      { error: `0G KV patient index write failed: ${(error as Error).message}` },
      { status: 502 },
    );
  }
}
