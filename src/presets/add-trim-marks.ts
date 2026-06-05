/*

Generic 1-up add trim mark preset

*/

import { PDFDocument } from "pdf-lib";
import { drawPageWithTrimMarks, Vec2 } from "../utils";
import type { Preset } from "../types";
import { defineSettingsSchema, type RawSettings } from "../settings";
import { setupOutPdf, standardPresetSettings } from "./helpers";

const name = "Add Trim Marks";
const description = "Generic preset for imposing any PDF file with trim marks.";

const { standardSchemaItems, getStandardSettings } = standardPresetSettings({
  orientation: "portrait",
});
const settingsSchema = defineSettingsSchema(standardSchemaItems);

async function impose(srcPdf: PDFDocument, rawSettings: RawSettings) {
  const { outPdf, srcPages } = await setupOutPdf(srcPdf);
  const {
    sheetWidth,
    sheetHeight,
    srcPageScale,
    srcBleedArea,
    trimLength,
    trimOffset,
  } = getStandardSettings(rawSettings);
  const sheetSize = new Vec2(sheetWidth, sheetHeight);
  const sheetCenter = sheetSize.div(2); // always work with center anchor points/origins

  for (const srcPage of srcPages) {
    const sheet = outPdf.addPage([sheetSize.x, sheetSize.y]);
    drawPageWithTrimMarks(sheet, srcPage, sheetCenter, {
      srcPageScale,
      srcBleedArea,
      trimLength,
      trimOffset,
    });
  }

  return outPdf;
}

const preset: Preset = {
  name,
  description,
  settingsSchema,
  impose,
};

export default preset;
