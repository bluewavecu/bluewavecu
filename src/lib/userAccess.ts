import type { UserStatus } from "@/types/banking";

const BLOCKED_LOGIN_STATUSES: UserStatus[] = ["SUSPENDED", "ON_HOLD", "DISABLED"];

export function getLoginBlockMessage(params: {
  status: UserStatus;
  deletedAt: Date | null;
}) {
  if (params.deletedAt) {
    return "This account has been closed. Contact member services to request reinstatement.";
  }

  if (params.status === "SUSPENDED") {
    return "This account is suspended. Contact member services for assistance.";
  }

  if (params.status === "ON_HOLD") {
    return "This account is on hold. Contact member services for assistance.";
  }

  if (params.status === "DISABLED") {
    return "This account is disabled. Contact member services for assistance.";
  }

  return null;
}

export function isLoginBlocked(params: { status: UserStatus; deletedAt: Date | null }) {
  return Boolean(getLoginBlockMessage(params));
}

export function getTransactionBlockMessage(params: {
  status: UserStatus;
  deletedAt: Date | null;
}) {
  if (params.deletedAt) {
    return "Your account is closed and cannot initiate transactions.";
  }

  if (params.status !== "ACTIVE") {
    if (params.status === "PENDING") {
      return "Your membership is pending review. Transfers are unavailable until your account is activated.";
    }

    if (params.status === "SUSPENDED") {
      return "Your account is suspended and cannot initiate transactions.";
    }

    if (params.status === "ON_HOLD") {
      return "Your account is on hold and cannot initiate transactions.";
    }

    if (params.status === "DISABLED") {
      return "Your account is disabled and cannot initiate transactions.";
    }

    return "Your account cannot initiate transactions right now.";
  }

  return null;
}

export function canUserTransact(params: { status: UserStatus; deletedAt: Date | null }) {
  return !getTransactionBlockMessage(params);
}

export function shouldRevokeSessionsOnStatusChange(nextStatus: UserStatus) {
  return BLOCKED_LOGIN_STATUSES.includes(nextStatus);
}

export function isUserDeleted(deletedAt: Date | null) {
  return Boolean(deletedAt);
}
