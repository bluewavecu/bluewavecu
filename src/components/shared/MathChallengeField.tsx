"use client";

import { useEffect, useRef, useState } from "react";
import { AuthField, authInputClassName } from "@/components/auth/AuthField";
import { Calculator } from "lucide-react";

type MathChallengeFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onTokenChange: (token: string) => void;
  inputClassName?: string;
  labelPrefix?: string;
};

export function MathChallengeField({
  value,
  onChange,
  onTokenChange,
  inputClassName = authInputClassName,
  labelPrefix,
}: MathChallengeFieldProps) {
  const [question, setQuestion] = useState("");
  const onChangeRef = useRef(onChange);
  const onTokenChangeRef = useRef(onTokenChange);

  onChangeRef.current = onChange;
  onTokenChangeRef.current = onTokenChange;

  useEffect(() => {
    let cancelled = false;

    void fetch("/api/captcha/math", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: { success: boolean; data?: { question: string; token: string } }) => {
        if (cancelled || !payload.success || !payload.data) {
          return;
        }

        setQuestion(payload.data.question);
        onTokenChangeRef.current(payload.data.token);
        onChangeRef.current("");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const label = question ? `${labelPrefix ?? ""}${question} =`.trim() : "Verification";

  return (
    <AuthField label={label} htmlFor="math-challenge" icon={Calculator}>
      <input
        id="math-challenge"
        type="text"
        name="mathAnswer"
        inputMode="numeric"
        autoComplete="off"
        required
        value={value}
        onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, 2))}
        className={inputClassName}
      />
    </AuthField>
  );
}
