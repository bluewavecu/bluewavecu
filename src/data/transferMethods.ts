export const TRANSFER_METHOD_OPTIONS = [
  { value: "DIRECT_DEPOSIT", label: "Direct deposit" },
  { value: "WIRE", label: "Wire transfer" },
  { value: "INTERNATIONAL_WIRE", label: "International wire" },
] as const;

export type TransferMethod = (typeof TRANSFER_METHOD_OPTIONS)[number]["value"];

export const TRANSFER_METHOD_VALUES = TRANSFER_METHOD_OPTIONS.map(
  (option) => option.value,
) as [TransferMethod, ...TransferMethod[]];

export function getTransferMethodLabel(method: TransferMethod) {
  return TRANSFER_METHOD_OPTIONS.find((option) => option.value === method)?.label ?? method;
}

export function isInternationalWireMethod(method: TransferMethod) {
  return method === "INTERNATIONAL_WIRE";
}

export function isDomesticWireMethod(method: TransferMethod) {
  return method === "WIRE";
}
