import { NextResponse } from "next/server";
import {
  BROKER_MIN_LEDGER_OG,
  getLastComputeFallback,
  getLastComputeFundingFailure,
} from "@/lib/0g/compute";
import { ZEROG_ENABLED, getWallet, getBalance, ZEROG_INDEXER, ZEROG_RPC } from "@/lib/0g/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const routerConfigured = Boolean(process.env.ZEROG_ROUTER_API_KEY);
  const kvConfigured = Boolean(process.env.ZEROG_KV_RPC && process.env.ZEROG_KV_STREAM_ID);
  const registryAddress = process.env.NEXT_PUBLIC_ZEROG_REGISTRY_ADDRESS || "";
  const registryConfigured = /^0x[0-9a-fA-F]{40}$/.test(registryAddress);
  const integrations = {
    storage: {
      configured: ZEROG_ENABLED,
      rpc: ZEROG_RPC,
      indexer: ZEROG_INDEXER,
    },
    computeRouter: {
      configured: routerConfigured,
      endpoint:
        process.env.ZEROG_COMPUTE_ROUTER || "https://router-api-testnet.integratenetwork.work/v1",
    },
    sttRouter: {
      configured: routerConfigured,
      model: process.env.ZEROG_STT_MODEL || "whisper-large-v3",
    },
    kv: {
      configured: kvConfigured,
      rpc: process.env.ZEROG_KV_RPC ? "configured" : "missing",
      streamId: process.env.ZEROG_KV_STREAM_ID ? "configured" : "missing",
    },
    registry: {
      configured: registryConfigured,
      address: registryConfigured ? registryAddress : "missing",
    },
  };
  if (!ZEROG_ENABLED) {
    return NextResponse.json({
      enabled: false,
      mode: "unconfigured",
      error: "ZEROG_PRIVATE_KEY is not set; ScribeZero cannot seal records without 0G Storage.",
      integrations,
    });
  }
  try {
    const address = getWallet().address;
    const balance = await getBalance();
    const funded = Number(balance) > 0;
    const brokerFunded = Number(balance) >= BROKER_MIN_LEDGER_OG;
    const computeFundingFailure = getLastComputeFundingFailure();
    const computeFallback = getLastComputeFallback();
    const errors = [
      !funded ? "0G storage signer has no native 0G for transactions" : "",
      !routerConfigured ? "ZEROG_ROUTER_API_KEY is not set; STT and Compute cannot run through 0G Router" : "",
      routerConfigured && !brokerFunded
        ? `Direct 0G Compute broker fallback needs ${BROKER_MIN_LEDGER_OG} OG; server wallet has ${balance} OG`
        : "",
      !kvConfigured ? "ZEROG_KV_RPC and ZEROG_KV_STREAM_ID are not set; 0G KV indexing is unavailable" : "",
      !registryConfigured
        ? "NEXT_PUBLIC_ZEROG_REGISTRY_ADDRESS is not set; onboarding cannot register doctor profiles on 0G Chain"
        : "",
    ].filter(Boolean);
    return NextResponse.json({
      enabled: true,
      mode: funded && routerConfigured && registryConfigured && kvConfigured ? "live" : "not_ready",
      address,
      balance,
      funded,
      computeBroker: {
        minimumLedgerFunding: `${BROKER_MIN_LEDGER_OG}`,
        funded: brokerFunded,
      },
      computeFundingFailure,
      computeFallback,
      integrations,
      warnings: errors,
    });
  } catch (e) {
    return NextResponse.json(
      { enabled: false, mode: "error", error: String((e as Error).message), integrations },
      { status: 200 },
    );
  }
}
