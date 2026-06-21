/* eslint-disable  @typescript-eslint/no-unused-vars */

import { PDFDocument } from "pdf-lib";
import type { Preset } from "../types";
import { defineSettingsSchema, type RawSettings } from "../settings";
import {
  setupOutPdf,
  commonPresetSettings,
  gridPresetSettings,
} from "./helpers";

const name = "";
const description = "";

// Preset settings
const { commonSchemaItems, getCommonSettings } = commonPresetSettings({
  orientation: "landscape",
});
const { gridSchemaItems, getGridSettings } = gridPresetSettings();
const settingsSchema = defineSettingsSchema([
  ...commonSchemaItems,
  ...gridSchemaItems,
]);

// Imposition
async function impose(srcPdf: PDFDocument, rawSettings: RawSettings) {
  const { outPdf, srcPages } = await setupOutPdf(srcPdf);
  const {
    sheetWidth,
    sheetHeight,
    srcPageScale,
    // don't forget to multiply srcBleedarea by srcPageScale
    // when not relying on the drawing functions in utils.ts
    srcBleedArea,
    trimLength,
    trimOffset,
  } = getCommonSettings(rawSettings);
  const { nRows, nCols, excessTrimEnabled } = getGridSettings(rawSettings);

  return outPdf;
}

export const preset: Preset = {
  name,
  description,
  settingsSchema,
  impose,
};

export default preset;
