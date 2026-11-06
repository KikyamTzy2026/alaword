import * as Ably from "ably";

let rest: Ably.Rest | undefined;

export function ablyRest() {
  if (!rest) {
    const key = process.env.ABLY_API_KEY;
    if (!key) throw new Error("ABLY_API_KEY is not set");
    rest = new Ably.Rest({ key });
  }
  return rest;
}

export const roomChannel = (code: string) => `wh-${code}`; // server -> clients (state events), presence
export const selChannel = (code: string) => `wh-sel-${code}`; // players -> everyone (live drag previews)

export async function publish(code: string, name: string, data: unknown) {
  try {
    await ablyRest().channels.get(roomChannel(code)).publish(name, data);
  } catch (e) {
    console.error("[ably] publish failed", e);
  }
}
export const publishSync = (code: string) => publish(code, "sync", { t: Date.now() });
