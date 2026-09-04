/*

Crop Pages

*/

import { PDFDocument } from "pdf-lib";
import { assert, Vec2 } from "../utils";
import type { Preset } from "../types";
import {
  asBool,
  asNumber,
  checkboxInput,
  defineSettingsSchema,
  getSettings,
  numberInput,
  type RawSettings,
} from "../settings";
import { setupOutPdf, unitsSettings, getUnitToPtsConversion } from "./helpers";

const name = "Crop Pages";
const description =
  "Crops PDF pages. Supports left/right or inner/outer measurements.";

const { getUnitsSetting, unitsInputSchema } = unitsSettings();

const settingsSchema = defineSettingsSchema([
  unitsInputSchema,
  checkboxInput({
    id: "useInnerOuter",
    name: "Use inner/outer instead of left/right",
    tooltip:
      "For booklets/signatures with facing pages. Crops the left margin on recto pages (the right-hand pages) and the right margin on verso (left-hand) pages",
    defaultValue: false,
  }),
  numberInput({
    id: "cropTop",
    name: "Top",
    defaultValue: 0,
    min: 0,
  }),
  numberInput({
    id: "cropBottom",
    name: "Bottom",
    defaultValue: 0,
    min: 0,
  }),
  numberInput({
    id: "cropLeftInner",
    name: "Left/Inner",
    defaultValue: 0,
    min: 0,
  }),
  numberInput({
    id: "cropRightOuter",
    name: "Right/Outer",
    defaultValue: 0,
    min: 0,
  }),
]);

async function impose(srcPdf: PDFDocument, rawSettings: RawSettings) {
  const { outPdf, srcPages } = await setupOutPdf(srcPdf);
  const unit = getUnitsSetting(rawSettings);
  const toPts = getUnitToPtsConversion(unit);
  const { useInnerOuter, cropTop, cropBottom, cropLeftInner, cropRightOuter } =
    getSettings(rawSettings, {
      useInnerOuter: (v) => asBool(v, false),
      cropTop: (v) => toPts(asNumber(v, 0)),
      cropBottom: (v) => toPts(asNumber(v, 0)),
      cropLeftInner: (v) => toPts(asNumber(v, 0)),
      cropRightOuter: (v) => toPts(asNumber(v, 0)),
    });

  for (let i = 0; i < srcPages.length; i++) {
    const srcPage = srcPages[i];
    const newDims = new Vec2(
      srcPage.width - cropLeftInner - cropRightOuter,
      srcPage.height - cropTop - cropBottom,
    );
    assert(newDims.x > 0, "Resulting page width is 0 or less.");
    assert(newDims.y > 0, "Resulting page height is 0 or less.");
    const outPage = outPdf.addPage([newDims.x, newDims.y]);

    const isRecto = (i + 1) % 2 === 1; // right-hand page
    const cropLeft = useInnerOuter
      ? isRecto
        ? cropLeftInner
        : cropRightOuter
      : cropLeftInner;

    outPage.drawPage(srcPage, {
      x: -cropLeft,
      y: -cropBottom,
      width: srcPage.width,
      height: srcPage.height,
    });
  }

  return [outPdf];
}

const preset: Preset = {
  name,
  description,
  settingsSchema,
  impose,
};

export default preset;
