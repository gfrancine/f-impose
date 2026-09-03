/*

Sequential grid imposition

*/

import { PDFDocument } from "pdf-lib";
import { calcExcessTrim, drawPageWithTrimMarks, Vec2 } from "../utils";
import type { Preset } from "../types";
import { defineSettingsSchema, type RawSettings } from "../settings";
import {
  setupOutPdf,
  commonPresetSettings,
  gridPresetSettings,
} from "./helpers";

const name = "Sequential Grid";
const description = `Imposes pages (left-to-right, top-to-bottom) on a grid with a flexible amount of rows and columns. (Note: all pages must have the same size!)`;

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
    trimType,
  } = getCommonSettings(rawSettings);
  const { nCols, nRows, excessTrimEnabled } = getGridSettings(rawSettings);

  const sheetSize = new Vec2(sheetWidth, sheetHeight);
  const sheetCenter = sheetSize.div(2);

  // assumes all pages are the same size
  const sampleSrcPage = srcPages[0];
  const srcSize = new Vec2(sampleSrcPage.width, sampleSrcPage.height).mul(
    srcPageScale,
  );
  const excessTrim = excessTrimEnabled
    ? calcExcessTrim(srcBleedArea, srcPageScale, trimLength, trimOffset) * 2
    : 0;
  const totalSrcPageSize = srcSize.add(excessTrim, excessTrim);
  const topLeftCorner = sheetCenter.add(
    (-totalSrcPageSize.x * nCols) / 2,
    (totalSrcPageSize.y * nRows) / 2,
  );

  const nCells = nCols * nRows;
  const nOutPages = Math.ceil(srcPages.length / nCells);

  for (let i = 0; i < nOutPages; i++) {
    const outPage = outPdf.addPage([sheetSize.x, sheetSize.y]);

    // get a slice of the pages for this array
    const srcPageIndexOffset = nCells * i;
    const srcPagesSlice = srcPages.slice(
      srcPageIndexOffset,
      srcPageIndexOffset + nCells,
    );
    const getCell1dIndex = (col: number, row: number) => row * nCols + col;

    for (let col = 0; col < nCols; col++) {
      for (let row = 0; row < nRows; row++) {
        const srcPageIndex = getCell1dIndex(col, row);
        const srcPage = srcPagesSlice[srcPageIndex];
        if (!srcPage) break;

        const origin = new Vec2(
          topLeftCorner.x + totalSrcPageSize.x * col,
          topLeftCorner.y - totalSrcPageSize.y - totalSrcPageSize.y * row,
        ).addVec(totalSrcPageSize.div(2));

        // handle hiding trim marks, especially when pages don't
        const hasLeftCell = col > 0,
          hasCellAbove = row > 0,
          // only worry about the bottom-right sides
          hasRightCell =
            col < nCols - 1
              ? srcPagesSlice[getCell1dIndex(col + 1, row)] !== undefined
              : false,
          hasCellBelow =
            row < nRows - 1
              ? srcPagesSlice[getCell1dIndex(col, row + 1)] !== undefined
              : false;

        drawPageWithTrimMarks(outPage, srcPage, origin, {
          srcPageScale,
          srcBleedArea,
          trimLength,
          trimOffset,
          trimType,
          hideTrimMarks: excessTrimEnabled
            ? {}
            : {
                bottomLeftHoriz: hasLeftCell,
                bottomLeftVert: hasCellBelow,
                bottomRightHoriz: hasRightCell,
                bottomRightVert: hasCellBelow,
                topLeftHoriz: hasLeftCell,
                topLeftVert: hasCellAbove,
                topRightHoriz: hasRightCell,
                topRightVert: hasCellAbove,
              },
        });
      }
    }
  }

  return [outPdf];
}

const preset: Preset = {
  name,
  description,
  settingsSchema,
  impose,
};

export default preset;
