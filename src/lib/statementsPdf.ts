import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { StatementExportData } from "@/lib/statementExport";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatMonthYear(month: number, year: number) {
  return new Date(year, month - 1, 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function generateStatementPdfBuffer(data: StatementExportData): Buffer {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Bluewave Credit Union", 40, 48);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Account Statement", 40, 68);
  doc.text(`Member: ${data.memberName}`, 40, 88);
  doc.text(`Account: ${data.accountLabel}`, 40, 104);
  doc.text(`Period: ${formatMonthYear(data.month, data.year)}`, 40, 120);

  if (data.openingBalance !== null || data.closingBalance !== null) {
    const balanceParts: string[] = [];

    if (data.openingBalance !== null) {
      balanceParts.push(`Opening balance: ${formatCurrency(data.openingBalance)}`);
    }

    if (data.closingBalance !== null) {
      balanceParts.push(`Closing balance: ${formatCurrency(data.closingBalance)}`);
    }

    doc.text(balanceParts.join("   |   "), 40, 136);
  }

  autoTable(doc, {
    startY: data.openingBalance !== null || data.closingBalance !== null ? 152 : 136,
    head: [["Date", "Description", "Type", "Amount", "Status", "Balance", "Account"]],
    body: data.rows.map((row) => [
      row.date,
      row.description,
      row.type,
      formatCurrency(row.amount),
      row.status,
      row.balanceAfter !== null ? formatCurrency(row.balanceAfter) : "—",
      row.maskedAccount,
    ]),
    styles: { fontSize: 8, cellPadding: 4 },
    headStyles: { fillColor: [10, 42, 94] },
    margin: { left: 40, right: 40 },
  });

  const footerY = doc.internal.pageSize.getHeight() - 32;
  doc.setFontSize(8);
  doc.setTextColor(90, 90, 90);
  doc.text(
    "This statement is for informational purposes only. Full account numbers are never displayed.",
    40,
    footerY,
    { maxWidth: pageWidth - 80 },
  );

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}
