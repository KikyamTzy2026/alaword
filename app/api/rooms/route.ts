import { NextResponse } from "next/server";
import { createRoom } from "@/lib/game";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const out = await createRoom(body?.nickname);
    return NextResponse.json(out.body, { status: out.status });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
