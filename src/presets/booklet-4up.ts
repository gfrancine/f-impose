/*

Saddle-Stitched Booklet 4-Up

*/

import { PDFDocument } from "pdf-lib";
import type { Preset } from "../types";
import { defineSettingsSchema, type RawSettings } from "../settings";
import { setupOutPdf, commonPresetSettings, getThumbnailPath } from "./helpers";
import { imposeSequentialBookletGrid } from "./booklet-flex-grid";

const name = "Booklet 4-Up";
const description =
  "Imposes two saddle-stitched booklet spreads per sheet.\n\nTo freely adjust the amount of spreads per sheet, see the sequential booklet grid preset instead!";
const thumbnail = getThumbnailPath("booklet-4up.png");

const { commonSchemaItems, getCommonSettings } = commonPresetSettings({
  orientation: "portrait",
});
const settingsSchema = defineSettingsSchema(commonSchemaItems);

async function impose(srcPdf: PDFDocument, rawSettings: RawSettings) {
  const { outPdf, srcPages } = await setupOutPdf(srcPdf);

  await imposeSequentialBookletGrid(outPdf, srcPages, {
    ...getCommonSettings(rawSettings),
    nRows: 2,
    nCols: 1,
    excessTrimEnabled: true,
  });

  return [outPdf];
}

const preset: Preset = {
  name,
  description,
  thumbnail,
  settingsSchema,
  impose,
};

export default preset;
