/*

Saddle-Stitched Booklet 4-Up

*/

import { PDFDocument } from "pdf-lib";
import {
  drawSpread,
  mapIndicesSaddleStitch,
  Vec2,
  type SaddleStitchIndexGroup,
} from "../utils";
import type { Preset } from "../types";
import { defineSettingsSchema, type RawSettings } from "../settings";
import { setupOutPdf, standardPresetSettings } from "./helpers";

const name = "Saddle-Stitched Booklet 4-Up";
const description = "Imposes two saddle-stitched booklet spreads per sheet.";

const { standardSchemaItems, getStandardSettings } = standardPresetSettings({
  orientation: "portrait",
});
const settingsSchema = defineSettingsSchema(standardSchemaItems);

async function impose(srcPdf: PDFDocument, rawSettings: RawSettings) {
  const { outPdf, srcPages } = await setupOutPdf(srcPdf);
  const {
    sheetWidth,
    sheetHeight,
    srcPageScale,
    srcBleedArea,
    trimLength,
    trimOffset,
  } = getStandardSettings(rawSettings);

  const sheetSize = new Vec2(sheetWidth, sheetHeight);
  const sheetCenter = sheetSize.div(2);
  // TODO: add option to enable gutter & inner trim marks
  // const excessTrim = calcExcessTrim(srcBleedArea, trimLength, trimOffset);

  // validate input & settings
  // will throw if page count isn't a multiple of 4
  const indexGroups = mapIndicesSaddleStitch(srcPages.length);

  // handle pages of  different sizes
  const calcLeafTotalHeight = (leaf: SaddleStitchIndexGroup) =>
    Math.max(
      srcPages[leaf.front1].height,
      srcPages[leaf.back1].height,
      srcPages[leaf.front2].height,
      srcPages[leaf.back2].height,
    ) * srcPageScale;

  for (let i = 0; i < indexGroups.length; i += 2) {
    const frontSheet = outPdf.addPage([sheetSize.x, sheetSize.y]);
    const backSheet = outPdf.addPage([sheetSize.x, sheetSize.y]);

    const leaf1 = indexGroups[i];
    const leaf2: SaddleStitchIndexGroup | undefined = indexGroups[i + 1]; // may not exist. test handling with odd leaf count booklets

    const hideTopVertTrimMarks = {
      topRightVert: true,
      topLeftVert: true,
    };

    const hideBottomVertTrimMarks = {
      bottomRightVert: true,
      bottomLeftVert: true,
    };

    const leaf1Height = calcLeafTotalHeight(leaf1);

    drawSpread(frontSheet, {
      origin: sheetCenter.add(0, leaf1Height / 2),
      leftPage: srcPages[leaf1.front2],
      rightPage: srcPages[leaf1.front1],
      srcPageScale,
      srcBleedArea,
      trimLength,
      trimOffset,
      hideTrimMarks: hideBottomVertTrimMarks,
    });

    drawSpread(backSheet, {
      origin: sheetCenter.add(0, leaf1Height / 2),
      leftPage: srcPages[leaf1.back1],
      rightPage: srcPages[leaf1.back2],
      srcPageScale,
      srcBleedArea,
      trimLength,
      trimOffset,
      hideTrimMarks: hideBottomVertTrimMarks,
    });

    if (leaf2) {
      const leaf2Height = calcLeafTotalHeight(leaf2);

      drawSpread(frontSheet, {
        origin: sheetCenter.sub(0, leaf2Height / 2),
        leftPage: srcPages[leaf2.front2],
        rightPage: srcPages[leaf2.front1],
        srcPageScale,
        srcBleedArea,
        trimLength,
        trimOffset,
        hideTrimMarks: hideTopVertTrimMarks,
      });

      drawSpread(backSheet, {
        origin: sheetCenter.sub(0, leaf2Height / 2),
        leftPage: srcPages[leaf2.back1],
        rightPage: srcPages[leaf2.back2],
        srcPageScale,
        srcBleedArea,
        trimLength,
        trimOffset,
        hideTrimMarks: hideTopVertTrimMarks,
      });
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
