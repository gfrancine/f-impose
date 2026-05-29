/*

8-up 90x55 Business Card

*/

import { PDFDocument } from "pdf-lib";
import { assert, drawTrimMark, set, toPts, Vec2 } from "../utils";

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

  const sheetSize = new Vec2(
    toPts(settings.sheetWidth),
    toPts(settings.sheetHeight),
  );
  const sheetCenter = sheetSize.div(2);
  const sheet = outPdf.addPage([sheetSize.x, sheetSize.y]);

  const srcPage = srcPages[0];

  const origin = sheetCenter;
  const srcSize = new Vec2(srcPage.width, srcPage.height);
  const srcSizeHalf = srcSize.div(2);

  sheet.drawPage(srcPage, {
    x: origin.x - srcSizeHalf.x,
    y: origin.y - srcSizeHalf.y,
  });

  const bleedArea = toPts(settings.bleedArea);
  const trimLength = toPts(settings.trimMarkLength);
  const trimOffset = toPts(settings.trimMarkOffset);

  // bottom left, horiz
  drawTrimMark(
    sheet,
    // from
    origin.x - srcSizeHalf.x + bleedArea - trimOffset - trimLength,
    origin.y - srcSizeHalf.y + bleedArea,
    // to
    origin.x - srcSizeHalf.x + bleedArea - trimOffset,
    origin.y - srcSizeHalf.y + bleedArea,
  );

  // bottom left, vert
  drawTrimMark(
    sheet,
    // from
    origin.x - srcSizeHalf.x + bleedArea,
    origin.y - srcSizeHalf.y + bleedArea - trimOffset - trimLength,
    // to
    origin.x - srcSizeHalf.x + bleedArea,
    origin.y - srcSizeHalf.y + bleedArea - trimOffset,
  );

  // bottom right, horiz
  drawTrimMark(
    sheet,
    // from
    origin.x + srcSizeHalf.x - bleedArea + trimOffset,
    origin.y - srcSizeHalf.y + bleedArea,
    // to
    origin.x + srcSizeHalf.x - bleedArea + trimOffset + trimLength,
    origin.y - srcSizeHalf.y + bleedArea,
  );

  // bottom right, vert
  drawTrimMark(
    sheet,
    // from
    origin.x + srcSizeHalf.x - bleedArea,
    origin.y - srcSizeHalf.y + bleedArea - trimOffset - trimLength,
    // to
    origin.x + srcSizeHalf.x - bleedArea,
    origin.y - srcSizeHalf.y + bleedArea - trimOffset,
  );

  ///

  // top left, horiz
  drawTrimMark(
    sheet,
    // from
    origin.x - srcSizeHalf.x + bleedArea - trimOffset - trimLength,
    origin.y + srcSizeHalf.y - bleedArea,
    // to
    origin.x - srcSizeHalf.x + bleedArea - trimOffset,
    origin.y + srcSizeHalf.y - bleedArea,
  );

  // top left, vert
  drawTrimMark(
    sheet,
    // from
    origin.x - srcSizeHalf.x + bleedArea,
    origin.y + srcSizeHalf.y - bleedArea + trimOffset + trimLength,
    // to
    origin.x - srcSizeHalf.x + bleedArea,
    origin.y + srcSizeHalf.y - bleedArea + trimOffset,
  );

  // top right, horiz
  drawTrimMark(
    sheet,
    // from
    origin.x + srcSizeHalf.x - bleedArea + trimOffset,
    origin.y + srcSizeHalf.y - bleedArea,
    // to
    origin.x + srcSizeHalf.x - bleedArea + trimOffset + trimLength,
    origin.y + srcSizeHalf.y - bleedArea,
  );

  // top right, vert
  drawTrimMark(
    sheet,
    // from
    origin.x + srcSizeHalf.x - bleedArea,
    origin.y + srcSizeHalf.y - bleedArea + trimOffset + trimLength,
    // to
    origin.x + srcSizeHalf.x - bleedArea,
    origin.y + srcSizeHalf.y - bleedArea + trimOffset,
  );

  return outPdf;
}

// default export presets: settings, impose function, preset name, description, etc.

const preset = {
  impose,
};

export default preset;
