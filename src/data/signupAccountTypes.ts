import type { AccountType } from "@/types/banking";

export type SignupAccountType = Extract<
  AccountType,
  "SAVINGS" | "CHECKING" | "BUSINESS" | "MONEY_MARKET" | "CERTIFICATE"
>;

export type SignupAccountSelection = "SAVINGS_ONLY" | Exclude<SignupAccountType, "SAVINGS">;

export const SIGNUP_ACCOUNT_TYPE_OPTIONS: Array<{
  value: SignupAccountType;
  label: string;
  description: string;
}> = [
  {
    value: "SAVINGS",
    label: "Savings account",
    description: "Membership share savings included for every member.",
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

export const SIGNUP_ACCOUNT_SELECTION_OPTIONS: Array<{
  value: SignupAccountSelection;
  label: string;
}> = [
  { value: "SAVINGS_ONLY", label: "No additional account" },
  ...SIGNUP_ACCOUNT_TYPE_OPTIONS.filter((option) => option.value !== "SAVINGS").map((option) => ({
    value: option.value as Exclude<SignupAccountType, "SAVINGS">,
    label: option.label,
  })),
];

export const DEFAULT_SIGNUP_ACCOUNT_SELECTION: SignupAccountSelection = "CHECKING";

export function resolveSignupAccountTypes(selection: SignupAccountSelection): SignupAccountType[] {
  if (selection === "SAVINGS_ONLY") {
    return ["SAVINGS"];
  }

  return ["SAVINGS", selection];
}

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
