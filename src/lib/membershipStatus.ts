import type { UserStatus } from "@/types/banking";

type StatusBadgeTone = "default" | "success" | "warning" | "danger" | "info";

export function formatMembershipStatusLabel(status: UserStatus | string): string {
  switch (status) {
    case "PENDING":
      return "Pending activation";
    case "ACTIVE":
      return "Active";
    case "SUSPENDED":
      return "Suspended";
    case "ON_HOLD":
      return "On hold";
    case "DISABLED":
      return "Disabled";
    default:
      return status
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
}

export function membershipStatusTone(status: UserStatus | string): StatusBadgeTone {
  switch (status) {
    case "ACTIVE":
      return "success";
    case "PENDING":
    case "ON_HOLD":
      return "warning";
    case "SUSPENDED":
    case "DISABLED":
      return "danger";
    default:
      return "default";
  }
}
