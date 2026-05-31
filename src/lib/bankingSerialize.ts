import type { AccountType } from "@/types/banking";

export const accountDisplayNames: Record<AccountType, string> = {
  CHECKING: "Bluewave Everyday Checking",
  SAVINGS: "High Tide Savings",
  BUSINESS: "Bluewave Business Checking",
  MONEY_MARKET: "Bluewave Money Market",
  CERTIFICATE: "Bluewave Certificate (CD)",
  CREDIT: "Bluewave Rewards Credit",
};

export function maskAccountNumber(accountNumber: string | null | undefined) {
  if (!accountNumber) {
    return {
      last4: "----",
      masked: "Pending assignment",
    };
  }

  const last4 = accountNumber.slice(-4);

  return {
    last4,
    masked: `**** ${last4}`,
  };
}

export function getAccountDisplayName(accountType: AccountType) {
  return accountDisplayNames[accountType];
}

export function isAccountReadyForBanking(status: string, accountNumber?: string | null) {
  return status === "ACTIVE" && Boolean(accountNumber);
}
