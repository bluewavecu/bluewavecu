import type { AccountType } from "@/types/banking";

export const INSTITUTION = {
  legalName: "Bluewave Credit Union",
  shortName: "Bluewave",
  routingNumber: "311978875",
  phone: {
    display: "(646) 776-4480",
    tel: "+16467764480",
  },
  email: "support@bluewavecu.com",
  address: {
    line1: "2000 McKinney Ave",
    city: "Dallas",
    state: "TX",
    postalCode: "75201",
  },
  memberServicesHours: "Monday–Friday, 8:00 a.m.–6:00 p.m. CT",
  memberServicesHoursShort: "Mon–Fri, 8am–6pm CT",
  ncuaDisclaimer:
    "Bluewave Credit Union is federally insured by the NCUA. Membership eligibility applies. Equal Housing Opportunity.",
} as const;

export function formatInstitutionAddress() {
  const { line1, city, state, postalCode } = INSTITUTION.address;
  return `${line1}, ${city}, ${state} ${postalCode}`;
}

export function getShareAccountLabel(accountType: AccountType) {
  switch (accountType) {
    case "SAVINGS":
      return "Share Savings";
    case "BUSINESS":
      return "Business Share Draft";
    case "MONEY_MARKET":
      return "Money Market Share";
    case "CERTIFICATE":
      return "Share Certificate";
    case "CREDIT":
      return "Visa Credit";
    case "CHECKING":
    default:
      return "Share Draft";
  }
}
