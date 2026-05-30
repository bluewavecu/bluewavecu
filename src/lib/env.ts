import { z } from "zod";

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
});

export type ServerEnv = z.infer<typeof envSchema>;

let cachedEnv: ServerEnv | null = null;

function formatEnvErrors(error: z.ZodError) {
  return error.issues
    .map((issue) => `- ${issue.path.join(".") || "env"}: ${issue.message}`)
    .join("\n");
}

export function getServerEnv(): ServerEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const result = envSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NODE_ENV: process.env.NODE_ENV,
    RESEND_API_KEY: process.env.RESEND_API_KEY?.trim() || undefined,
    EMAIL_FROM: process.env.EMAIL_FROM?.trim() || undefined,
    ADMIN_ALERT_EMAIL: process.env.ADMIN_ALERT_EMAIL?.trim() || undefined,
  });

  if (!result.success) {
    throw new Error(`Environment validation failed:\n${formatEnvErrors(result.error)}`);
  }

  if (result.data.NODE_ENV === "production" && !result.data.RESEND_API_KEY) {
    throw new Error(
      "Environment validation failed:\n- RESEND_API_KEY: required in production",
    );
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
