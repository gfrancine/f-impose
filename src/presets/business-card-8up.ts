/*

Business Card 8-Up

*/

import { PDFDocument } from "pdf-lib";
import type { Preset } from "../types";
import { defineSettingsSchema, type RawSettings } from "../settings";
import { setupOutPdf, commonPresetSettings } from "./helpers";
import { imposeRepeatingGrid } from "./repeating-grid";

const name = "Business Card 8-Up";
const description = `Imposes cards on a long edge-flip, 2x4 layout. Supports both landscape and portrait cards.`;

const { commonSchemaItems, getCommonSettings } = commonPresetSettings({
  orientation: "portrait",
});
const settingsSchema = defineSettingsSchema(commonSchemaItems);

async function impose(srcPdf: PDFDocument, rawSettings: RawSettings) {
  const { outPdf, srcPages } = await setupOutPdf(srcPdf);

  await imposeRepeatingGrid(outPdf, srcPages, {
    ...getCommonSettings(rawSettings),
    nCols: 2,
    nRows: 4,
    excessTrimEnabled: false,
  });

  return [outPdf];
}

const preset: Preset = {
  name,
  description,
  settingsSchema,
  impose,
};

export default preset;
