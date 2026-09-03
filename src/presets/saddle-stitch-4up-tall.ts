/*

Saddle-Stitched Tall Booklet 4-Up

*/

import { PDFDocument } from "pdf-lib";
import type { Preset } from "../types";
import { defineSettingsSchema, type RawSettings } from "../settings";
import { setupOutPdf, commonPresetSettings } from "./helpers";
import { imposeSequentialBookletGrid } from "./sequential-booklet-grid";

const name = "Saddle-Stitched Tall Booklet 4-Up";
const description =
  "Imposes two saddle-stitched booklet spreads per sheet. Good for tall booklets. (To freely adjust the amount of spreads per sheet, see the sequential booklet grid preset instead!)";

const { commonSchemaItems, getCommonSettings } = commonPresetSettings({
  orientation: "landscape",
});
const settingsSchema = defineSettingsSchema(commonSchemaItems);

async function impose(srcPdf: PDFDocument, rawSettings: RawSettings) {
  const { outPdf, srcPages } = await setupOutPdf(srcPdf);

  await imposeSequentialBookletGrid(outPdf, srcPages, {
    ...getCommonSettings(rawSettings),
    nRows: 1,
    nCols: 2,
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
