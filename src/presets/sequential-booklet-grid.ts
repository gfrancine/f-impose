/*

Sequential booklet grid imposition

*/

import { PDFDocument, PDFEmbeddedPage, PDFPage } from "pdf-lib";
import {
  calcExcessTrim,
  drawSpread,
  mapIndicesSaddleStitch,
  Vec2,
} from "../utils";
import type { Preset } from "../types";
import { defineSettingsSchema, type RawSettings } from "../settings";
import {
  setupOutPdf,
  commonPresetSettings,
  gridPresetSettings,
} from "./helpers";

const name = "Sequential Booklet Grid";
const description = `Imposes booklets (left-to-right, top-to-bottom) on a grid with a flexible amount of rows and columns. (Note: all pages must have the same size!)`;

const { commonSchemaItems, getCommonSettings } = commonPresetSettings({
  orientation: "landscape",
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

  const indexGroups = mapIndicesSaddleStitch(srcPages.length);

  const nCells = nCols * nRows;
  const nOutSheets = Math.ceil(indexGroups.length / nCells);

  // derive the top left corner
  // assumes all pages are the same size
  const sampleSrcPage = srcPages[0];
  const srcSpreadSize = new Vec2(
    sampleSrcPage.width * 2,
    sampleSrcPage.height,
  ).mul(srcPageScale);
  const excessTrim = excessTrimEnabled
    ? calcExcessTrim(srcBleedArea, srcPageScale, trimLength, trimOffset) * 2
    : 0;
  const totalSrcSpreadSize = srcSpreadSize.add(excessTrim, excessTrim);
  const topLeftCorner = sheetCenter.add(
    (-totalSrcSpreadSize.x * nCols) / 2,
    (totalSrcSpreadSize.y * nRows) / 2,
  );

  for (let i = 0; i < nOutSheets; i++) {
    const outPageFront = outPdf.addPage([sheetSize.x, sheetSize.y]);
    const outPageBack = outPdf.addPage([sheetSize.x, sheetSize.y]);

    // get a slice of the leaves/index groups for this sheet
    const indexGroupListOffset = nCells * i;
    const indexGroupListSlice = indexGroups.slice(
      indexGroupListOffset,
      indexGroupListOffset + nCells,
    );
    const getCell1dIndex = (col: number, row: number) => row * nCols + col;
    console.log(indexGroupListSlice);

    for (let col = 0; col < nCols; col++) {
      for (let row = 0; row < nRows; row++) {
        const indexGroup = indexGroupListSlice[getCell1dIndex(col, row)];
        if (!indexGroup) break;

        const drawGridSpread = (
          outPage: PDFPage,
          {
            col,
            row,
            leftPage,
            rightPage,
          }: {
            col: number;
            row: number;
            leftPage: PDFEmbeddedPage;
            rightPage: PDFEmbeddedPage;
          },
        ) => {
          const origin = new Vec2(
            topLeftCorner.x + totalSrcSpreadSize.x * col,
            topLeftCorner.y - totalSrcSpreadSize.y - totalSrcSpreadSize.y * row,
          ).addVec(totalSrcSpreadSize.div(2));

          // handle hiding trim marks, especially when pages don't
          const hasLeftCell = col > 0,
            hasCellAbove = row > 0,
            // only worry about the bottom-right sides
            hasRightCell =
              col < nCols - 1
                ? indexGroupListSlice[getCell1dIndex(col + 1, row)] !==
                  undefined
                : false,
            hasCellBelow =
              row < nRows - 1
                ? indexGroupListSlice[getCell1dIndex(col, row + 1)] !==
                  undefined
                : false;

          drawSpread(outPage, {
            origin: origin,
            leftPage,
            rightPage,
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
        };

        // front page
        drawGridSpread(outPageFront, {
          col,
          row,
          leftPage: srcPages[indexGroup.front1],
          rightPage: srcPages[indexGroup.front2],
        });

        // back page
        drawGridSpread(outPageBack, {
          col: nCols - 1 - col, // flip horizontally
          row,
          leftPage: srcPages[indexGroup.back2],
          rightPage: srcPages[indexGroup.back1],
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
