import { PDFDocument, rgb } from "pdf-lib";
import { drawTrimMark, toMm, toPts } from "./utils";

export async function imposePdf(
  srcDoc: PDFDocument /*inputBuffer: ArrayBuffer*/,
) {
  // const srcDoc = await PDFDocument.load(inputBuffer);
  const outDoc = await PDFDocument.create();

  const A4_WIDTH = toPts(210);
  const A4_HEIGHT = toPts(297);
  const sheet = outDoc.addPage([A4_HEIGHT, A4_WIDTH]);

  // Embed the source pages so we can "draw" them like images
  const embeddedPages = await outDoc.embedPages(srcDoc.getPages());
  const firstPage = embeddedPages[0];

  // 5. Draw the page onto the sheet
  // This is where your presets math will eventually live

  sheet.drawRectangle({
    x: toPts(10),
    y: toPts(10),
    width: (sheet.getWidth() - toPts(20)) / 4,
    height: sheet.getHeight() - toPts(20),
    borderWidth: 2,
    borderColor: rgb(0, 0, 0),
  });

  sheet.drawPage(embeddedPages[0], {
    // x: 50,
    // y: 400,
    // width: firstPage.width * 0.5, // Scaling it down to 50% for now
    // height: firstPage.height * 0.5,
    x: toPts(10),
    y: toPts(10),
    width: (sheet.getWidth() - toPts(20)) / 4,
    height: sheet.getHeight() - toPts(20),
  });

  drawTrimMark(sheet, 5, 5, 5, toMm(sheet.getHeight()) - 5);

  // return await outDoc.save();
  return outDoc;
}
