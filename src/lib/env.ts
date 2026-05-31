import { z } from "zod";
import { readEnv, resolveDatabaseUrl } from "@/lib/databaseEnv";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z
    .string()
    .min(16, "JWT_SECRET must be at least 16 characters for production safety"),
  NEXT_PUBLIC_APP_URL: z.string().url("NEXT_PUBLIC_APP_URL must be a valid URL"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  ADMIN_ALERT_EMAIL: z.string().email("ADMIN_ALERT_EMAIL must be a valid email").optional(),
  CRON_SECRET: z.string().optional(),
});

export type ServerEnv = z.infer<typeof envSchema>;

let cachedEnv: ServerEnv | null = null;

function formatEnvErrors(error: z.ZodError) {
  return error.issues
    .map((issue) => `- ${issue.path.join(".") || "env"}: ${issue.message}`)
    .join("\n");
}

function readNodeEnv() {
  const value = readEnv("NODE_ENV");

  if (value === "development" || value === "production" || value === "test") {
    return value;
  }

  return "development";
}

export function getServerEnv(): ServerEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const databaseUrl = resolveDatabaseUrl();

  if (!databaseUrl) {
    throw new Error(
      "Environment validation failed:\n- DATABASE_URL: required (set POSTGRES_URL_NON_POOLING, POSTGRES_PRISMA_URL, DATABASE_URL, or POSTGRES_URL)",
    );
  }

  const result = envSchema.safeParse({
    DATABASE_URL: databaseUrl,
    JWT_SECRET: readEnv("JWT_SECRET"),
    NEXT_PUBLIC_APP_URL: readEnv("NEXT_PUBLIC_APP_URL"),
    NODE_ENV: readNodeEnv(),
    RESEND_API_KEY: readEnv("RESEND_API_KEY"),
    EMAIL_FROM: readEnv("EMAIL_FROM"),
    ADMIN_ALERT_EMAIL: readEnv("ADMIN_ALERT_EMAIL"),
    CRON_SECRET: readEnv("CRON_SECRET"),
  });

  if (!result.success) {
    throw new Error(`Environment validation failed:\n${formatEnvErrors(result.error)}`);
  }

  cachedEnv = result.data;
  return cachedEnv;
}

export function tryGetServerEnv(): ServerEnv | null {
  try {
    return getServerEnv();
  } catch {
    return null;
  }
}
