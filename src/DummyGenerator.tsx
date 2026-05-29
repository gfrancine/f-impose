import { useState } from "react";
import PdfOutput from "./PdfOutput";
import { pdfToUrl, set, toPts } from "./utils";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export default function DummyGenerator() {
  // https://react.dev/reference/react-dom/components/input
  const [settings, setSettings] = useState({
    width: 210,
    height: 297,
    bleed: 0,
    pageCount: 1,
  });
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const generateDummyPdf = async () => {
    const width = toPts(settings.width),
      height = toPts(settings.height),
      bleed = toPts(settings.bleed);
    const outerWidth = width + bleed * 2,
      outerHeight = height + bleed * 2;

    const outPdf = await PDFDocument.create();
    const helveticaFont = await outPdf.embedFont(StandardFonts.Helvetica);

    for (let i = 0; i < settings.pageCount; i++) {
      const page = outPdf.addPage([outerWidth, outerHeight]);

      page.drawRectangle({
        x: 0,
        y: 0,
        width: outerWidth,
        height: outerHeight,
        borderWidth: 1,
        borderColor: rgb(0, 0, 0),
      });

      page.drawRectangle({
        x: bleed,
        y: bleed,
        width,
        height,
        borderWidth: 1,
        borderColor: rgb(0, 0, 0),
      });

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
        <fieldset>
          <legend>Settings</legend>
          <label>
            Width{" "}
            <input
              type="number"
              value={settings.width}
              onChange={(e) =>
                setSettings(set(settings, "width", Number(e.target.value)))
              }
            />
          </label>
          <label>
            Height{" "}
            <input
              type="number"
              value={settings.height}
              onChange={(e) =>
                setSettings(set(settings, "height", Number(e.target.value)))
              }
            />
          </label>
          <br />
          <label>
            Bleed{" "}
            <input
              type="number"
              value={settings.bleed}
              onChange={(e) =>
                setSettings(set(settings, "bleed", Number(e.target.value)))
              }
            />
          </label>
          <br />
          <label>
            Page Count{" "}
            <input
              type="number"
              value={settings.pageCount}
              onChange={(e) =>
                setSettings(set(settings, "pageCount", Number(e.target.value)))
              }
            />
          </label>
        </fieldset>
        <br />
        <button onClick={generateDummyPdf}>Generate</button>
        {downloadUrl && <PdfOutput downloadUrl={downloadUrl} />}
      </details>
    </div>
  );
}
