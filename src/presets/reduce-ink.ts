/*

Reduce Ink/Opacity

*/

import { cmyk, PDFDocument } from "pdf-lib";
import type { Preset } from "../types";
import { setupOutPdf } from "./helpers";
import {
  asNumber,
  defineSettingsSchema,
  getSetting,
  numberInput,
  type RawSettings,
} from "../settings";

const name = "Reduce Ink/Opacity";
const description =
  "Sets the opacity of PDF documents. Useful for reducing the amount of ink used when printing.";

const settingsSchema = defineSettingsSchema([
  numberInput({
    id: "opacity",
    name: "Opacity (%)",
    min: 0,
    max: 100,
    defaultValue: 100,
  }),
]);

async function impose(srcPdf: PDFDocument, rawSettings: RawSettings) {
  const { outPdf, srcPages } = await setupOutPdf(srcPdf);
  const opacity = getSetting(
    rawSettings,
    "opacity",
    (v) => asNumber(v, 100) / 100,
  );

  for (const srcPage of srcPages) {
    const w = srcPage.width;
    const h = srcPage.height;
    const sheet = outPdf.addPage([w, h]);

    // For some reason the `opacity` option doesn't affect trim marks
    // drawn by this app. Use a white rectangle monkey-patch for now
    // sheet.drawPage(srcPage, { x: 0, y: 0, width: w, height: h, opacity });

    sheet.drawPage(srcPage, { x: 0, y: 0, width: w, height: h });
    sheet.drawRectangle({
      // white rectangle
      x: 0,
      y: 0,
      width: w,
      height: h,
      opacity: 1 - opacity,
      color: cmyk(0, 0, 0, 0),
    });
  }

  return outPdf;
}

const preset: Preset = {
  name,
  settingsSchema,
  description,
  impose,
};

export default preset;
