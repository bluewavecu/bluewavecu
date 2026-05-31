"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { authInputClassName } from "@/components/auth/AuthField";
import { cn } from "@/lib/utils";

type PasswordInputProps = {
  id: string;
  name: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  pattern?: string;
  placeholder?: string;
  className?: string;
};

export function PasswordInput({
  id,
  name,
  autoComplete,
  required,
  minLength,
  maxLength,
  value,
  onChange,
  inputMode,
  pattern,
  placeholder,
  className,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative flex w-full min-w-0 items-center">
      <input
        id={id}
        type={visible ? "text" : "password"}
        name={name}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
        value={value}
        onChange={onChange}
        inputMode={inputMode}
        pattern={pattern}
        placeholder={placeholder}
        className={cn(authInputClassName, "pr-10", className)}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        className="absolute right-0 inline-flex h-9 w-9 items-center justify-center rounded-md text-royal-blue transition hover:text-ocean-blue dark:text-light-blue"
        aria-label={visible ? "Hide value" : "Show value"}
      >
        {visible ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
      </button>
    </div>
  );
}
