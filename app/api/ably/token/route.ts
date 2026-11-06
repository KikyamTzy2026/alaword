import { NextResponse } from "next/server";
import { ablyRest, roomChannel, selChannel } from "@/lib/ably";
import { normCode, verifyCreds } from "@/lib/game";

export const dynamic = "force-dynamic";

/**
 * Issues a short-lived Ably token scoped to ONE room. The root API key never leaves the server.
 * - everyone: subscribe + presence on the room channel (server-published events, audience count)
 * - players:  may also publish live drag previews on the selection channel
 * - spectators: subscribe-only, so they cannot influence anything
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const code = normCode(body?.code);
    const me = await verifyCreds(code, String(body?.memberId ?? ""), String(body?.secret ?? ""));
    if (me === "gone") return NextResponse.json({ ok: false, error: "Room not found" }, { status: 404 });
    if (!me) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    const capability = {
      [roomChannel(code)]: ["subscribe", "presence"],
      [selChannel(code)]: me.role === "player" ? ["subscribe", "publish"] : ["subscribe"],
    };
    const token = await ablyRest().auth.createTokenRequest({
      clientId: me.id,
      capability: JSON.stringify(capability),
      ttl: 60 * 60 * 1000,
    });
    return NextResponse.json(token, { headers: { "cache-control": "no-store" } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
