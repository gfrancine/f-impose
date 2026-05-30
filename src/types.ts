import type { PDFDocument } from "pdf-lib";

export type Preset = {
  name: string;
  impose: (srcPdf: PDFDocument) => Promise<PDFDocument>;
};
