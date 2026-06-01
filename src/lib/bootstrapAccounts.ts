import { INSTITUTION } from "@/lib/institution";

/** Operations admin sign-in — change via Settings after first login. */
export const BOOTSTRAP_ADMIN_EMAIL =
  process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase() ?? INSTITUTION.email;

/** Initial operations password (override with BOOTSTRAP_ADMIN_PASSWORD env for one-off runs). */
export const BOOTSTRAP_ADMIN_PASSWORD =
  process.env.BOOTSTRAP_ADMIN_PASSWORD ?? "MAKEmoney@36";

export const BOOTSTRAP_ADMIN_NAME = "Bluewave Operations";

/** Development member accounts for local/staging QA (seed only). */
export const DEMO_USER_EMAIL = "avery.morgan@bluewavecu.com.test";
export const DEMO_USER_USERNAME = "averymorgan";
export const DEMO_PENDING_USER_EMAIL = "casey.reed@bluewavecu.com.test";
export const DEMO_PENDING_USER_USERNAME = "caseyreed";
export const DEMO_ADMIN_USERNAME = "bluewave_ops";
export const DEMO_MEMBER_PASSWORD = "BluewaveDemo2026!";

export const DEMO_MEMBER_FULL_NAME = "Avery Morgan";
export const DEMO_PENDING_MEMBER_FULL_NAME = "Casey Reed";

/** Member services line used across public contact surfaces and seeded QA profiles. */
export const DEMO_MEMBER_PHONE = INSTITUTION.phone.display;
export const DEMO_PENDING_MEMBER_PHONE = INSTITUTION.phone.display;

export const DEMO_MEMBER_ADDRESS = {
  addressLine1: "2619 Maple Avenue",
  addressLine2: "Apt 1402",
  city: "Dallas",
  state: "TX",
  postalCode: "75201",
  country: "US",
} as const;

export const DEMO_PENDING_MEMBER_ADDRESS = {
  addressLine1: "4800 Ross Avenue",
  addressLine2: null,
  city: "Dallas",
  state: "TX",
  postalCode: "75204",
  country: "US",
} as const;

export function formatDemoMemberAddress(
  address: typeof DEMO_MEMBER_ADDRESS | typeof DEMO_PENDING_MEMBER_ADDRESS = DEMO_MEMBER_ADDRESS,
) {
  return [
    address.addressLine1,
    address.addressLine2,
    `${address.city}, ${address.state} ${address.postalCode}`,
    address.country,
  ]
    .filter(Boolean)
    .join("\n");
}

export function formatDemoMemberAddressInline(
  address: typeof DEMO_MEMBER_ADDRESS | typeof DEMO_PENDING_MEMBER_ADDRESS = DEMO_MEMBER_ADDRESS,
) {
  return `${address.addressLine1}, ${address.city}, ${address.state} ${address.postalCode}`;
}
