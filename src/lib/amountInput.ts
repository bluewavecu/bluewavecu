/**
 * Format a currency amount string as the user types (e.g. 23000 -> 23,000.00).
 */
export function formatAmountInput(raw: string): string {
  const cleaned = raw.replace(/,/g, "").replace(/[^\d.]/g, "");

  if (!cleaned) {
    return "";
  }

  const dotIndex = cleaned.indexOf(".");
  const integerRaw = dotIndex === -1 ? cleaned : cleaned.slice(0, dotIndex);
  const decimalRaw =
    dotIndex === -1 ? undefined : cleaned.slice(dotIndex + 1).replace(/\./g, "").slice(0, 2);

  if (cleaned.startsWith(".")) {
    return `0.${decimalRaw ?? ""}`;
  }

  const integerDigits = integerRaw.replace(/^0+(?=\d)/, "");
  const formattedInteger = integerDigits
    ? Number(integerDigits).toLocaleString("en-US")
    : decimalRaw !== undefined
      ? "0"
      : "";

  if (decimalRaw !== undefined) {
    return `${formattedInteger || "0"}.${decimalRaw}`;
  }

  return formattedInteger;
}

/**
 * Parse a formatted amount string into a positive number, or null if invalid.
 */
export function parseAmountInput(value: string): number | null {
  const normalized = value.replace(/,/g, "").trim();

  if (!normalized || normalized === ".") {
    return null;
  }

  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    return null;
  }

  const parsed = Number.parseFloat(normalized);

  if (Number.isNaN(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

/**
 * Normalize amount values that may include grouping commas (for API/schema preprocessing).
 */
export function normalizeAmountValue(value: unknown): unknown {
  if (typeof value === "string") {
    const cleaned = value.replace(/,/g, "").trim();
    return cleaned === "" ? undefined : cleaned;
  }

  return value;
}
