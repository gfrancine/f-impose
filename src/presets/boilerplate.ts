/* eslint-disable  @typescript-eslint/no-unused-vars */

import { PDFDocument } from "pdf-lib";
import type { Preset } from "../types";
import { defineSettingsSchema, type RawSettings } from "../settings";
import { setupOutPdf, commonPresetSettings } from "./helpers";

const name = "";
const description = "";

const { commonSchemaItems, getCommonSettings } = commonPresetSettings({
  orientation: "landscape",
});
const settingsSchema = defineSettingsSchema(commonSchemaItems);

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

  return outPdf;
}

export const preset: Preset = {
  name,
  description,
  settingsSchema,
  impose,
};

export default preset;
