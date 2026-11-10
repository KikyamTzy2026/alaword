import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ablyRest } from "@/lib/ably";
import { errMsg } from "@/lib/game";

export const dynamic = "force-dynamic";

// Open /api/health in the browser to see which part of the setup is broken. Returns no secrets.
export async function GET() {
  const out: any = {
    sdk: "ably-pubsub-v3", // if this field is missing, the deployed code is old
    env: {
      DATABASE_URL: !!(process.env.DATABASE_URL || process.env.POSTGRES_URL),
      ABLY_API_KEY: !!process.env.ABLY_API_KEY,
      CRON_SECRET: !!process.env.CRON_SECRET,
    },
  };
  try { await db()`SELECT 1`; out.database = "ok"; } catch (e) { out.database = errMsg(e); }
  try {
    await ablyRest().auth.createTokenRequest({ clientId: "health", capability: JSON.stringify({ "wh-test": ["subscribe"] }) });
    out.ably = "ok";
  } catch (e: any) {
    out.ably = "FAILED: " + String(e?.message || e).slice(0, 200);
  }
  return NextResponse.json(out, { status: out.database === "ok" && out.ably === "ok" ? 200 : 500 });
}
