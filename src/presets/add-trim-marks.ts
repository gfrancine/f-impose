/*

Generic 1-up add trim mark preset

*/

import { PDFDocument } from "pdf-lib";
import { drawPageWithTrimMarks, toPts, Vec2 } from "../utils";
import type { Preset } from "../types";
import { defineSettingsSchema, inputRow, numberInput } from "../settings";

const name = "Add Trim Marks";

const DEFAULT_SETTINGS = {
  sheetWidth: 210,
  sheetHeight: 297,
  bleedArea: 5,
  trimMarkLength: 5,
  trimMarkOffset: 2,
};

const settingsSchema = defineSettingsSchema([
  inputRow([
    numberInput({ id: "sheetWidth", name: "Sheet Width", defaultValue: 210 }),
    numberInput({ id: "sheetHeight", name: "Sheet Height", defaultValue: 297 }),
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
  settingsSchema,
  impose,
};

export default preset;
