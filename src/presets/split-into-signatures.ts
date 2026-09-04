/*

Split Into Signatures

*/

import { PDFDocument } from "pdf-lib";
import type { Preset } from "../types";
import {
  asNumber,
  defineSettingsSchema,
  getSettings,
  numberInput,
  type RawSettings,
} from "../settings";

const name = "Split Into Signatures";
const description =
  "Splits a PDF by the amount of paper sheets (or leaves) per signature. Will NOT impose into booklets, only splits into multiple PDFs—see the saddle-stitched booklet presets instead!";

const settingsSchema = defineSettingsSchema([
  numberInput({
    id: "signatureSheetCount",
    name: "Sheets Per Signature",
    defaultValue: 1,
    min: 1,
  }),
]);

async function impose(srcPdf: PDFDocument, rawSettings: RawSettings) {
  const { signatureSheetCount } = getSettings(rawSettings, {
    signatureSheetCount: (v) => asNumber(v, 1),
  });
  const signaturePageCount = signatureSheetCount * 4;
  const srcPages = await srcPdf.getPages();
  const outPdfs: PDFDocument[] = [];
  const nOutPdfs = Math.ceil(srcPages.length / signaturePageCount);

  for (let i = 0; i < nOutPdfs; i++) {
    const srcPagesIdxOffset = i * signaturePageCount;
    const srcPagesSlice = srcPages.slice(
      srcPagesIdxOffset,
      srcPagesIdxOffset + signaturePageCount,
    );
    const outPdf = await PDFDocument.create();
    outPdfs.push(outPdf);
    const embeddedSrcPages = await outPdf.embedPages(srcPagesSlice);

    embeddedSrcPages.forEach((srcPage) => {
      const outPage = outPdf.addPage([srcPage.width, srcPage.height]);
      outPage.drawPage(srcPage);
    });
  }

  return outPdfs;
}

const preset: Preset = {
  name,
  description,
  settingsSchema,
  impose,
};

export default preset;
