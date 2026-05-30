/*

Saddle-Stitched Booklet 2-Up

*/

import { PDFDocument } from "pdf-lib";
import { drawSpread, mapIndicesSaddleStitch, toPts, Vec2 } from "../utils";
import type { Preset } from "../types";
import {
  asNumber,
  defineSettingsSchema,
  getSettings,
  inputRow,
  numberInput,
  type RawSettings,
} from "../settings";

const name = "Saddle-Stitched Booklet 2-Up";
const description =
  "Generic 2-up saddle-stitched booklet. To remove inner/spine bleeds, check out the 'Remove Inner Bleed' preset.";

const settingsSchema = defineSettingsSchema([
  inputRow([
    numberInput({
      id: "sheetWidth",
      name: "Sheet Width",
      defaultValue: 297,
      min: 1,
    }),
    numberInput({
      id: "sheetHeight",
      name: "Sheet Height",
      defaultValue: 210,
      min: 1,
    }),
  ]),
  numberInput({ id: "bleedArea", name: "Bleed Area", defaultValue: 3, min: 0 }),
  inputRow([
    numberInput({
      id: "trimLength",
      name: "Trim Mark Length",
      defaultValue: 5,
      min: 0,
    }),
    numberInput({
      id: "trimOffset",
      name: "Trim Mark Offset",
      defaultValue: 2,
      min: 0,
    }),
  ]),
]);

async function impose(srcPdf: PDFDocument, rawSettings: RawSettings) {
  const outPdf = await PDFDocument.create();
  const srcPages = await outPdf.embedPages(srcPdf.getPages()); // embed pages into the output

  const { sheetWidth, sheetHeight, bleedArea, trimLength, trimOffset } =
    getSettings(rawSettings, {
      sheetWidth: (v) => toPts(asNumber(v, 297)),
      sheetHeight: (v) => toPts(asNumber(v, 210)),
      bleedArea: (v) => toPts(asNumber(v, 3)),
      trimLength: (v) => toPts(asNumber(v, 5)),
      trimOffset: (v) => toPts(asNumber(v, 2)),
    });

  const sheetSize = new Vec2(sheetWidth, sheetHeight);
  const sheetCenter = sheetSize.div(2); // always work with center anchor points/origins

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
  description,
  settingsSchema,
  impose,
};

export default preset;
