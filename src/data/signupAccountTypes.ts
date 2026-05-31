import type { AccountType } from "@/types/banking";

export type SignupAccountType = Extract<
  AccountType,
  "SAVINGS" | "CHECKING" | "BUSINESS" | "MONEY_MARKET" | "CERTIFICATE"
>;

export const SIGNUP_ACCOUNT_TYPE_OPTIONS: Array<{
  value: SignupAccountType;
  label: string;
  description: string;
  required?: boolean;
}> = [
  {
    value: "SAVINGS",
    label: "Savings account",
    description: "Required membership share savings for all Bluewave members.",
    required: true,
  },
  {
    value: "CHECKING",
    label: "Checking account",
    description: "Everyday spending, debit access, and direct deposit.",
  },
  {
    value: "BUSINESS",
    label: "Business checking",
    description: "Deposits and payments for sole proprietors and small businesses.",
  },
  {
    value: "MONEY_MARKET",
    label: "Money market account",
    description: "Higher-yield savings with limited check writing.",
  },
  {
    value: "CERTIFICATE",
    label: "Certificate of deposit (CD)",
    description: "Fixed-term savings with a locked-in rate.",
  },
];

export const DEFAULT_SIGNUP_ACCOUNT_TYPES: SignupAccountType[] = ["SAVINGS"];

export const SIGNUP_ACCOUNT_TYPE_VALUES = SIGNUP_ACCOUNT_TYPE_OPTIONS.map(
  (option) => option.value,
) as [SignupAccountType, ...SignupAccountType[]];

export function formatSignupAccountTypes(accountTypes: SignupAccountType[]) {
  return accountTypes
    .map((accountType) => {
      const option = SIGNUP_ACCOUNT_TYPE_OPTIONS.find((item) => item.value === accountType);
      return option?.label ?? accountType;
    })
    .join(", ");
}
