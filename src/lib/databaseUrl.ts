import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { assertDatabaseUrl, shouldUseSsl, stripSslModeParam } from "@/lib/databaseEnv";

/** Explicit pg pool for `@prisma/adapter-pg` on serverless + Supabase TLS. */
export function createPrismaPgAdapter(connectionString = assertDatabaseUrl("Prisma")) {
  const sanitizedConnectionString = stripSslModeParam(connectionString);

  const pool = new pg.Pool({
    connectionString: sanitizedConnectionString,
    ssl: shouldUseSsl(connectionString)
      ? {
          rejectUnauthorized: false,
          checkServerIdentity: () => undefined,
        }
      : undefined,
    max: 1,
    idleTimeoutMillis: 5_000,
    connectionTimeoutMillis: 10_000,
  });

  return new PrismaPg(pool);
}

export { assertDatabaseUrl, readEnv, resolveDatabaseUrl } from "@/lib/databaseEnv";
