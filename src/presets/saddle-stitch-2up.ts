/*

Saddle-Stitched Booklet 2-Up

*/

import { PDFDocument } from "pdf-lib";
import { drawSpread, mapIndicesSaddleStitch, Vec2 } from "../utils";
import type { Preset } from "../types";
import { defineSettingsSchema, type RawSettings } from "../settings";
import { setupOutPdf, commonPresetSettings } from "./helpers";

const name = "Saddle-Stitched Booklet 2-Up";
const description =
  "Generic 2-up saddle-stitched booklet. To remove inner/spine bleeds, check out the 'Remove Inner Bleed' preset.";

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
    srcBleedArea,
    trimLength,
    trimOffset,
  } = getCommonSettings(rawSettings);

  const sheetSize = new Vec2(sheetWidth, sheetHeight);
  const sheetCenter = sheetSize.div(2);

  // validate input & settings
  // mapIndicesSaddleStitch will throw if page count isn't a multiple of 4
  const indexGroups = mapIndicesSaddleStitch(srcPages.length);

  for (const indexGroup of indexGroups) {
    const frontSheet = outPdf.addPage([sheetSize.x, sheetSize.y]);
    const backSheet = outPdf.addPage([sheetSize.x, sheetSize.y]);

    drawSpread(frontSheet, {
      origin: sheetCenter,
      rightPage: srcPages[indexGroup.front1],
      leftPage: srcPages[indexGroup.front2],
      srcPageScale,
      srcBleedArea,
      trimLength,
      trimOffset,
    });

    drawSpread(backSheet, {
      origin: sheetCenter,
      rightPage: srcPages[indexGroup.back2],
      leftPage: srcPages[indexGroup.back1],
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
