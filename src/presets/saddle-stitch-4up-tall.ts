/*

Saddle-Stitched Tall Booklet 4-Up

*/

import { PDFDocument } from "pdf-lib";
import {
  calcExtraGutter,
  drawSpread,
  mapIndicesSaddleStitch,
  toPts,
  Vec2,
  type SaddleStitchIndexGroup,
} from "../utils";
import type { Preset } from "../types";
import { defineSettingsSchema, inputRow, numberInput } from "../settings";

const name = "Saddle-Stitched Tall Booklet 4-Up";

const DEFAULT_SETTINGS = {
  sheetWidth: 297,
  sheetHeight: 210,
  bleedArea: 5,
  trimMarkLength: 5,
  trimMarkOffset: 2,
};

const settingsSchema = defineSettingsSchema([
  inputRow([
    numberInput({ id: "sheetWidth", name: "Sheet Width", defaultValue: 297 }),
    numberInput({ id: "sheetHeight", name: "Sheet Height", defaultValue: 210 }),
  ]),
  numberInput({ id: "bleedArea", name: "Bleed Area", defaultValue: 3 }),
  inputRow([
    numberInput({
      id: "trimMarkLength",
      name: "Trim Mark Length",
      defaultValue: 5,
    }),
    numberInput({
      id: "trimMarkOffset",
      name: "Trim Mark Offset",
      defaultValue: 2,
    }),
  ]),
]);

async function impose(srcPdf: PDFDocument, settings = DEFAULT_SETTINGS) {
  const outPdf = await PDFDocument.create();
  const srcPages = await outPdf.embedPages(srcPdf.getPages());

  const sheetSize = new Vec2(
    toPts(settings.sheetWidth),
    toPts(settings.sheetHeight),
  );
  const sheetCenter = sheetSize.div(2);
  const bleedArea = toPts(settings.bleedArea);
  const trimLength = toPts(settings.trimMarkLength);
  const trimOffset = toPts(settings.trimMarkOffset);
  const extraGutter = calcExtraGutter(bleedArea, trimLength, trimOffset);

  // validate input & settings
  // will throw if page count isn't a multiple of 4
  const indexGroups = mapIndicesSaddleStitch(srcPages.length);

  const calcLeafTotalWidth = (leaf: SaddleStitchIndexGroup) =>
    // handle pages of  different sizes
    Math.max(srcPages[leaf.front2].width, srcPages[leaf.back2].width) +
    Math.max(srcPages[leaf.front1].width, srcPages[leaf.back1].width) +
    (-bleedArea + trimOffset + trimLength) * 2;

  for (let i = 0; i < indexGroups.length; i += 2) {
    const frontSheet = outPdf.addPage([sheetSize.x, sheetSize.y]);
    const backSheet = outPdf.addPage([sheetSize.x, sheetSize.y]);

    const leaf1 = indexGroups[i];
    const leaf2: SaddleStitchIndexGroup | undefined = indexGroups[i + 1]; // may not exist. test handling with odd leaf count booklets

    // TODO: add boolean options to enable gutter & inner trim marks

    const hideRightHorizTrimMarks = {
      topRightHoriz: true,
      bottomRightHoriz: true,
    };

    const hideLeftHorizTrimMarks = {
      topLeftHoriz: true,
      bottomLeftHoriz: true,
    };

    const leaf1Width = calcLeafTotalWidth(leaf1);

    drawSpread(frontSheet, {
      origin: sheetCenter.sub(leaf1Width / 2, 0).add(extraGutter, 0),
      leftPage: srcPages[leaf1.front2],
      rightPage: srcPages[leaf1.front1],
      bleedArea,
      trimLength,
      trimOffset,
      hideTrimMarks: hideRightHorizTrimMarks,
    });

    drawSpread(backSheet, {
      origin: sheetCenter.add(leaf1Width / 2, 0).sub(extraGutter, 0),
      leftPage: srcPages[leaf1.back1],
      rightPage: srcPages[leaf1.back2],
      bleedArea,
      trimLength,
      trimOffset,
      hideTrimMarks: hideLeftHorizTrimMarks,
    });

    if (leaf2) {
      const leaf2Width = calcLeafTotalWidth(leaf2);

      drawSpread(frontSheet, {
        origin: sheetCenter.add(leaf2Width / 2, 0).sub(extraGutter, 0),
        leftPage: srcPages[leaf2.front2],
        rightPage: srcPages[leaf2.front1],
        bleedArea,
        trimLength,
        trimOffset,
        hideTrimMarks: hideLeftHorizTrimMarks,
      });

      drawSpread(backSheet, {
        origin: sheetCenter.sub(leaf2Width / 2, 0).add(extraGutter, 0),
        leftPage: srcPages[leaf2.back1],
        rightPage: srcPages[leaf2.back2],
        bleedArea,
        trimLength,
        trimOffset,
        hideTrimMarks: hideRightHorizTrimMarks,
      });
    }
  }

  return outPdf;
}

const preset: Preset = {
  name,
  settingsSchema,
  impose,
};

export default preset;
