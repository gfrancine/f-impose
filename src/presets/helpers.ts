/*

Helper / prelude functions for common preset operations

*/

import { PDFDocument } from "pdf-lib";
import {
  asNumber,
  getSettings,
  inputRow,
  numberInput,
  type RawSettings,
} from "../settings";
import { toPts } from "../utils";

/** sets up a a PDFDocument and embeds the source pages */
export async function setupOutPdf(srcPdf: PDFDocument) {
  const outPdf = await PDFDocument.create();
  const srcPages = await outPdf.embedPages(srcPdf.getPages()); // embed pages into the output

  return { outPdf, srcPages };
}

/** preset utility/prelude to set up and retrieve the most commmon preset settings */
export function standardPresetSettings({
  orientation = "potrait",
}: {
  orientation?: "potrait" | "landscape";
} = {}) {
  const sheetWidth = orientation === "landscape" ? 297 : 210,
    sheetHeight = orientation === "landscape" ? 210 : 297;

  const standardSchemaItems = [
    inputRow([
      numberInput({
        id: "sheetWidth",
        name: "Sheet Width",
        defaultValue: sheetWidth,
        min: 1,
      }),
      numberInput({
        id: "sheetHeight",
        name: "Sheet Height",
        defaultValue: sheetHeight,
        min: 1,
      }),
    ]),
    numberInput({
      id: "bleedArea",
      name: "Bleed Area",
      defaultValue: 3,
      min: 0,
    }),
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
  ];

  const getStandardSettings = (rawSettings: RawSettings) =>
    getSettings(rawSettings, {
      sheetWidth: (v) => toPts(asNumber(v, sheetWidth)),
      sheetHeight: (v) => toPts(asNumber(v, sheetHeight)),
      bleedArea: (v) => toPts(asNumber(v, 3)),
      trimLength: (v) => toPts(asNumber(v, 5)),
      trimOffset: (v) => toPts(asNumber(v, 2)),
    });

  return {
    standardSchemaItems,
    getStandardSettings,
  };
}
