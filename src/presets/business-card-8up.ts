/*

Business Card 8-Up
- 8-up
- Long edge flip
- One- and double-side support

*/

import { PDFDocument } from "pdf-lib";
import { drawPageRotated, drawTrimMarksRect, Vec2 } from "../utils";
import type { Preset } from "../types";
import { defineSettingsSchema, type RawSettings } from "../settings";
import { setupOutPdf, standardPresetSettings } from "./helpers";

const name = "Business Card 8-Up";
const description =
  `Imposes cards on a long edge-flip, 2x4 layout. Supports both one- and double-sided cards. (Note: The preset currently only supports landscape cards, please rotate your portrait cards before imposing!)`.trim();

const { standardSchemaItems, getStandardSettings } = standardPresetSettings({
  orientation: "portrait",
});
const settingsSchema = defineSettingsSchema(standardSchemaItems);

async function impose(srcPdf: PDFDocument, rawSettings: RawSettings) {
  const { outPdf, srcPages } = await setupOutPdf(srcPdf);
  const { sheetWidth, sheetHeight, bleedArea, trimLength, trimOffset } =
    getStandardSettings(rawSettings);

  const sheetSize = new Vec2(sheetWidth, sheetHeight);
  const sheetCenter = sheetSize.div(2);

  for (const srcPage of srcPages) {
    // create sheet
    const sheet = outPdf.addPage([sheetSize.x, sheetSize.y]);

    const isSrcLandscape = srcPage.width > srcPage.height;
    const srcSize = isSrcLandscape
      ? new Vec2(srcPage.width, srcPage.height)
      : new Vec2(srcPage.height, srcPage.width);

    // TODO: enable gutter?
    // const excessTrim = calcExcessTrim(bleedArea, trimLength, trim)* 2;
    // const totalSize = srcSize.add( excessTrim, excessTrim )

    const N_ROWS = 4;
    const N_COLS = 2;

    // bottom-left corner of row 0 col 0, based on the sheet center
    const corner = sheetCenter.sub(
      (srcSize.x * N_COLS) / 2,
      (srcSize.y * N_ROWS) / 2,
    );

    for (let row = 0; row < N_ROWS; row++) {
      for (let col = 0; col < N_COLS; col++) {
        const origin = new Vec2(
          corner.x + srcSize.x * col,
          corner.y + srcSize.y * row,
        ).addVec(srcSize.div(2));

        drawPageRotated(sheet, srcPage, origin, isSrcLandscape ? 0 : 90);

        drawTrimMarksRect(sheet, {
          origin,
          srcSize: srcSize.sub(bleedArea * 2, bleedArea * 2),
          trimLength,
          trimOffset,
          hideTrimMarks: {
            bottomLeftHoriz: col > 0,
            bottomLeftVert: row > 0,
            bottomRightHoriz: col < N_COLS - 1,
            bottomRightVert: row > 0,
            topLeftHoriz: col > 0,
            topLeftVert: row < N_ROWS - 1,
            topRightHoriz: col < N_COLS - 1,
            topRightVert: row < N_ROWS - 1,
          },
        });
      }
    }
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
