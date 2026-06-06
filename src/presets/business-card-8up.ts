/*

Business Card 8-Up

*/

import { PDFDocument } from "pdf-lib";
import { drawPageWithTransform, drawTrimMarksRect, Vec2 } from "../utils";
import type { Preset } from "../types";
import { defineSettingsSchema, type RawSettings } from "../settings";
import { setupOutPdf, commonPresetSettings } from "./helpers";

const name = "Business Card 8-Up";
const description = `Imposes cards on a long edge-flip, 2x4 layout. Supports both landscape and portrait cards.`;

const { commonSchemaItems, getCommonSettings } = commonPresetSettings({
  orientation: "portrait",
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

  for (const srcPage of srcPages) {
    // create sheet
    const sheet = outPdf.addPage([sheetSize.x, sheetSize.y]);

    const isSrcLandscape = srcPage.width > srcPage.height;
    const srcSize = (
      isSrcLandscape
        ? new Vec2(srcPage.width, srcPage.height)
        : new Vec2(srcPage.height, srcPage.width)
    ).mul(srcPageScale);

    // TODO: enable gutter?
    // const excessTrim = calcExcessTrim(srcBleedArea, trimLength, trim)* 2;
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

        drawPageWithTransform(sheet, srcPage, origin, {
          rotateDeg: isSrcLandscape ? 0 : 90,
          srcPageScale,
        });

        const scaledBleedArea = srcBleedArea * 2 * srcPageScale;

        drawTrimMarksRect(sheet, {
          origin,
          srcSize: srcSize.sub(scaledBleedArea, scaledBleedArea),
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
