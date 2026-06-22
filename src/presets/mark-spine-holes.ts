/*

Mark spine holes

*/

import { grayscale, PDFDocument } from "pdf-lib";
import type { Preset } from "../types";
import {
  asBool,
  asNumber,
  checkboxInput,
  defineSettingsSchema,
  getSettings,
  numberInput,
  selectInput,
  type RawSettings,
} from "../settings";
import { getUnitToPtsConversion, setupOutPdf, unitsSettings } from "./helpers";
import { assert } from "../utils";

const name = "Mark Spine Holes";
const description =
  "Takes a PDF with facing pages and adds small markers on the spine/inner side of pages, where holes can be punched for bookbinding.";

// Preset settings
const { getUnitsSetting, unitsInputSchema } = unitsSettings();

const settingsSchema = defineSettingsSchema([
  checkboxInput({
    id: "markInnerSpread",
    name: "Mark the innermost spread",
    defaultValue: true,
  }),
  checkboxInput({
    id: "markOuterSpread",
    name: "Mark the cover spread",
  }),
  numberInput({
    id: "nMarks",
    name: "Number of Markers",
    min: 2,
    defaultValue: 2,
  }),
  unitsInputSchema,
  numberInput({
    id: "offsetTop",
    name: "Offset From Top",
    min: 0,
    defaultValue: 10,
  }),
  numberInput({
    id: "offsetBottom",
    name: "Offset From Bottom",
    min: 0,
    defaultValue: 10,
  }),
  numberInput({
    id: "markSize",
    name: "Marker Size",
    min: 0,
    defaultValue: 0.5,
  }),
  selectInput({
    id: "markSize",
    name: "Marker Color",
    defaultValue: "black",
    options: [
      { id: "black", name: "Black" },
      { id: "white", name: "White" },
    ],
  }),
]);

// Imposition
async function impose(srcPdf: PDFDocument, rawSettings: RawSettings) {
  const units = getUnitsSetting(rawSettings);
  const toPts = getUnitToPtsConversion(units);
  const {
    nMarks,
    markInnerSpread,
    markOuterSpread,
    offsetTop,
    offsetBottom,
    markSize,
    markColor,
  } = getSettings(rawSettings, {
    nMarks: (v) => Math.floor(asNumber(v, 2)),
    markInnerSpread: (v) => asBool(v, true),
    markOuterSpread: (v) => asBool(v, false),
    offsetTop: (v) => toPts(asNumber(v, 10)),
    offsetBottom: (v) => toPts(asNumber(v, 10)),
    markSize: (v) => toPts(asNumber(v, 0.5)),
    markColor: (v) => (v === "white" ? v : "black"),
  });

  const { outPdf, srcPages } = await setupOutPdf(srcPdf);

  assert(
    srcPages.length >= 0,
    "PDF must have a minimum of 2 pages (1 full spread).",
  );
  const outerSpreadIndices = { r: 0, l: srcPages.length - 1 };
  const innerSpreadIndices = {
    r: srcPages.length / 2,
    l: srcPages.length / 2 - 1,
  };

  for (let i = 0; i < srcPages.length; i++) {
    const srcPage = srcPages[i];
    const outPage = outPdf.addPage([srcPage.width, srcPage.height]);
    outPage.drawPage(srcPage);

    const drawMark = (x: number, y: number) => {
      outPage.drawCircle({
        x,
        y,
        size: markSize,
        color: markColor === "black" ? grayscale(0) : grayscale(1),
        borderWidth: 0.25,
        borderColor: grayscale(1),
      });
    };

    const drawMarks = (x: number) => {
      drawMark(x, srcPage.height - offsetTop); // top mark
      drawMark(x, offsetBottom); // bottom mark

      // everything in-between
      const markLineLength = srcPage.height - offsetBottom - offsetTop;
      const gap = markLineLength / (nMarks - 1);
      for (let i = 0; i < nMarks - 2; i++) {
        drawMark(x, offsetBottom + gap * (i + 1));
      }
    };

    if (markOuterSpread) {
      if (i === outerSpreadIndices.l) drawMarks(srcPage.width);
      else if (i === outerSpreadIndices.r) drawMarks(0);
    }

    if (markInnerSpread) {
      assert(
        srcPages.length >= 4,
        "Cannot find innermost spread (amount of pages is less than 4).",
      );
      if (i === innerSpreadIndices.l) drawMarks(srcPage.width);
      else if (i === innerSpreadIndices.r) drawMarks(0);
    }
  }

  return outPdf;
}

export const preset: Preset = {
  name,
  description,
  settingsSchema,
  impose,
};

export default preset;
