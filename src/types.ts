import type { PDFDocument } from "pdf-lib";
import type { RawSettings, SettingsSchema } from "./settings";
import type { PresetId } from "./presets";

export interface Preset {
  name: string;
  description: string;
  thumbnail?: string;
  settingsSchema?: SettingsSchema;
  impose: (
    srcPdf: PDFDocument,
    rawSettings: RawSettings,
  ) => Promise<PDFDocument[]>;
}

export type PresetStep = {
  presetId: PresetId;
  rawSettings: RawSettings;
};
