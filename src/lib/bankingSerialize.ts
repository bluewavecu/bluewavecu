import type { AccountType } from "@/types/banking";

export const accountDisplayNames: Record<AccountType, string> = {
  CHECKING: "Bluewave Everyday Checking",
  SAVINGS: "High Tide Savings",
  BUSINESS: "Bluewave Business Checking",
  MONEY_MARKET: "Bluewave Money Market",
  CERTIFICATE: "Bluewave Certificate (CD)",
  CREDIT: "Bluewave Rewards Credit",
};

export function formatAccountNumberForDisplay(accountNumber: string) {
  const digits = accountNumber.replace(/\D/g, "");

  if (!digits) {
    return accountNumber;
  }

  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

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
