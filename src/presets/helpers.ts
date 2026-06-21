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
import { inToMm, inToPts, mmToIn, mmToPts } from "../utils";

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

/** shortcut for getting a 2-decimal-place number for sheet size presets (see below) */
const cleanDim = (n: number) => Number(n.toFixed(2));

// [width, height]
const SHEET_SIZE_PRESET_DIMS = {
  A4: {
    mm: [210, 297],
    in: [cleanDim(mmToIn(210)), cleanDim(mmToIn(297))],
  },
  Letter: {
    mm: [cleanDim(inToMm(8.5)), cleanDim(inToMm(11))],
    in: [8.5, 11],
  },
};

type SheetSizePresetName = keyof typeof SHEET_SIZE_PRESET_DIMS;
type LengthUnit = "mm" | "in";

function getPresetSheetDims(
  preset: SheetSizePresetName,
  units: LengthUnit,
  orientation: "portrait" | "landscape",
) {
  const dims = SHEET_SIZE_PRESET_DIMS[preset][units];
  return {
    sheetWidth: orientation === "landscape" ? dims[1] : dims[0],
    sheetHeight: orientation === "landscape" ? dims[0] : dims[1],
  };
}

/** preset utility/prelude to set up and retrieve the most commmon preset settings */
export function commonPresetSettings({
  orientation = "portrait",
  exclude = [],
}: {
  orientation?: "portrait" | "landscape";
  exclude?: ("sheetSize" | "srcPageScale" | "srcBleedArea" | "trimMarks")[];
} = {}) {
  const { sheetWidth, sheetHeight } = getPresetSheetDims(
    "A4",
    "mm",
    orientation,
  );

  const commonSchemaItems: SettingsItemSchema[] = [];

  const getUnitsSetting = (rawSettings: RawSettings) =>
    getSetting(rawSettings, "units", (v) =>
      v ? (v as string) : "mm",
    ) as LengthUnit;

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
    /** shortcut for defining a preset button based on the SHEET_DIMS lookup */
    const sheetPresetButton = (presetName: SheetSizePresetName) =>
      buttonInput({
        id: `set${presetName}Size`,
        name: presetName,
        onClick: (rawSettings, setRawSettings) => {
          const units = getUnitsSetting(rawSettings);
          const { sheetWidth, sheetHeight } = getPresetSheetDims(
            presetName,
            units,
            orientation,
          );
          setRawSettings({
            ...rawSettings,
            sheetWidth: sheetWidth + "",
            sheetHeight: sheetHeight + "",
          });
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
          buttons: [sheetPresetButton("A4"), sheetPresetButton("Letter")],
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
