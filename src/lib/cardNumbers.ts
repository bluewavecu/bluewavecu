import { randomInt } from "crypto";

export const MASTERCARD_BIN_PREFIX = "552901";

function computeLuhnCheckDigit(digits: string) {
  let sum = 0;
  let shouldDouble = true;

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number.parseInt(digits[index] ?? "0", 10);

    if (shouldDouble) {
      digit *= 2;

      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return String((10 - (sum % 10)) % 10);
}

export function generateMastercardPan(prefix = MASTERCARD_BIN_PREFIX) {
  let body = prefix;

  while (body.length < 15) {
    body += String(randomInt(0, 10));
  }

  const pan = `${body}${computeLuhnCheckDigit(body)}`;

  return {
    pan,
    last4: pan.slice(-4),
    panPrefix: prefix,
  };
}

export function formatMaskedMastercardPan(params: {
  panPrefix?: string;
  last4: string;
}) {
  const prefix = params.panPrefix ?? MASTERCARD_BIN_PREFIX;
  const segmentOne = prefix.slice(0, 4);
  const segmentTwo = prefix.slice(4, 6);

  return `${segmentOne} ${segmentTwo}•• •••• ${params.last4}`;
}

export function formatCardExpiry(month: number, year: number) {
  return `${String(month).padStart(2, "0")}/${String(year).slice(-2)}`;
}

export function getDefaultCardExpiry() {
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 3);

  return {
    expiryMonth: expiresAt.getMonth() + 1,
    expiryYear: expiresAt.getFullYear(),
  };
}
