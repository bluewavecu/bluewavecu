import { jsPDF } from "jspdf";
import type { TransactionReceiptData } from "@/lib/transactionReceiptExport";
import { INSTITUTION } from "@/lib/institution";
import { drawPdfFooter, drawPdfHeader } from "@/lib/pdfBranding";

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

  const { contentStartY } = drawPdfHeader(doc, {
    title: "Transaction Receipt",
    subtitle: "Payment confirmation",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  doc.text(`Reference ${data.reference}`, 40, contentStartY);
  doc.text(`Issued ${formatDateTime(new Date().toISOString())}`, 40, contentStartY + 14);

  doc.setDrawColor(220, 228, 238);
  doc.line(40, contentStartY + 28, pageWidth - 40, contentStartY + 28);

  const amountY = contentStartY + 58;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(10, 42, 94);
  doc.text(formatCurrency(data.amount), 40, amountY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.text(data.merchant ?? data.description, 40, amountY + 22);

  let y = amountY + 54;
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

  drawPdfFooter(
    doc,
    `${INSTITUTION.ncuaDisclaimer} Keep this receipt for your records. Questions: ${INSTITUTION.phone.display} · ${INSTITUTION.email}`,
  );

  return Buffer.from(doc.output("arraybuffer"));
}
