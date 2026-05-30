/*

Saddle-Stitched Booklet 2-Up

*/

import { PDFDocument } from "pdf-lib";
import {
  assert,
  drawPageWithTrimMarks,
  mapIndicesSaddleStitch,
  toPts,
  Vec2,
} from "../utils";
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
  assert(srcPages.length % 4 === 0, "Page count must be a multiple of 4.");

  const indexGroups = mapIndicesSaddleStitch(srcPages.length);
  const pageSize = new Vec2(srcPages[0].width, srcPages[0].height);

  for (const indexGroup of indexGroups) {
    const frontSheet = outPdf.addPage([sheetSize.x, sheetSize.y]);
    const backSheet = outPdf.addPage([sheetSize.x, sheetSize.y]);

    const rightPageOrigin = sheetCenter.add(pageSize.x / 2, 0);
    const leftPageOrigin = sheetCenter.sub(pageSize.x / 2, 0);

    const hideLeftTrimMarks = {
      topLeftHoriz: true,
      topLeftVert: true,
      bottomLeftHoriz: true,
      bottomLeftVert: true,
    };
    const hideRightTrimMarks = {
      topRightHoriz: true,
      topRightVert: true,
      bottomRightHoriz: true,
      bottomRightVert: true,
    };

    drawPageWithTrimMarks(
      frontSheet,
      srcPages[indexGroup.front1],
      rightPageOrigin,
      {
        bleedArea,
        trimLength,
        trimOffset,
        hideTrimMarks: hideLeftTrimMarks,
      },
    );

    drawPageWithTrimMarks(
      backSheet,
      srcPages[indexGroup.back1],
      leftPageOrigin,
      {
        bleedArea,
        trimLength,
        trimOffset,
        hideTrimMarks: hideRightTrimMarks,
      },
    );

    drawPageWithTrimMarks(
      frontSheet,
      srcPages[indexGroup.front2],
      leftPageOrigin,
      {
        bleedArea,
        trimLength,
        trimOffset,
        hideTrimMarks: hideRightTrimMarks,
      },
    );

    drawPageWithTrimMarks(
      backSheet,
      srcPages[indexGroup.back2],
      rightPageOrigin,
      {
        bleedArea,
        trimLength,
        trimOffset,
        hideTrimMarks: hideLeftTrimMarks,
      },
    );
  }

  return outPdf;
}

const preset: Preset = {
  name,
  impose,
};

export default preset;
