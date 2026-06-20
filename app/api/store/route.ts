import { NextResponse } from "next/server";
import { uploadJson } from "@/lib/0g/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  let note: unknown;
  try {
    note = (await req.json())?.note;
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  if (!note) {
    return NextResponse.json({ error: "note required" }, { status: 400 });
  }
  try {
    const { rootHash, txHash } = await uploadJson(note);
    return NextResponse.json({ rootHash, txHash });
  } catch (e) {
    return NextResponse.json(
      { error: `0G Storage failed: ${(e as Error).message}` },
      { status: 502 },
    );
  }
}
