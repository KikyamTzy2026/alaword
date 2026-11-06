// Copies Ably's prebuilt browser bundle into /public/vendor so the client can load it
// as a plain script (Next's compiler cannot re-transpile it). Runs on postinstall.
import { copyFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "node_modules", "ably", "build", "ably.min.js");
const destDir = join(root, "public", "vendor");
if (!existsSync(src)) {
  console.error("[copy-ably] ably.min.js not found - did `npm install` finish?");
  process.exit(1);
}
mkdirSync(destDir, { recursive: true });
copyFileSync(src, join(destDir, "ably.min.js"));
console.log("[copy-ably] copied ably.min.js -> public/vendor");
