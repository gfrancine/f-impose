import type { PDFDocument } from "pdf-lib";
import type { SettingsSchema } from "./settings";

export type Preset = {
  name: string;
  settingsSchema: SettingsSchema;
  impose: (srcPdf: PDFDocument) => Promise<PDFDocument>;
};
