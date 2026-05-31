import { useState } from "react";
import PdfOutput from "./PdfOutput";
import SettingsForm from "./SettingsForm";
import { pdfToUrl } from "../utils";
import {
  asNumber,
  getSetting,
  numberInput,
  type RawSettings,
  type SettingsSchema,
} from "../settings";
import { standardPresetSettings } from "../presets/helpers";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const { standardSchemaItems, getStandardSettings } = standardPresetSettings({
  orientation: "portrait",
  exclude: ["trimMarks"],
});

const dummyGeneratorSchema: SettingsSchema = [
  ...standardSchemaItems,
  numberInput({ id: "pageCount", name: "Page Count", defaultValue: 1, min: 1 }),
];

export default function DummyGenerator() {
  const [rawSettings, setRawSettings] = useState<RawSettings>({});
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const generateDummyPdf = async () => {
    const { sheetWidth, sheetHeight, bleedArea } =
      getStandardSettings(rawSettings);
    const pageCount = getSetting(rawSettings, "pageCount", (v) =>
      asNumber(v as string, 1),
    );
    const outerWidth = sheetWidth + bleedArea * 2;
    const outerHeight = sheetHeight + bleedArea * 2;

    const outPdf = await PDFDocument.create();
    const helveticaFont = await outPdf.embedFont(StandardFonts.Helvetica);

    for (let i = 0; i < pageCount; i++) {
      const page = outPdf.addPage([outerWidth, outerHeight]);

      if (bleedArea > 0) {
        page.drawRectangle({
          x: 0,
          y: 0,
          width: outerWidth,
          height: outerHeight,
          borderWidth: 2,
          borderColor: rgb(0, 0, 0),
        });
      }

      page.drawRectangle({
        x: bleedArea,
        y: bleedArea,
        width: sheetWidth,
        height: sheetHeight,
        borderWidth: 1,
        borderColor: rgb(0, 0, 0),
      });

      page.drawText((i + 1).toString(), {
        x: bleedArea,
        y: bleedArea,
        size: Math.min(sheetWidth, sheetHeight) / 2,
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
          <SettingsForm
            schema={dummyGeneratorSchema}
            rawSettings={rawSettings}
            setRawSettings={setRawSettings}
          />
        </fieldset>
        <br />
        <button onClick={generateDummyPdf}>Generate</button>
        {downloadUrl && <PdfOutput downloadUrl={downloadUrl} />}
      </details>
    </div>
  );
}
