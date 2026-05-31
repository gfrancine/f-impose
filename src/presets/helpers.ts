/*

Helper / prelude functions for common preset operations

*/

import { PDFDocument } from "pdf-lib";
import {
  asNumber,
  getSettings,
  inputRow,
  numberInput,
  selectInput,
  buttonInput,
  buttonGroup,
  type RawSettings,
  type SettingsItemSchema,
  getSetting,
} from "../settings";
import { inToPts, mmToPts } from "../utils";

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

  const getUnitsSetting = (rawSettings: RawSettings) =>
    getSetting(rawSettings, "units", (v) => (v ? (v as string) : "mm"));

  standardSchemaItems.push(
    selectInput({
      id: "units",
      name: "Units",
      defaultValue: "mm",
      options: [
        { id: "mm", name: "Millimeters" },
        { id: "in", name: "Inches" },
      ],
    }),
  );

  if (!exclude.includes("sheetSize")) {
    const a4Button = buttonInput({
      id: "setA4Size",
      name: "A4",
      onClick: (rawSettings, setRawSettings) => {
        const units = getUnitsSetting(rawSettings);
        if (units === "in") {
          setRawSettings({
            ...rawSettings,
            sheetWidth: orientation === "landscape" ? "11.69" : "8.27",
            sheetHeight: orientation === "landscape" ? "8.27" : "11.69",
          });
        } else {
          setRawSettings({
            ...rawSettings,
            sheetWidth: orientation === "landscape" ? "297" : "210",
            sheetHeight: orientation === "landscape" ? "210" : "297",
          });
        }
      },
    });

    const letterButton = buttonInput({
      id: "setLetterSize",
      name: "Letter",
      onClick: (rawSettings, setRawSettings) => {
        const units = getUnitsSetting(rawSettings);
        if (units === "in") {
          setRawSettings({
            ...rawSettings,
            sheetWidth: orientation === "landscape" ? "11" : "8.5",
            sheetHeight: orientation === "landscape" ? "8.5" : "11",
          });
        } else {
          setRawSettings({
            ...rawSettings,
            sheetWidth: orientation === "landscape" ? "279.4" : "215.9",
            sheetHeight: orientation === "landscape" ? "215.9" : "279.4",
          });
        }
      },
    });

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

        buttonGroup({
          id: "sizePresets",
          name: "Presets",
          buttons: [a4Button, letterButton],
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

  const getStandardSettings = (rawSettings: RawSettings) => {
    const units = getUnitsSetting(rawSettings);
    const convertUnits = units === "mm" ? mmToPts : inToPts;

    return getSettings(rawSettings, {
      sheetWidth: (v) => convertUnits(asNumber(v, sheetWidth)),
      sheetHeight: (v) => convertUnits(asNumber(v, sheetHeight)),
      bleedArea: (v) => convertUnits(asNumber(v, standardDefaults.bleedArea)),
      trimLength: (v) => convertUnits(asNumber(v, standardDefaults.trimLength)),
      trimOffset: (v) => convertUnits(asNumber(v, standardDefaults.trimOffset)),
    });
  };

  return {
    standardSchemaItems,
    getStandardSettings,
  };
}
