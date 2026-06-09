/*

Zine 8-Fold 

*/

import { PDFDocument } from "pdf-lib";
import {
  assert,
  drawPageWithTransform,
  drawTrimMarksRect,
  Vec2,
} from "../utils";
import type { Preset } from "../types";
import { defineSettingsSchema, type RawSettings } from "../settings";
import { setupOutPdf, commonPresetSettings } from "./helpers";

const name = "Zine 8-Fold";
const description = "A typical 8-fold mini zine. (Bleed areas not supported)";

const { commonSchemaItems, getCommonSettings } = commonPresetSettings({
  orientation: "landscape",
  exclude: ["srcBleedArea"],
});
const settingsSchema = defineSettingsSchema(commonSchemaItems);

const indexMap = [
  [6, 5, 4, 3],
  [7, 0, 1, 2],
].reverse();

async function impose(srcPdf: PDFDocument, rawSettings: RawSettings) {
  const { outPdf, srcPages } = await setupOutPdf(srcPdf);
  const { sheetWidth, sheetHeight, srcPageScale, trimLength, trimOffset } =
    getCommonSettings(rawSettings);

  assert(
    srcPages.length % 8 === 0,
    "Source PDF page count must be a multiple of 8.",
  );

  const sheetSize = new Vec2(sheetWidth, sheetHeight);
  const sheetCenter = sheetSize.div(2);
  const srcSize = new Vec2(srcPages[0].width, srcPages[0].height).mul(
    srcPageScale,
  );
  const srcSizeHalf = srcSize.div(2);
  const nSheets = srcPages.length / 8;

  // should we enforce a strict 8-page length instead?
  for (let s = 0; s < nSheets; s++) {
    const sheet = outPdf.addPage([sheetWidth, sheetHeight]);
    const srcPagesOffset = s * 8; // index offset of the first page in the srcPages array

    const N_ROWS = 2;
    const N_COLS = 4;

    // bottom-left corner of row 0 col 0, based on the sheet center
    const corner = sheetCenter.sub(
      (srcSize.x * N_COLS) / 2,
      (srcSize.y * N_ROWS) / 2,
    );

    for (let row = 0; row < N_ROWS; row++) {
      for (let col = 0; col < N_COLS; col++) {
        const i = srcPagesOffset + indexMap[row][col];
        const srcPage = srcPages[i];
        const origin = new Vec2(
          corner.x + srcSize.x * col,
          corner.y + srcSize.y * row,
        ).addVec(srcSizeHalf);

        const rotateDeg = row === 1 ? 180 : 0;
        drawPageWithTransform(sheet, srcPage, origin, {
          rotateDeg,
          srcPageScale,
        });
      }
    }

    drawTrimMarksRect(sheet, {
      origin: sheetCenter,
      srcSize: new Vec2(srcSize.x * N_COLS, srcSize.y * N_ROWS),
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
