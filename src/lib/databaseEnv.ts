const RUNTIME_DATABASE_URL_KEYS = [
  "POSTGRES_URL_NON_POOLING",
  "POSTGRES_PRISMA_URL",
  "DATABASE_URL",
  "POSTGRES_URL",
] as const;

const MIGRATION_DATABASE_URL_KEYS = [
  "POSTGRES_URL_NON_POOLING",
  "DATABASE_URL",
  "POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
] as const;

export function readEnv(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function pickFirstEnv(keys: readonly string[]) {
  for (const key of keys) {
    const value = readEnv(key);

    if (value) {
      return value;
    }
  }

  return undefined;
}

export function shouldUseSsl(connectionString: string) {
  return (
    connectionString.includes("supabase.com") ||
    connectionString.includes("supabase.co") ||
    (!connectionString.includes("localhost") && !connectionString.includes("127.0.0.1"))
  );
}

/** Remove sslmode from the URL so pg uses our explicit pool SSL config. */
export function stripSslModeParam(connectionString: string) {
  const stripped = connectionString
    .replace(/([?&])sslmode=[^&]*(?=&|$)/g, "$1")
    .replace(/[?&]$/, "")
    .replace(/\?&/g, "?");

  return stripped === "?" ? connectionString.replace(/\?$/, "") : stripped;
}

/** Runtime Prisma connections — prefer direct/non-pooled Supabase URLs on serverless. */
export function resolveDatabaseUrl() {
  return pickFirstEnv(RUNTIME_DATABASE_URL_KEYS);
}

/** Build-time migrations — never use the transaction pooler (port 6543). */
export function resolveMigrationDatabaseUrl() {
  return pickFirstEnv(MIGRATION_DATABASE_URL_KEYS);
}

export function assertDatabaseUrl(context: string) {
  const url = resolveDatabaseUrl();

  if (!url) {
    throw new Error(
      `${context}: database URL is not configured. Set POSTGRES_URL_NON_POOLING (preferred), POSTGRES_PRISMA_URL, DATABASE_URL, or POSTGRES_URL.`,
    );
  }

  return url;
}
