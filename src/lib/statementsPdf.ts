import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { StatementExportData } from "@/lib/statementExport";
import { formatStatementPeriodLabel } from "@/lib/statementPeriod";
import { INSTITUTION } from "@/lib/institution";
import { drawPdfFooter, drawPdfHeader } from "@/lib/pdfBranding";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatMoneyColumn(amount: number | null) {
  if (amount === null || amount === 0) {
    return "—";
  }

  return formatCurrency(amount);
}

export function generateStatementPdfBuffer(data: StatementExportData): Buffer {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const showAccountColumn = data.rows.some(
    (row, index, rows) => index > 0 && row.maskedAccount !== rows[0]?.maskedAccount,
  );

  const { contentStartY } = drawPdfHeader(doc, {
    title: "Account Statement",
    subtitle: formatStatementPeriodLabel(data.period),
  });

  let metaY = contentStartY;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.text(`Member: ${data.memberName}`, 40, metaY);
  doc.text(`Account: ${data.accountLabel}`, 40, metaY + 14);

  const summaryY = metaY + 34;
  doc.setFillColor(247, 251, 255);
  doc.setDrawColor(220, 228, 238);
  doc.roundedRect(40, summaryY, pageWidth - 80, 52, 4, 4, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(10, 42, 94);
  doc.text("Opening balance", 52, summaryY + 18);
  doc.text("Total inflow", 52 + (pageWidth - 80) / 3, summaryY + 18);
  doc.text("Total outflow", 52 + ((pageWidth - 80) / 3) * 2, summaryY + 18);
  doc.text("Closing balance", pageWidth - 52, summaryY + 18, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  doc.text(
    data.openingBalance !== null ? formatCurrency(data.openingBalance) : "—",
    52,
    summaryY + 36,
  );
  doc.text(formatCurrency(data.totalInflow), 52 + (pageWidth - 80) / 3, summaryY + 36);
  doc.text(formatCurrency(data.totalOutflow), 52 + ((pageWidth - 80) / 3) * 2, summaryY + 36);
  doc.text(
    data.closingBalance !== null ? formatCurrency(data.closingBalance) : "—",
    pageWidth - 52,
    summaryY + 36,
    { align: "right" },
  );

  const tableHead = showAccountColumn
    ? [["Date", "Description", "Inflow", "Outflow", "Balance", "Account"]]
    : [["Date", "Description", "Inflow", "Outflow", "Balance"]];

  const tableBody = data.rows.map((row) => {
    const inflow = row.amount > 0 ? row.amount : null;
    const outflow = row.amount < 0 ? Math.abs(row.amount) : null;
    const base = [
      row.date,
      row.description,
      formatMoneyColumn(inflow),
      formatMoneyColumn(outflow),
      row.balanceAfter !== null ? formatCurrency(row.balanceAfter) : "—",
    ];

    if (showAccountColumn) {
      base.push(row.maskedAccount);
    }

    return base;
  });

  autoTable(doc, {
    startY: summaryY + 68,
    head: tableHead,
    body: tableBody,
    styles: {
      fontSize: 9,
      cellPadding: 5,
      lineColor: [230, 236, 244],
      lineWidth: 0.5,
      textColor: [30, 30, 30],
    },
    headStyles: {
      fillColor: [10, 42, 94],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 62 },
      2: { halign: "right" },
      3: { halign: "right" },
      4: { halign: "right", fontStyle: "bold" },
      ...(showAccountColumn ? { 5: { cellWidth: 72 } } : {}),
    },
    alternateRowStyles: { fillColor: [252, 253, 255] },
    margin: { left: 40, right: 40 },
  });

  drawPdfFooter(
    doc,
    `${INSTITUTION.ncuaDisclaimer} This statement is for informational purposes only. Full account numbers are never displayed.`,
  );

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}
