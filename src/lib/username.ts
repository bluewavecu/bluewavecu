export const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,32}$/;

export function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

export function isValidUsername(username: string) {
  return USERNAME_PATTERN.test(username.trim());
}

export function maskEmailAddress(email: string) {
  const [localPart, domain] = email.split("@");

  if (!localPart || !domain) {
    return email;
  }

  const visible = localPart.slice(0, 1);
  return `${visible}${"*".repeat(Math.max(localPart.length - 1, 3))}@${domain}`;
}
