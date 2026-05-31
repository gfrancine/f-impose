import { useState } from "react";
import PdfOutput from "./PdfOutput";
import { pdfToUrl, mmToPts } from "../utils";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

// handle blank input strings
function toNumber(str: string, min = 0) {
  return Number(str.length > 0 ? str : "" + min);
}

export default function DummyGenerator() {
  // https://react.dev/reference/react-dom/components/input
  const [strWidth, setStrWidth] = useState("210");
  const [strHeight, setStrHeight] = useState("297");
  const [strBleed, setStrBleed] = useState("0");
  const [strPageCount, setStrPageCount] = useState("1");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const generateDummyPdf = async () => {
    const width = mmToPts(toNumber(strWidth, 1)),
      height = mmToPts(toNumber(strHeight, 1)),
      bleed = mmToPts(toNumber(strBleed, 0));
    const outerWidth = width + bleed * 2,
      outerHeight = height + bleed * 2;

    const outPdf = await PDFDocument.create();
    const helveticaFont = await outPdf.embedFont(StandardFonts.Helvetica);

    for (let i = 0; i < toNumber(strPageCount, 1); i++) {
      const page = outPdf.addPage([outerWidth, outerHeight]);

      // bleed area
      if (bleed > 0) {
        page.drawRectangle({
          x: 0,
          y: 0,
          width: outerWidth,
          height: outerHeight,
          borderWidth: 2,
          borderColor: rgb(0, 0, 0),
        });
      }

      // content area
      page.drawRectangle({
        x: bleed,
        y: bleed,
        width,
        height,
        borderWidth: 1,
        borderColor: rgb(0, 0, 0),
      });

      // page number
      page.drawText(i + 1 + "", {
        x: bleed,
        y: bleed,
        size: Math.min(width, height) / 2,
        color: rgb(0, 0, 0),
        font: helveticaFont,
      });
    }

    setDownloadUrl(await pdfToUrl(outPdf));
  };

  return (
    <div>
      <details>
        <summary>Dummy PDF Generator</summary>
        <p>Generate dummy page-numbered PDFs for testing layout presets.</p>
        <fieldset>
          <legend>Settings</legend>
          <div>
            <label>
              Width{" "}
              <input
                type="number"
                value={strWidth}
                min={0}
                onChange={(e) => setStrWidth(e.target.value)}
              />
            </label>{" "}
            <label>
              Height{" "}
              <input
                type="number"
                value={strHeight}
                min={0}
                onChange={(e) => setStrHeight(e.target.value)}
              />
            </label>
          </div>

          <div>
            <label>
              Bleed{" "}
              <input
                type="number"
                value={strBleed}
                min={0}
                onChange={(e) => setStrBleed(e.target.value)}
              />
            </label>
          </div>
          <div>
            <label>
              Page Count{" "}
              <input
                type="number"
                value={strPageCount}
                min={1}
                onChange={(e) => setStrPageCount(e.target.value)}
              />
            </label>
          </div>
        </fieldset>
        <br />
        <button onClick={generateDummyPdf}>Generate</button>
        {downloadUrl && <PdfOutput downloadUrl={downloadUrl} />}
      </details>
    </div>
  );
}
