import { NextResponse } from "next/server";
import { storageReachable } from "@/lib/0g/storage";
import { computeNoteHash } from "@/lib/hash";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { rootHash?: string; summary?: string; noteHash?: string; proofValid?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const { rootHash, summary, noteHash, proofValid } = body;
  if (!rootHash) {
    return NextResponse.json({ error: "rootHash required" }, { status: 400 });
  }

  const hashMatches =
    typeof summary === "string" && typeof noteHash === "string"
      ? computeNoteHash(summary) === noteHash
      : false;

  const reachable = await storageReachable(rootHash);

  return NextResponse.json({
    hashMatches,
    proofValid: Boolean(proofValid),
    storageReachable: reachable,
  });
}
