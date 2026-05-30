/*

Generic 1-up add trim mark preset

*/

import { PDFDocument } from "pdf-lib";
import { drawPageWithTrimMarks, toPts, Vec2 } from "../utils";
import type { Preset } from "../types";
import {
  asNumber,
  defineSettingsSchema,
  getSettings,
  inputRow,
  numberInput,
  type RawSettings,
} from "../settings";

const name = "Add Trim Marks";
const description = "Generic preset for imposing any PDF file with trim marks.";

const settingsSchema = defineSettingsSchema([
  inputRow([
    numberInput({
      id: "sheetWidth",
      name: "Sheet Width",
      defaultValue: 210,
      min: 1,
    }),
    numberInput({
      id: "sheetHeight",
      name: "Sheet Height",
      defaultValue: 297,
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
      sheetWidth: (v) => toPts(asNumber(v, 210)),
      sheetHeight: (v) => toPts(asNumber(v, 297)),
      bleedArea: (v) => toPts(asNumber(v, 3)),

      trimLength: (v) => toPts(asNumber(v, 5)),
      trimOffset: (v) => toPts(asNumber(v, 2)),
    });

  const sheetSize = new Vec2(sheetWidth, sheetHeight);
  const sheetCenter = sheetSize.div(2); // always work with center anchor points/origins

  // validate input & settings
  // ...

  for (const srcPage of srcPages) {
    const sheet = outPdf.addPage([sheetSize.x, sheetSize.y]);
    drawPageWithTrimMarks(sheet, srcPage, sheetCenter, {
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
