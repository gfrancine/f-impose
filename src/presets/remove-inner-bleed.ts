/*

Removes inner bleed from PDFs with facing pages

*/
// Authored with Big Pickle

import { PDFDocument } from "pdf-lib";
import { assert, toPts } from "../utils";
import type { Preset } from "../types";
import { defineSettingsSchema, numberInput } from "../settings";

const name = "Remove Inner Bleed";

const DEFAULT_SETTINGS = {
  bleedArea: 5,
};

const settingsSchema = defineSettingsSchema([
  numberInput({ id: "bleedArea", name: "Bleed Area", defaultValue: 3, min: 0 }),
]);

async function impose(srcPdf: PDFDocument, settings = DEFAULT_SETTINGS) {
  const outPdf = await PDFDocument.create();
  const srcPages = await outPdf.embedPages(srcPdf.getPages());
  const bleedArea = toPts(settings.bleedArea);

  for (let i = 0; i < srcPages.length; i++) {
    const srcPage = srcPages[i];
    const newWidth = srcPage.width - bleedArea;
    assert(newWidth > 0, "Bleed area must be smaller than page width");
    const isRecto = (i + 1) % 2 === 1; // right-hand page

    const sheet = outPdf.addPage([newWidth, srcPage.height]);
    sheet.drawPage(srcPage, {
      x: isRecto ? -bleedArea : 0,
      y: 0,
      width: srcPage.width,
      height: srcPage.height,
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
