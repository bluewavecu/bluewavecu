import fs from "fs";
import path from "path";
import type { jsPDF } from "jspdf";
import { INSTITUTION, formatInstitutionAddress } from "@/lib/institution";

let cachedLogoDataUri: string | null = null;

function getAuthLogoDataUri() {
  if (cachedLogoDataUri) {
    return cachedLogoDataUri;
  }

  const logoPath = path.join(/* turbopackIgnore: true */ process.cwd(), "public", "images", "auth_logo.webp");
  const buffer = fs.readFileSync(logoPath);
  cachedLogoDataUri = `data:image/webp;base64,${buffer.toString("base64")}`;
  return cachedLogoDataUri;
}

export type PdfHeaderOptions = {
  title: string;
  subtitle?: string;
};

export type PdfHeaderLayout = {
  contentStartY: number;
};

export function drawPdfHeader(doc: jsPDF, options: PdfHeaderOptions): PdfHeaderLayout {
  const pageWidth = doc.internal.pageSize.getWidth();
  const logoDataUri = getAuthLogoDataUri();
  const logoHeight = 34;
  const logoWidth = 128;

  doc.addImage(logoDataUri, "WEBP", 40, 24, logoWidth, logoHeight);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  const rightX = pageWidth - 40;
  doc.text(INSTITUTION.legalName, rightX, 32, { align: "right" });
  doc.text(formatInstitutionAddress(), rightX, 44, { align: "right" });
  doc.text(`${INSTITUTION.phone.display} · ${INSTITUTION.email}`, rightX, 56, { align: "right" });

  doc.setDrawColor(10, 42, 94);
  doc.setLineWidth(0.75);
  doc.line(40, 68, pageWidth - 40, 68);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(10, 42, 94);
  doc.text(options.title, 40, 88);

  if (options.subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(options.subtitle, 40, 104);
    return { contentStartY: 118 };
  }

  return { contentStartY: 102 };
}

export function drawPdfFooter(doc: jsPDF, text: string) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const footerY = doc.internal.pageSize.getHeight() - 32;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(110, 110, 110);
  doc.text(text, 40, footerY, { maxWidth: pageWidth - 80 });
}
