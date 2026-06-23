import { NextResponse } from "next/server";
import { NETWORK } from "@/lib/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isRootHash(value: string) {
  return /^0x[a-fA-F0-9]{64}$/.test(value);
}

export async function GET(req: Request) {
  const root = new URL(req.url).searchParams.get("root")?.trim() ?? "";
  if (!isRootHash(root)) {
    return NextResponse.json({ error: "valid 0G storage root required" }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${NETWORK.indexer}/file?root=${root}`, {
      method: "GET",
      cache: "no-store",
    });
    const body = await upstream.text();
    if (!upstream.ok) {
      return NextResponse.json(
        { error: `0G Storage download failed with ${upstream.status}`, body },
        { status: 502 },
      );
    }

    return new NextResponse(body, {
      status: 200,
      headers: {
        "content-type": upstream.headers.get("content-type") ?? "application/json",
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: `0G Storage download failed: ${(error as Error).message}` },
      { status: 502 },
    );
  }
}
