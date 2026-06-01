/*

Saddle-Stitched Tall Booklet 4-Up

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

const name = "Saddle-Stitched Tall Booklet 4-Up";
const description =
  "Imposes two saddle-stitched booklet spreads per sheet. Good for tall booklets.";

const { standardSchemaItems, getStandardSettings } = standardPresetSettings({
  orientation: "landscape",
});
const settingsSchema = defineSettingsSchema(standardSchemaItems);

async function impose(srcPdf: PDFDocument, rawSettings: RawSettings) {
  const { outPdf, srcPages } = await setupOutPdf(srcPdf);
  const { sheetWidth, sheetHeight, bleedArea, trimLength, trimOffset } =
    getStandardSettings(rawSettings);

  const sheetSize = new Vec2(sheetWidth, sheetHeight);
  const sheetCenter = sheetSize.div(2);
  // TODO: add option to enable gutter & inner trim marks
  // const excessTrim = calcExcessTrim(bleedArea, trimLength, trimOffset);

  // validate input & settings
  // will throw if page count isn't a multiple of 4
  const indexGroups = mapIndicesSaddleStitch(srcPages.length);

  const calcLeafTotalWidth = (leaf: SaddleStitchIndexGroup) =>
    // handle pages of  different sizes
    Math.max(srcPages[leaf.front2].width, srcPages[leaf.back2].width) +
    Math.max(srcPages[leaf.front1].width, srcPages[leaf.back1].width);

  for (let i = 0; i < indexGroups.length; i += 2) {
    const frontSheet = outPdf.addPage([sheetSize.x, sheetSize.y]);
    const backSheet = outPdf.addPage([sheetSize.x, sheetSize.y]);

    const leaf1 = indexGroups[i];
    const leaf2: SaddleStitchIndexGroup | undefined = indexGroups[i + 1]; // may not exist. test handling with odd leaf count booklets

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
      origin: sheetCenter.sub(leaf1Width / 2, 0),
      leftPage: srcPages[leaf1.front2],
      rightPage: srcPages[leaf1.front1],
      bleedArea,
      trimLength,
      trimOffset,
      hideTrimMarks: hideRightHorizTrimMarks,
    });

    drawSpread(backSheet, {
      origin: sheetCenter.add(leaf1Width / 2, 0),
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
        origin: sheetCenter.add(leaf2Width / 2, 0),
        leftPage: srcPages[leaf2.front2],
        rightPage: srcPages[leaf2.front1],
        bleedArea,
        trimLength,
        trimOffset,
        hideTrimMarks: hideLeftHorizTrimMarks,
      });

      drawSpread(backSheet, {
        origin: sheetCenter.sub(leaf2Width / 2, 0),
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
  description,
  settingsSchema,
  impose,
};

export default preset;
