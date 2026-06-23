import { NextResponse } from "next/server";
import { uploadJson } from "@/lib/0g/storage";
import { isPracticeProfileArtifact } from "@/lib/onboarding/practice-profile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  let artifact: unknown;
  try {
    artifact = (await req.json())?.artifact;
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  if (!isPracticeProfileArtifact(artifact)) {
    return NextResponse.json({ error: "practice profile artifact required" }, { status: 400 });
  }

  try {
    const { rootHash, txHash } = await uploadJson(artifact);
    return NextResponse.json({
      rootHash,
      txHash,
      storedAt: new Date().toISOString(),
      mode: "live",
    });
  } catch (e) {
    return NextResponse.json(
      { error: `0G Storage failed: ${(e as Error).message}` },
      { status: 502 },
    );
  }
}
