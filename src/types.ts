import type { PDFDocument } from "pdf-lib";
import type { RawSettings, SettingsSchema } from "./settings";

export interface Preset {
  name: string;
  description: string;
  settingsSchema?: SettingsSchema;
  impose: (
    srcPdf: PDFDocument,
    rawSettings: RawSettings,
  ) => Promise<PDFDocument[]>;
}
