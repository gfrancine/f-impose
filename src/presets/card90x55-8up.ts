/*

8-up 90x55 Business Card

*/

import { PDFDocument } from "pdf-lib";
import { assert, drawTrimMarksRect, toPts, Vec2 } from "../utils";
import type { Preset } from "../types";

const DEFAULT_SETTINGS = {
  // just here temporarily
  sheetWidth: 210,
  sheetHeight: 297,
  bleedArea: 5,
  trimMarkLength: 10,
  trimMarkOffset: 2,
};

type Settings = typeof DEFAULT_SETTINGS;

async function impose(
  srcPdf: PDFDocument,
  settings: Settings = DEFAULT_SETTINGS,
) {
  const outPdf = await PDFDocument.create();
  const srcPages = await outPdf.embedPages(srcPdf.getPages()); // embed pages into the output

  // validate input & settings
  // validate srcPages.length is exactly 1 or 2, else throw
  assert(
    srcPages.length === 1 || srcPages.length === 2,
    "Source PDF must exactly be 1 or 2 pages.",
  );
  // handle minimum sheet width/height . make sure it's portrait
  // max trim mark length + offset

  const isLandscape = srcPages[0].width > srcPages[0].height; // handle landscape/not
  const isDoubleSided = srcPages.length === 2;

  // function: imposeCards
  // lay 4 rows of....
  // 2 images in the center
  // with trim marks, take into account bleedArea

  // create sheet
  const sheetSize = new Vec2(
    toPts(settings.sheetWidth),
    toPts(settings.sheetHeight),
  );
  const sheetCenter = sheetSize.div(2);
  const sheet = outPdf.addPage([sheetSize.x, sheetSize.y]);

  // draw page
  const srcPage = srcPages[0];
  const origin = sheetCenter;
  const srcSize = new Vec2(srcPage.width, srcPage.height);
  const srcSizeHalf = srcSize.div(2);
  const bleedArea = toPts(settings.bleedArea);
  const trimLength = toPts(settings.trimMarkLength);
  const trimOffset = toPts(settings.trimMarkOffset);

  sheet.drawPage(srcPage, {
    x: origin.x - srcSizeHalf.x,
    y: origin.y - srcSizeHalf.y,
  });

  drawTrimMarksRect(sheet, {
    origin,
    srcSize: srcSize.sub(bleedArea * 2),
    trimLength,
    trimOffset,
  });

  return outPdf;
}

// default export presets: settings, impose function, preset name, description, etc.

const preset: Preset = {
  impose,
};

export default preset;
