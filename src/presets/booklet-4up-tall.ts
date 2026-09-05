/*

Saddle-Stitched Tall Booklet 4-Up

*/

import { PDFDocument } from "pdf-lib";
import type { Preset } from "../types";
import { defineSettingsSchema, type RawSettings } from "../settings";
import { setupOutPdf, commonPresetSettings, getThumbnailPath } from "./helpers";
import { imposeSequentialBookletGrid } from "./booklet-flex-grid";

const name = "Booklet 4-Up (Tall)";
const description =
  "Imposes two saddle-stitched booklet spreads per sheet. Good for tall booklets.\n\nTo freely adjust the amount of spreads per sheet, see the sequential booklet grid preset instead!";
const thumbnail = getThumbnailPath("booklet-4up-tall.png");

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
  thumbnail,
  settingsSchema,
  impose,
};

export default preset;
