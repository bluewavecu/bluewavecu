import { jsPDF } from "jspdf";
import type { TransactionReceiptData } from "@/lib/transactionReceiptExport";
import { INSTITUTION, formatInstitutionAddress } from "@/lib/institution";

function formatCurrency(amount: number) {
  const absoluteValue = Math.abs(amount);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    signDisplay: amount < 0 ? "always" : "auto",
  }).format(amount < 0 ? -absoluteValue : absoluteValue);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(value));
}

function addDetailRow(
  doc: jsPDF,
  y: number,
  label: string,
  value: string,
  pageWidth: number,
) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  doc.text(label, 40, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  doc.text(value, 180, y, { maxWidth: pageWidth - 220 });
}

export function generateTransactionReceiptPdfBuffer(data: TransactionReceiptData): Buffer {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const displayDate = data.postedAt ?? data.createdAt;

  doc.setFillColor(10, 42, 94);
  doc.rect(0, 0, pageWidth, 88, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text(INSTITUTION.legalName, 40, 42);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Transaction Receipt", 40, 62);
  doc.text(formatInstitutionAddress(), 40, 78);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(10, 42, 94);
  doc.text("Payment confirmation", 40, 118);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  doc.text(`Reference ${data.reference}`, 40, 136);
  doc.text(`Issued ${formatDateTime(new Date().toISOString())}`, 40, 150);

  doc.setDrawColor(220, 228, 238);
  doc.line(40, 166, pageWidth - 40, 166);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(10, 42, 94);
  doc.text(formatCurrency(data.amount), 40, 204);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.text(data.merchant ?? data.description, 40, 226);

  let y = 258;
  const rows: Array<[string, string]> = [
    ["Member", data.memberName],
    ["Account", `${data.accountLabel} · ${data.maskedAccountNumber}`],
    ["Transaction type", data.type],
    ["Status", data.status],
    ["Transaction date", formatDateTime(displayDate)],
    ["Description", data.description],
  ];

  if (data.merchant) {
    rows.push(["Merchant / payee", data.merchant]);
  }

  if (data.destinationAccountNumber) {
    rows.push(["Destination account", data.destinationAccountNumber]);
  }

  if (data.reviewedAt) {
    rows.push(["Reviewed", formatDateTime(data.reviewedAt)]);
  }

  rows.push(["Receipt ID", data.transactionId]);

  for (const [label, value] of rows) {
    addDetailRow(doc, y, label, value, pageWidth);
    y += 24;
  }

  const footerY = doc.internal.pageSize.getHeight() - 48;
  doc.setFontSize(8);
  doc.setTextColor(110, 110, 110);
  doc.text(
    `${INSTITUTION.ncuaDisclaimer} Keep this receipt for your records. Questions: ${INSTITUTION.phone.display} · ${INSTITUTION.email}`,
    40,
    footerY,
    { maxWidth: pageWidth - 80 },
  );

  return Buffer.from(doc.output("arraybuffer"));
}
