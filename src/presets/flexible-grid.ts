/*

Flexible grid imposition

*/

import { PDFDocument } from "pdf-lib";
import {
  calcExcessTrim,
  drawPageWithTransform,
  drawTrimMarksRect,
  Vec2,
} from "../utils";
import type { Preset } from "../types";
import { defineSettingsSchema, type RawSettings } from "../settings";
import {
  setupOutPdf,
  commonPresetSettings,
  gridPresetSettings,
} from "./helpers";

const name = "Flexible Grid Imposition";
const description = `Imposes PDFs with a flexible amount of rows and columns per page.`;

const { commonSchemaItems, getCommonSettings } = commonPresetSettings({
  orientation: "portrait",
});
const { gridSchemaItems, getGridSettings } = gridPresetSettings();
const settingsSchema = defineSettingsSchema([
  ...commonSchemaItems,
  ...gridSchemaItems,
]);

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
  const { nCols, nRows, excessTrimEnabled } = getGridSettings(rawSettings);

  const sheetSize = new Vec2(sheetWidth, sheetHeight);
  const sheetCenter = sheetSize.div(2);

  for (const srcPage of srcPages) {
    // create sheet
    const sheet = outPdf.addPage([sheetSize.x, sheetSize.y]);

    const srcSize = new Vec2(srcPage.width, srcPage.height).mul(srcPageScale);
    const excessTrim = excessTrimEnabled
      ? calcExcessTrim(srcBleedArea, srcPageScale, trimLength, trimOffset) * 2
      : 0;
    const totalSize = srcSize.add(excessTrim, excessTrim);

    // bottom-left corner of row 0 col 0, based on the sheet center
    const corner = sheetCenter.sub(
      (totalSize.x * nCols) / 2,
      (totalSize.y * nRows) / 2,
    );

    for (let row = 0; row < nRows; row++) {
      for (let col = 0; col < nCols; col++) {
        const origin = new Vec2(
          corner.x + totalSize.x * col,
          corner.y + totalSize.y * row,
        ).addVec(totalSize.div(2));

        drawPageWithTransform(sheet, srcPage, origin, {
          srcPageScale,
        });

        const scaledBleedArea = srcBleedArea * 2 * srcPageScale;

        drawTrimMarksRect(sheet, {
          origin,
          srcSize: srcSize.sub(scaledBleedArea, scaledBleedArea),
          trimLength,
          trimOffset,
          hideTrimMarks: excessTrimEnabled
            ? {}
            : {
                bottomLeftHoriz: col > 0,
                bottomLeftVert: row > 0,
                bottomRightHoriz: col < nCols - 1,
                bottomRightVert: row > 0,
                topLeftHoriz: col > 0,
                topLeftVert: row < nRows - 1,
                topRightHoriz: col < nCols - 1,
                topRightVert: row < nRows - 1,
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
