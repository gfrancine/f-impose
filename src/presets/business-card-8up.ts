/*

Business Card 8-Up
- 8-up
- Long edge flip
- One- and double-side support

*/

import { PDFDocument } from "pdf-lib";
import {
  assert,
  calcExtraGutter,
  drawPageWithTrimMarks,
  toPts,
  Vec2,
} from "../utils";
import type { Preset } from "../types";
import { defineSettingsSchema, inputRow, numberInput } from "../settings";

const name = "Business Card 8-Up";

const DEFAULT_SETTINGS = {
  // just here temporarily
  sheetWidth: 210,
  sheetHeight: 297,
  bleedArea: 5,
  trimMarkLength: 5,
  trimMarkOffset: 2,
};

const settingsSchema = defineSettingsSchema([
  inputRow([
    numberInput({
      id: "sheetWidth",
      name: "Sheet Width",
      defaultValue: 210,
      min: 1,
    }),
    numberInput({
      id: "sheetHeight",
      name: "Sheet Height",
      defaultValue: 297,
      min: 1,
    }),
  ]),
  numberInput({ id: "bleedArea", name: "Bleed Area", defaultValue: 3, min: 0 }),
  inputRow([
    numberInput({
      id: "trimMarkLength",
      name: "Trim Mark Length",
      defaultValue: 5,
      min: 0,
    }),
    numberInput({
      id: "trimMarkOffset",
      name: "Trim Mark Offset",
      defaultValue: 2,
      min: 0,
    }),
  ]),
]);

async function impose(srcPdf: PDFDocument, settings = DEFAULT_SETTINGS) {
  const outPdf = await PDFDocument.create();
  const srcPages = await outPdf.embedPages(srcPdf.getPages()); // embed pages into the output

  const sheetSize = new Vec2(
    toPts(settings.sheetWidth),
    toPts(settings.sheetHeight),
  );
  const sheetCenter = sheetSize.div(2); // always work with center anchor points/origins
  const bleedArea = toPts(settings.bleedArea);
  const trimLength = toPts(settings.trimMarkLength);
  const trimOffset = toPts(settings.trimMarkOffset);

  // validate input & settings
  // 2 for a front and back page
  assert(
    srcPages.length === 1 || srcPages.length === 2,
    "Source PDF must exactly be 1 or 2 pages.",
  );
  // make sure the output is portrait. the layout will be 4 rows x 2 columns
  assert(sheetSize.x <= sheetSize.y, "Output PDF must be portrait.");
  // TODO handle minimum sheet width/height .
  // TODO max trim mark length + offset.
  // TODO bleed area must be <  trim mark + offset
  // or maybe not enforce minimum/max sizes at all?

  // handle landscape/not
  // TODO: rotate the card on the center instead of throwing error
  const isSrcPdfLandscape = srcPages[0].width > srcPages[0].height;
  assert(isSrcPdfLandscape, "Source PDF must be landscape.");

  for (const srcPage of srcPages) {
    // create sheet
    const sheet = outPdf.addPage([sheetSize.x, sheetSize.y]);

    const extraGutter = calcExtraGutter(bleedArea, trimLength, trimOffset);

    const totalImposedWidth =
      srcPage.width + (-bleedArea + trimOffset + trimLength - extraGutter) * 2;
    const totalImposedHeight =
      srcPage.height + (-bleedArea + trimOffset + trimLength - extraGutter) * 2;

    const N_ROWS = 4;
    const N_COLS = 2;

    for (let row = 1; row < N_ROWS + 1; row++) {
      const directionY = row <= N_ROWS / 2 ? -1 : 1; // draw upwards from center for the first half of rows
      const rowFromCenter = directionY < 0 ? -row : N_ROWS / 2 - row; // distance from center
      const originY =
        sheetCenter.y +
        directionY * rowFromCenter * totalImposedHeight +
        // dont forget to offset by half the page size
        (directionY * totalImposedHeight) / 2;

      for (let col = 1; col < N_COLS + 1; col++) {
        const directionX = col <= N_COLS / 2 ? -1 : 1;
        const colFromCenter = directionX < 0 ? -col : N_COLS / 2 - col;
        const originX =
          sheetCenter.x +
          directionX * colFromCenter * totalImposedWidth +
          (directionX * totalImposedWidth) / 2;

        drawPageWithTrimMarks(sheet, srcPage, new Vec2(originX, originY), {
          bleedArea,
          trimLength,
          trimOffset,
        });
      }
    }
  }

  return outPdf;
}

const preset: Preset = {
  name,
  settingsSchema,
  impose,
};

export default preset;
