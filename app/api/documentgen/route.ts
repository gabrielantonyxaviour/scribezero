import { NextResponse } from "next/server";

import { generateVerifiable } from "@/lib/0g/compute";
import {
  buildDocumentMessages,
  parseGeneratedDocument,
  validateDocumentInput,
  type DocumentGenerationInput,
} from "@/lib/documents/generation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  let input: DocumentGenerationInput;
  try {
    input = validateDocumentInput(await req.json());
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || "invalid body" }, { status: 400 });
  }

  try {
    const { content, proof, fallback } = await generateVerifiable(buildDocumentMessages(input));
    if (proof.verified !== true && !fallback) {
      return NextResponse.json(
        {
          error: `0G Compute proof did not verify for provider ${proof.provider || "unknown"} and proof ${proof.chatID || "missing"}`,
        },
        { status: 502 },
      );
    }
    const document = parseGeneratedDocument(content, input);
    return NextResponse.json({ document, proof, fallback });
  } catch (error) {
    return NextResponse.json(
      { error: `0G Compute document generation failed: ${(error as Error).message}` },
      { status: 502 },
    );
  }
}
