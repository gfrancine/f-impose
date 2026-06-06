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
  checkboxInput,
  asBool,
} from "../settings";
import { inToPts, mmToPts } from "../utils";

/** sets up a a PDFDocument and embeds the source pages */
export async function setupOutPdf(srcPdf: PDFDocument) {
  const outPdf = await PDFDocument.create();
  const srcPages = await outPdf.embedPages(srcPdf.getPages()); // embed pages into the output

  return { outPdf, srcPages };
}

// should this be UPPER_SNAKE_CASE?
export const commonDefaults = {
  srcBleedArea: 3,
  trimLength: 5,
  trimOffset: 2,
};

/** preset utility/prelude to set up and retrieve the most commmon preset settings */
export function commonPresetSettings({
  orientation = "portrait",
  exclude = [],
}: {
  orientation?: "portrait" | "landscape";
  exclude?: ("sheetSize" | "srcPageScale" | "srcBleedArea" | "trimMarks")[];
} = {}) {
  const sheetWidth = orientation === "landscape" ? 297 : 210,
    sheetHeight = orientation === "landscape" ? 210 : 297;

  const commonSchemaItems: SettingsItemSchema[] = [];

  const getUnitsSetting = (rawSettings: RawSettings) =>
    getSetting(rawSettings, "units", (v) => (v ? (v as string) : "mm"));

  commonSchemaItems.push(
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

    commonSchemaItems.push(
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

  if (!exclude.includes("srcPageScale")) {
    commonSchemaItems.push(
      numberInput({
        id: "srcPageScale",
        name: "Scale Source Pages (%)",
        defaultValue: 100,
        min: 0,
      }),
    );
  }

  if (!exclude.includes("srcBleedArea")) {
    commonSchemaItems.push(
      numberInput({
        id: "srcBleedArea",
        name: "Source Bleed Area",
        defaultValue: commonDefaults.srcBleedArea,
        min: 0,
      }),
    );
  }

  if (!exclude.includes("trimMarks")) {
    commonSchemaItems.push(
      inputRow([
        numberInput({
          id: "trimLength",
          name: "Trim Mark Length",
          defaultValue: commonDefaults.trimLength,
          min: 0,
        }),
        numberInput({
          id: "trimOffset",
          name: "Trim Mark Offset",
          defaultValue: commonDefaults.trimOffset,
          min: 0,
        }),
      ]),
    );
  }

  const getCommonSettings = (rawSettings: RawSettings) => {
    const units = getUnitsSetting(rawSettings);
    const convertUnits = units === "mm" ? mmToPts : inToPts;

    return getSettings(rawSettings, {
      sheetWidth: (v) => convertUnits(asNumber(v, sheetWidth)),
      sheetHeight: (v) => convertUnits(asNumber(v, sheetHeight)),
      srcPageScale: (v) => asNumber(v, 100) / 100,
      srcBleedArea: (v) =>
        convertUnits(asNumber(v, commonDefaults.srcBleedArea)),
      trimLength: (v) => convertUnits(asNumber(v, commonDefaults.trimLength)),
      trimOffset: (v) => convertUnits(asNumber(v, commonDefaults.trimOffset)),
    });
  };

  return {
    commonSchemaItems,
    getCommonSettings,
  };
}

/** addon common preset settings for grid-based layout presets */
export function gridPresetSettings({
  exclude,
}: { exclude?: ("rowsCols" | "excessTrim")[] } = {}) {
  const gridSchemaItems: SettingsItemSchema[] = [];

  if (!exclude?.includes("rowsCols"))
    gridSchemaItems.push(
      inputRow([
        numberInput({
          id: "nRows",
          name: "Rows",
          min: 1,
          defaultValue: 1,
        }),
        numberInput({
          id: "nCols",
          name: "Columns",
          min: 1,
          defaultValue: 1,
        }),
      ]),
    );

  if (!exclude?.includes("excessTrim"))
    gridSchemaItems.push(
      checkboxInput({
        id: "excessTrimEnabled",
        name: "Show all trim marks (creates an extra gutter in the layout)",
        defaultValue: false,
      }),
    );

  const getGridSettings = (rawSettings: RawSettings) =>
    getSettings(rawSettings, {
      nRows: (v: string) => asNumber(v, 1),
      nCols: (v: string) => asNumber(v, 1),
      excessTrimEnabled: (v: string) => asBool(v, false),
    });

  return { gridSchemaItems, getGridSettings };
}
