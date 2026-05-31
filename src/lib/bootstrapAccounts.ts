import { INSTITUTION } from "@/lib/institution";

/** Operations admin sign-in — change via Settings after first login. */
export const BOOTSTRAP_ADMIN_EMAIL =
  process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase() ?? INSTITUTION.email;

/** Initial operations password (override with BOOTSTRAP_ADMIN_PASSWORD env for one-off runs). */
export const BOOTSTRAP_ADMIN_PASSWORD =
  process.env.BOOTSTRAP_ADMIN_PASSWORD ?? "MAKEmoney@36";

export const BOOTSTRAP_ADMIN_NAME = "Bluewave Operations";

/** Demo member accounts for local/staging QA (seed only). */
export const DEMO_USER_EMAIL = "avery.morgan@bluewavecu.test";
export const DEMO_PENDING_USER_EMAIL = "casey.reed@bluewavecu.test";
export const DEMO_MEMBER_PASSWORD = "BluewaveDemo2026!";
