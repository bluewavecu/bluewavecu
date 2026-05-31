export const SIGNUP_ANNUAL_INCOME_OPTIONS = [
  {
    value: "10000-30000",
    label: "$10,000 to $30,000",
    amount: 30000,
  },
  {
    value: "30000-50000",
    label: "$30,000 to $50,000",
    amount: 50000,
  },
  {
    value: "50000-80000",
    label: "$50,000 to $80,000",
    amount: 80000,
  },
  {
    value: "80000-150000",
    label: "$80,000 to $150,000",
    amount: 150000,
  },
] as const;

export type SignupAnnualIncomeRange = (typeof SIGNUP_ANNUAL_INCOME_OPTIONS)[number]["value"];

export const SIGNUP_ANNUAL_INCOME_VALUES = SIGNUP_ANNUAL_INCOME_OPTIONS.map(
  (option) => option.value,
) as [SignupAnnualIncomeRange, ...SignupAnnualIncomeRange[]];

export function getSignupAnnualIncomeAmount(value: SignupAnnualIncomeRange) {
  return SIGNUP_ANNUAL_INCOME_OPTIONS.find((option) => option.value === value)?.amount ?? null;
}
