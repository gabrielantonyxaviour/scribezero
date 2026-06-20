import { NextResponse } from "next/server";
import { ZEROG_ENABLED, getWallet, getBalance } from "@/lib/0g/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!ZEROG_ENABLED) {
    return NextResponse.json({ enabled: false, mode: "mock" });
  }
  try {
    const address = getWallet().address;
    const balance = await getBalance();
    const funded = Number(balance) > 0;
    return NextResponse.json({
      enabled: true,
      mode: funded ? "live" : "unfunded",
      address,
      balance,
      funded,
    });
  } catch (e) {
    return NextResponse.json(
      { enabled: false, mode: "error", error: String((e as Error).message) },
      { status: 200 },
    );
  }
}
