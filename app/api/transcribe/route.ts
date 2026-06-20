import { NextResponse } from "next/server";
import { transcribeViaRouter } from "@/lib/0g/stt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  const apiKey = process.env.ZEROG_ROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "0G STT needs ZEROG_ROUTER_API_KEY (Whisper on the router)" },
      { status: 503 },
    );
  }

  let file: File | null = null;
  let language: "ta" | "hi" | "en" | undefined;
  try {
    const form = await req.formData();
    file = form.get("file") as File | null;
    const lang = form.get("language");
    if (lang === "ta" || lang === "hi" || lang === "en") language = lang;
  } catch {
    return NextResponse.json({ error: "expected multipart form-data with a file" }, { status: 400 });
  }
  if (!file) {
    return NextResponse.json({ error: "audio file required" }, { status: 400 });
  }

  try {
    const buf = await file.arrayBuffer();
    const result = await transcribeViaRouter(buf, file.name || "audio.webm", apiKey, language);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: `0G STT failed: ${(e as Error).message}` },
      { status: 502 },
    );
  }
}
