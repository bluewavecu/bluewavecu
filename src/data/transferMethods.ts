export const TRANSFER_METHOD_OPTIONS = [
  { value: "DIRECT_DEPOSIT", label: "Direct deposit" },
  { value: "ACH", label: "ACH" },
  { value: "WIRE", label: "Wire transfer ($30 fee applies)" },
] as const;

export type TransferMethod = (typeof TRANSFER_METHOD_OPTIONS)[number]["value"];

export const TRANSFER_METHOD_VALUES = TRANSFER_METHOD_OPTIONS.map(
  (option) => option.value,
) as [TransferMethod, ...TransferMethod[]];

export function getTransferMethodLabel(method: TransferMethod) {
  return TRANSFER_METHOD_OPTIONS.find((option) => option.value === method)?.label ?? method;
}
