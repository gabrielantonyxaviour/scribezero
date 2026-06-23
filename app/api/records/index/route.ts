import { NextResponse } from "next/server";

import { getKvConfig } from "@/lib/0g/kv";
import { indexStoredRecord, listRecordIndex } from "@/lib/records/kv-index";
import type { StoredScribeRecord } from "@/lib/records/local-record";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  const owner = new URL(req.url).searchParams.get("owner") || "";
  if (!/^0x[0-9a-fA-F]{40}$/.test(owner)) {
    return NextResponse.json({ error: "owner wallet is required" }, { status: 400 });
  }

  const config = getKvConfig();
  if (!config.configured) {
    return NextResponse.json({ error: config.error }, { status: 503 });
  }

  try {
    const records = await listRecordIndex(owner);
    return NextResponse.json({ mode: "live", records });
  } catch (error) {
    return NextResponse.json(
      { error: `0G KV record index read failed: ${(error as Error).message}` },
      { status: 502 },
    );
  }
}

export async function POST(req: Request) {
  const config = getKvConfig();
  if (!config.configured) {
    return NextResponse.json({ error: config.error }, { status: 503 });
  }

  let storedRecord: unknown;
  try {
    storedRecord = (await req.json())?.storedRecord;
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  if (!isStoredScribeRecord(storedRecord)) {
    return NextResponse.json({ error: "sealed record payload is required" }, { status: 400 });
  }

  try {
    const receipt = await indexStoredRecord(storedRecord);
    return NextResponse.json({ mode: "live", ...receipt });
  } catch (error) {
    return NextResponse.json(
      { error: `0G KV record index write failed: ${(error as Error).message}` },
      { status: 502 },
    );
  }
}

function isStoredScribeRecord(value: unknown): value is StoredScribeRecord {
  const record = value as Partial<StoredScribeRecord> | null;
  return Boolean(
    record &&
      record.mode === "live" &&
      record.note &&
      typeof record.note.id === "string" &&
      typeof record.note.consultationCode === "string" &&
      /^0x[0-9a-fA-F]{64}$/.test(record.note.noteHash || "") &&
      record.record &&
      /^0x[0-9a-fA-F]{40}$/.test(record.record.ownerAddress || "") &&
      /^0x[0-9a-fA-F]{64}$/.test(record.record.noteHash || "") &&
      typeof record.record.zgStorageRootHash === "string" &&
      typeof record.record.teeTlsProof === "string" &&
      typeof record.shareCode === "string" &&
      record.proof,
  );
}
