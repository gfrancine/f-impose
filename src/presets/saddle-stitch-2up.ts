/*

Saddle-Stitched Booklet 2-Up

*/

import { PDFDocument } from "pdf-lib";
import { drawSpread, mapIndicesSaddleStitch, toPts, Vec2 } from "../utils";
import type { Preset } from "../types";

const name = "Saddle-Stitched Booklet 2-Up";

const DEFAULT_SETTINGS = {
  sheetWidth: 297,
  sheetHeight: 210,
  bleedArea: 5,
  trimMarkLength: 5,
  trimMarkOffset: 2,
};

type Settings = typeof DEFAULT_SETTINGS;

async function impose(
  srcPdf: PDFDocument,
  settings: Settings = DEFAULT_SETTINGS,
) {
  const outPdf = await PDFDocument.create();
  const srcPages = await outPdf.embedPages(srcPdf.getPages()); // embed pages into the output

  const sheetSize = new Vec2(
    toPts(settings.sheetWidth),
    toPts(settings.sheetHeight),
  );
  const sheetCenter = sheetSize.div(2); // always work with center anchor points/origins
  const bleedArea = toPts(settings.bleedArea);
  const trimLength = toPts(settings.trimMarkLength);
  const trimOffset = toPts(settings.trimMarkOffset);

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
      bleedArea,
      trimLength,
      trimOffset,
    });

    drawSpread(backSheet, {
      origin: sheetCenter,
      rightPage: srcPages[indexGroup.back2],
      leftPage: srcPages[indexGroup.back1],
      bleedArea,
      trimLength,
      trimOffset,
    });
  }

  return outPdf;
}

const preset: Preset = {
  name,
  impose,
};

export default preset;
