import type { AccountType } from "@/types/banking";

export const accountDisplayNames: Record<AccountType, string> = {
  CHECKING: "Bluewave Everyday Checking",
  SAVINGS: "High Tide Savings",
  CREDIT: "Bluewave Rewards Credit",
};

export function maskAccountNumber(accountNumber: string) {
  const last4 = accountNumber.slice(-4);

  return {
    last4,
    masked: `**** ${last4}`,
  };
}

export function getAccountDisplayName(accountType: AccountType) {
  return accountDisplayNames[accountType];
}
