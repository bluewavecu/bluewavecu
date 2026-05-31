import type { AccountType } from "@/types/banking";

const displayOrder: Partial<Record<AccountType, number>> = {
  CHECKING: 10,
  BUSINESS: 20,
  MONEY_MARKET: 30,
  CERTIFICATE: 40,
  CREDIT: 50,
  SAVINGS: 100,
};

export function getMemberAccountDisplayOrder(accountType: AccountType) {
  return displayOrder[accountType] ?? 60;
}

export function sortMemberDisplayAccounts<T extends { accountType: AccountType }>(accounts: T[]) {
  return [...accounts].sort(
    (left, right) =>
      getMemberAccountDisplayOrder(left.accountType) -
      getMemberAccountDisplayOrder(right.accountType),
  );
}
