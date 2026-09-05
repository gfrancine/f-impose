/*

Sequential grid imposition

*/

import { PDFDocument, PDFEmbeddedPage, PDFPage } from "pdf-lib";
import { calcExcessTrim, drawPageWithTrimMarks, Vec2 } from "../utils";
import type { Preset } from "../types";
import {
  asBool,
  checkboxInput,
  defineSettingsSchema,
  getSettings,
  type RawSettings,
} from "../settings";
import {
  setupOutPdf,
  commonPresetSettings,
  gridPresetSettings,
  getThumbnailPath,
} from "./helpers";

const name = "Flexible Grid";
const description = `Imposes pages on a grid (left-to-right, top-to-bottom) with a flexible amount of rows and columns. (Note: all pages must have the same size!)`;
const thumbnail = getThumbnailPath("flex-grid.png");

const { commonSchemaItems, getCommonSettings } = commonPresetSettings({
  orientation: "portrait",
});
const { gridSchemaItems, getGridSettings } = gridPresetSettings();
const settingsSchema = defineSettingsSchema([
  ...commonSchemaItems,
  ...gridSchemaItems,
  checkboxInput({
    id: "doubleSided",
    name: "Double-sided?",
    tooltip:
      "Treat every second page in the input PDF as the previous page's back side.",
    defaultValue: false,
  }),
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
  const { doubleSided } = getSettings(rawSettings, {
    doubleSided: (v) => asBool(v, false),
  });

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

  const getCell1dIndex = (col: number, row: number) => row * nCols + col;

  const drawSlice = (
    outPage: PDFPage,
    slice: PDFEmbeddedPage[],
    direction: "ltr" | "rtl", // for the double-sided short edge flip imposition
  ) => {
    for (let col = 0; col < nCols; col++) {
      for (let row = 0; row < nRows; row++) {
        const srcPageIndex = getCell1dIndex(col, row);
        const srcPage = slice[srcPageIndex];
        if (!srcPage) break;

        const origin = new Vec2(
          direction === "ltr"
            ? topLeftCorner.x + totalSrcPageSize.x * col
            : topLeftCorner.x + totalSrcPageSize.x * (nCols - 1 - col),
          topLeftCorner.y - totalSrcPageSize.y - totalSrcPageSize.y * row,
        ).addVec(totalSrcPageSize.div(2));

        // handle hiding trim marks
        const hasLeftCell = col > 0;
        const hasCellAbove = row > 0;
        // only worry about the bottom-right sides
        const hasRightCell =
          col < nCols - 1
            ? slice[getCell1dIndex(col + 1, row)] !== undefined
            : false;
        const hasCellBelow =
          row < nRows - 1
            ? slice[getCell1dIndex(col, row + 1)] !== undefined
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
  };

  const nCells = nCols * nRows;

  if (doubleSided) {
    const srcPagePairs: { front: PDFEmbeddedPage; back: PDFEmbeddedPage }[] =
      [];
    for (let i = 0; i < srcPages.length; i += 2) {
      srcPagePairs.push({ front: srcPages[i], back: srcPages[i + 1] });
    }
    const nOutSheets = Math.ceil(srcPagePairs.length / nCells);

    for (let i = 0; i < nOutSheets; i++) {
      const outPageFront = outPdf.addPage([sheetSize.x, sheetSize.y]);
      const outPageBack = outPdf.addPage([sheetSize.x, sheetSize.y]);

      const pairsIndexOffset = nCells * i;
      const pairsSlice = srcPagePairs.slice(
        pairsIndexOffset,
        pairsIndexOffset + nCells,
      );

      drawSlice(
        // front pages
        outPageFront,
        pairsSlice.map(({ front }) => front),
        "ltr",
      );

      drawSlice(
        // front pages
        outPageBack,
        pairsSlice.map(({ back }) => back),
        "rtl",
      );
    }
  } else {
    // not double sided, impose normally
    const nOutPages = Math.ceil(srcPages.length / nCells);

    for (let i = 0; i < nOutPages; i++) {
      const outPage = outPdf.addPage([sheetSize.x, sheetSize.y]);
      // get a slice of the pages for this page
      const srcPageIndexOffset = nCells * i;
      const srcPagesSlice = srcPages.slice(
        srcPageIndexOffset,
        srcPageIndexOffset + nCells,
      );
      drawSlice(outPage, srcPagesSlice, "ltr");
    }
  }

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
