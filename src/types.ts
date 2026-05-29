import type { PDFDocument } from "pdf-lib";

export type Preset = {
  impose: (srcPdf: PDFDocument) => Promise<PDFDocument>;
};
