export function documentTypeRequiresBackPhoto(documentType: string) {
  return documentType === "DRIVERS_LICENSE" || documentType === "STATE_ID";
}

export const idDocumentTypeLabels: Record<string, string> = {
  DRIVERS_LICENSE: "Driver's license",
  PASSPORT: "Passport",
  STATE_ID: "State ID",
  NATIONAL_ID: "National ID",
};
