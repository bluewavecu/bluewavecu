const SEQUENTIAL_PHONE_PATTERNS = [
  "0123456789",
  "1234567890",
  "2345678901",
  "3456789012",
  "4567890123",
  "5678901234",
  "6789012345",
  "7890123456",
  "8901234567",
  "9012345678",
  "9876543210",
  "8765432109",
  "7654321098",
  "6543210987",
  "5432109876",
  "4321098765",
  "3210987654",
  "2109876543",
  "1098765432",
];

export function extractPhoneDigits(value: string): string {
  return value.replace(/\D/g, "").slice(0, 10);
}

export function formatUsPhoneInput(value: string): string {
  const digits = extractPhoneDigits(value);

  if (digits.length === 0) {
    return "";
  }

  if (digits.length <= 3) {
    return `(${digits}`;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  }

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function isValidNanpStructure(digits: string): boolean {
  if (digits.length !== 10) {
    return false;
  }

  const areaCode = digits.slice(0, 3);
  const exchange = digits.slice(3, 6);

  if (/^[01]/.test(areaCode) || /^[01]/.test(exchange)) {
    return false;
  }

  if (/^\d11$/.test(areaCode)) {
    return false;
  }

  return true;
}

export function isBlockedGenericPhone(digits: string): boolean {
  if (digits.length !== 10) {
    return false;
  }

  if (/^(\d)\1{9}$/.test(digits)) {
    return true;
  }

  if (SEQUENTIAL_PHONE_PATTERNS.includes(digits)) {
    return true;
  }

  const areaCode = digits.slice(0, 3);
  const exchange = digits.slice(3, 6);
  const line = digits.slice(6, 10);

  if (areaCode === "555") {
    return true;
  }

  if (exchange === "555" && line >= "0100" && line <= "0199") {
    return true;
  }

  if (exchange === "555" && (line === "5555" || line === "1212")) {
    return true;
  }

  if (line === "0000" || line === "1111" || line === "1234" || line === "9999") {
    return true;
  }

  if (/^(\d{2})\1{4}$/.test(digits)) {
    return true;
  }

  return false;
}

export function getUsPhoneValidationError(value: string): string | null {
  const digits = extractPhoneDigits(value);

  if (digits.length === 0) {
    return "Phone number is required";
  }

  if (digits.length < 10) {
    return "Enter a complete 10-digit phone number";
  }

  if (!isValidNanpStructure(digits)) {
    return "Enter a valid US phone number";
  }

  if (isBlockedGenericPhone(digits)) {
    return "Enter a real phone number, not a placeholder or test number";
  }

  return null;
}

export function isValidUsPhone(value: string): boolean {
  return getUsPhoneValidationError(value) === null;
}

export function normalizeUsPhone(value: string): string {
  return formatUsPhoneInput(extractPhoneDigits(value));
}
