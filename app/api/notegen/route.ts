import { NextResponse } from "next/server";
import { generateVerifiable } from "@/lib/0g/compute";
import { buildMessages, parseSoap } from "@/lib/notegen/soap";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  let transcript = "";
  try {
    const body = await req.json();
    transcript = String(body?.transcript ?? "").trim();
  } catch {
    /* ignore */
  }
  if (!transcript) {
    return NextResponse.json({ error: "transcript required" }, { status: 400 });
  }

  try {
    const { content, proof, fallback } = await generateVerifiable(buildMessages(transcript));
    const soap = parseSoap(content);
    return NextResponse.json({ soap, proof, fallback });
  } catch (e) {
    return NextResponse.json(
      { error: `0G Compute failed: ${(e as Error).message}` },
      { status: 502 },
    );
  }
}
