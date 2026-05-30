/*

Business Card 8-Up
- 8-up
- Long edge flip
- One- and double-side support

*/

import { PDFDocument } from "pdf-lib";
import { assert, calcExtraGutter, drawPageWithTrimMarks, Vec2 } from "../utils";
import type { Preset } from "../types";
import { defineSettingsSchema, type RawSettings } from "../settings";
import { setupOutPdf, standardPresetSettings } from "./helpers";

const name = "Business Card 8-Up";
const description =
  `Imposes cards on a long edge-flip, 2x4 layout. Supports both one- and double-sided cards. (Note: The preset currently only supports landscape cards, please rotate your portrait cards before imposing!)`.trim();

const { standardSchemaItems, getStandardSettings } = standardPresetSettings({
  orientation: "potrait",
});
const settingsSchema = defineSettingsSchema(standardSchemaItems);

async function impose(srcPdf: PDFDocument, rawSettings: RawSettings) {
  const { outPdf, srcPages } = await setupOutPdf(srcPdf);
  const { sheetWidth, sheetHeight, bleedArea, trimLength, trimOffset } =
    getStandardSettings(rawSettings);

  const sheetSize = new Vec2(sheetWidth, sheetHeight);
  const sheetCenter = sheetSize.div(2);

  // validate input & settings
  // 2 for a front and back page
  assert(
    srcPages.length === 1 || srcPages.length === 2,
    "Source PDF must exactly be 1 or 2 pages.",
  );

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
  description,
  settingsSchema,
  impose,
};

export default preset;
