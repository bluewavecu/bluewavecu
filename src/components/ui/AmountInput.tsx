"use client";

import { formatAmountInput } from "@/lib/amountInput";
import { cn } from "@/lib/utils";

type AmountInputProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  id?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  "aria-label"?: string;
};

export function AmountInput({
  value,
  onChange,
  className,
  placeholder = "0.00",
  ...props
}: AmountInputProps) {
  return (
    <input
      {...props}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(formatAmountInput(event.target.value))}
      className={cn(className)}
    />
  );
}
