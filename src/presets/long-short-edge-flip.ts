import { PDFDocument } from "pdf-lib";
import { drawPageRotated, Vec2 } from "../utils";
import type { Preset } from "../types";
import { setupOutPdf } from "./helpers";

const name = "Long/Short Edge Flip";
const description =
  "Converts a long edge-flip document into a short edge-flip and vice versa; rotates every second page 180 degrees.";

async function impose(srcPdf: PDFDocument) {
  const { outPdf, srcPages } = await setupOutPdf(srcPdf);

  for (let i = 0; i < srcPages.length; i++) {
    const w = srcPages[i].width;
    const h = srcPages[i].height;
    const sheet = outPdf.addPage([w, h]);

    if (i % 2 === 1) {
      drawPageRotated(sheet, srcPages[i], new Vec2(w / 2, h / 2), 180);
    } else {
      sheet.drawPage(srcPages[i], { x: 0, y: 0, width: w, height: h });
    }
  }

  return outPdf;
}

const preset: Preset = {
  name,
  description,
  impose,
};

export default preset;
