import type { UserStatus } from "@/types/banking";

const LOGIN_BLOCKED_STATUSES: UserStatus[] = ["ON_HOLD", "DISABLED"];
const SESSION_REVOKE_STATUSES: UserStatus[] = ["ON_HOLD", "DISABLED"];

type UserAccessParams = {
  status: UserStatus;
  deletedAt: Date | null;
};

export function getLoginBlockMessage(params: UserAccessParams) {
  if (params.deletedAt) {
    return "This account has been closed. Contact member services to request reinstatement.";
  }

  if (params.status === "ON_HOLD") {
    return "This account is on hold. Contact member services for assistance.";
  }

  if (params.status === "DISABLED") {
    return "This account is disabled. Contact member services for assistance.";
  }

  return null;
}

export function isLoginBlocked(params: UserAccessParams) {
  return Boolean(getLoginBlockMessage(params));
}

export function getTransactionBlockMessage(params: UserAccessParams) {
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

export function canUserTransact(params: UserAccessParams) {
  return !getTransactionBlockMessage(params);
}

export function getAccountModificationBlockMessage(params: UserAccessParams) {
  if (params.deletedAt) {
    return "Your account is closed and cannot be updated.";
  }

  if (params.status === "SUSPENDED") {
    return "Your account is suspended. You can view balances and activity, but transfers and account changes are unavailable. Contact member services for assistance.";
  }

  if (params.status === "ON_HOLD") {
    return "Your account is on hold and cannot be updated.";
  }

  if (params.status === "DISABLED") {
    return "Your account is disabled and cannot be updated.";
  }

  return null;
}

export function canUserModifyAccount(params: UserAccessParams) {
  return !getAccountModificationBlockMessage(params);
}

export function isAccountReadOnly(params: UserAccessParams) {
  return !canUserModifyAccount(params);
}

export function shouldRevokeSessionsOnStatusChange(nextStatus: UserStatus) {
  return SESSION_REVOKE_STATUSES.includes(nextStatus);
}

export function isLoginBlockedStatus(status: UserStatus) {
  return LOGIN_BLOCKED_STATUSES.includes(status);
}

export function isUserDeleted(deletedAt: Date | null) {
  return Boolean(deletedAt);
}
