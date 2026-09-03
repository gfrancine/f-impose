/*

Saddle-Stitched Booklet 2-Up

*/

import { PDFDocument } from "pdf-lib";
import type { Preset } from "../types";
import { defineSettingsSchema, type RawSettings } from "../settings";
import { setupOutPdf, commonPresetSettings } from "./helpers";
import { imposeSequentialBookletGrid } from "./sequential-booklet-grid";

const name = "Saddle-Stitched Booklet 2-Up";
const description =
  "Generic 2-up saddle-stitched booklet or signature. To remove inner/spine bleeds, check out the 'Remove Inner Bleed' preset!";

const { commonSchemaItems, getCommonSettings } = commonPresetSettings({
  orientation: "landscape",
});
const settingsSchema = defineSettingsSchema(commonSchemaItems);

async function impose(srcPdf: PDFDocument, rawSettings: RawSettings) {
  const { outPdf, srcPages } = await setupOutPdf(srcPdf);

  await imposeSequentialBookletGrid(outPdf, srcPages, {
    ...getCommonSettings(rawSettings),
    nRows: 1,
    nCols: 1,
    excessTrimEnabled: true,
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
