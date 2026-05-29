/*

Generic 1-up add trim mark preset

*/

import { PDFDocument } from "pdf-lib";
import { imposePage, toPts, Vec2 } from "../utils";
import type { Preset } from "../types";

const DEFAULT_SETTINGS = {
  sheetWidth: 210,
  sheetHeight: 297,
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
  // ...

  for (const srcPage of srcPages) {
    const sheet = outPdf.addPage([sheetSize.x, sheetSize.y]);
    imposePage(sheet, srcPage, sheetCenter, {
      bleedArea,
      trimLength,
      trimOffset,
    });
  }

  return outPdf;
}

const preset: Preset = {
  impose,
};

export default preset;
