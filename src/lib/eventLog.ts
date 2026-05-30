import type { Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";
import type { EventSeverity } from "@/types/banking";

const SENSITIVE_KEYS = new Set([
  "password",
  "passwordhash",
  "token",
  "secret",
  "authorization",
  "cookie",
  "jwt",
  "apikey",
  "api_key",
]);

type SafeMetadata = Record<string, string | number | boolean | null>;

function sanitizeMetadata(metadata?: Record<string, unknown>): Prisma.InputJsonValue | undefined {
  if (!metadata) {
    return undefined;
  }

  const safe: SafeMetadata = {};

  for (const [key, value] of Object.entries(metadata)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      continue;
    }

    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      value === null
    ) {
      safe[key] = value;
    }
  }

  return Object.keys(safe).length > 0 ? safe : undefined;
}

export async function writeEventLog(params: {
  eventType: string;
  entityType: string;
  message: string;
  actorId?: string | null;
  entityId?: string | null;
  severity?: EventSeverity;
  metadata?: Record<string, unknown>;
}) {
  try {
    return await getPrisma().eventLog.create({
      data: {
        eventType: params.eventType,
        actorId: params.actorId ?? null,
        entityType: params.entityType,
        entityId: params.entityId ?? null,
        severity: params.severity ?? "INFO",
        message: params.message,
        metadata: sanitizeMetadata(params.metadata),
      },
    });
  } catch (error) {
    console.error("[event-log] failed to write", params.eventType, error);
    return null;
  }
}

export function writeSecurityEvent(params: {
  eventType: string;
  message: string;
  actorId?: string | null;
  entityId?: string | null;
  severity?: EventSeverity;
  metadata?: Record<string, unknown>;
}) {
  return writeEventLog({
    ...params,
    entityType: "Security",
    severity: params.severity ?? "WARNING",
  });
}

export function writeLedgerEvent(params: {
  eventType: string;
  message: string;
  actorId?: string | null;
  entityId?: string | null;
  severity?: EventSeverity;
  metadata?: Record<string, unknown>;
}) {
  return writeEventLog({
    ...params,
    entityType: "Ledger",
    severity: params.severity ?? "INFO",
  });
}

export function writeAdminEvent(params: {
  eventType: string;
  message: string;
  actorId?: string | null;
  entityId?: string | null;
  severity?: EventSeverity;
  metadata?: Record<string, unknown>;
}) {
  return writeEventLog({
    ...params,
    entityType: "Admin",
    severity: params.severity ?? "INFO",
  });
}

export function writeSystemErrorEvent(params: {
  eventType: string;
  message: string;
  entityType?: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  return writeEventLog({
    eventType: params.eventType,
    entityType: params.entityType ?? "System",
    entityId: params.entityId ?? null,
    message: params.message,
    severity: "ERROR",
    metadata: params.metadata,
  });
}

export function serializeEventLog(record: {
  id: string;
  eventType: string;
  actorId: string | null;
  entityType: string;
  entityId: string | null;
  severity: EventSeverity;
  message: string;
  metadata: unknown;
  createdAt: Date;
}) {
  return {
    id: record.id,
    eventType: record.eventType,
    actorId: record.actorId,
    entityType: record.entityType,
    entityId: record.entityId,
    severity: record.severity,
    message: record.message,
    metadata: record.metadata,
    createdAt: record.createdAt.toISOString(),
  };
}
