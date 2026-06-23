import { NextResponse } from "next/server";
import { uploadJson } from "@/lib/0g/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  let artifact: unknown;
  try {
    const body = await req.json();
    artifact = body?.artifact ?? body?.note;
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  if (!artifact) {
    return NextResponse.json({ error: "encrypted artifact required" }, { status: 400 });
  }
  try {
    const { rootHash, txHash } = await uploadJson(artifact);
    return NextResponse.json({ rootHash, txHash });
  } catch (e) {
    return NextResponse.json(
      { error: `0G Storage failed: ${(e as Error).message}` },
      { status: 502 },
    );
  }
}
