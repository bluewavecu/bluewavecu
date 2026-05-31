import type { AccountType } from "@/types/banking";
import { getOfficialDomain, getSiteUrl } from "@/lib/siteUrl";

export const INSTITUTION = {
  legalName: "Bluewave Credit Union",
  publicSiteName: "Bluewave",
  shortName: "Bluewave",
  website: getSiteUrl(),
  officialDomain: getOfficialDomain(),
  routingNumber: "311978875",
  ncuaCreditUnionLocatorUrl: "https://mapping.ncua.gov/ResearchCreditUnion.aspx",
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
  publicDisclaimer:
    "Demonstration website only. Bluewave is not a licensed bank, credit union, or financial institution. All accounts, rates, balances, and products shown are fictional sample data for interface exploration.",
  ncuaDisclaimer:
    "Demonstration website only. Bluewave is not a licensed bank, credit union, or financial institution. All accounts, rates, balances, and products shown are fictional sample data for interface exploration.",
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
