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
  type SettingsItemSchema,
} from "../settings";
import { toPts } from "../utils";

/** sets up a a PDFDocument and embeds the source pages */
export async function setupOutPdf(srcPdf: PDFDocument) {
  const outPdf = await PDFDocument.create();
  const srcPages = await outPdf.embedPages(srcPdf.getPages()); // embed pages into the output

  return { outPdf, srcPages };
}

// should this be UPPER_SNAKE_CASE?
export const standardDefaults = {
  bleedArea: 3,
  trimLength: 5,
  trimOffset: 2,
};

/** preset utility/prelude to set up and retrieve the most commmon preset settings */
export function standardPresetSettings({
  orientation = "portrait",
  exclude = [],
}: {
  orientation?: "portrait" | "landscape";
  exclude?: ("sheetSize" | "bleedArea" | "trimMarks")[];
} = {}) {
  const sheetWidth = orientation === "landscape" ? 297 : 210,
    sheetHeight = orientation === "landscape" ? 210 : 297;

  const standardSchemaItems: SettingsItemSchema[] = [];

  if (!exclude.includes("sheetSize")) {
    standardSchemaItems.push(
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
    );
  }

  if (!exclude.includes("bleedArea")) {
    standardSchemaItems.push(
      numberInput({
        id: "bleedArea",
        name: "Bleed Area",
        defaultValue: standardDefaults.bleedArea,
        min: 0,
      }),
    );
  }

  if (!exclude.includes("trimMarks")) {
    standardSchemaItems.push(
      inputRow([
        numberInput({
          id: "trimLength",
          name: "Trim Mark Length",
          defaultValue: standardDefaults.trimLength,
          min: 0,
        }),
        numberInput({
          id: "trimOffset",
          name: "Trim Mark Offset",
          defaultValue: standardDefaults.trimOffset,
          min: 0,
        }),
      ]),
    );
  }

  const getStandardSettings = (rawSettings: RawSettings) =>
    getSettings(rawSettings, {
      sheetWidth: (v) => toPts(asNumber(v, sheetWidth)),
      sheetHeight: (v) => toPts(asNumber(v, sheetHeight)),
      bleedArea: (v) => toPts(asNumber(v, standardDefaults.bleedArea)),
      trimLength: (v) => toPts(asNumber(v, standardDefaults.trimLength)),
      trimOffset: (v) => toPts(asNumber(v, standardDefaults.trimOffset)),
    });

  return {
    standardSchemaItems,
    getStandardSettings,
  };
}
