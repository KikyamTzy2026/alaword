import { neon } from "@neondatabase/serverless";

type Sql = (strings: TemplateStringsArray, ...values: any[]) => Promise<any[]>;
let client: Sql | undefined;

/** Lazily creates the Neon HTTP client (server-side only; reads the secret from env). */
export function db() {
  if (!client) {
    const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    client = neon(url) as unknown as Sql;
  }
  return client;
}
