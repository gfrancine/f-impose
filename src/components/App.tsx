import React, { useEffect, useState } from "react";
import { PDFDocument } from "pdf-lib";
import { presets, defaultPresetId, type PresetId } from "../presets";
import DummyGenerator from "./DummyGenerator";
import PdfOutput from "./PdfOutput";
import "./App.css";
import { pdfToUrl } from "../utils";
import SettingsForm from "./SettingsForm";
import type {
  RawSettings,
  SettingsItemSchema,
  SettingsSchema,
} from "../settings";

// authored by BigPickle
// Splits paragraphs from double line breaks "\n\n" and turns single ones "\n"
// into a <br/> element. Used for preset descriptions in place of a full-blown
// Markdown processor.
function descriptionToElements(description: string) {
  return description
    .split("\n\n")
    .map((paragraph, i) => (
      <p key={i}>
        {paragraph
          .split("\n")
          .flatMap((line, j) =>
            j === 0 ? [line] : [<br key={`${i}-${j}`} />, line],
          )}
      </p>
    ));
}

function App() {
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [currentPresetId, setCurrentPresetId] =
    useState<PresetId>(defaultPresetId);
  const [rawSettings, setRawSettings] = useState<RawSettings>({});

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setInputFile(file);
  };

  const impose = async () => {
    if (!inputFile) return;
    setIsProcessing(true);

    try {
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Typed_arrays
      const srcPdf = await PDFDocument.load(await inputFile.arrayBuffer());
      const preset = presets[currentPresetId];
      const outPdf = await preset.impose(srcPdf, rawSettings);
      setDownloadUrl(await pdfToUrl(outPdf));
    } catch (err) {
      console.error("Error processing PDF:", err);
      alert(`Failed to process PDF: ${err}\n\nCheck console for details.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const currentPreset = presets[currentPresetId];

  // initialize raw settings with default values
  useEffect(() => {
    const settingsSchema = currentPreset.settingsSchema;
    if (!settingsSchema) return;

    const filledRawSettings: RawSettings = {};
    const populateDefaultValues = (item: SettingsItemSchema) => {
      if (item.type === "inputRow") {
        item.inputs.forEach((input) => populateDefaultValues(input));
      } else if (
        "defaultValue" in item &&
        filledRawSettings[item.id] === undefined
      ) {
        filledRawSettings[item.id] = item.defaultValue + "";
      }
    };

    settingsSchema.forEach((item) => populateDefaultValues(item));
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setRawSettings(filledRawSettings);
  }, [currentPreset]);

  return (
    <div className="app">
      <h1>F-Impose</h1>
      <p>
        Imposition tools for indie printmaking. Select a preset, upload your
        source PDF, adjust the settings, and click the 'Impose' button to
        generate an output!
      </p>
      <p>
        To contribute, suggest features, or report issues please see the{" "}
        <a href="https://github.com/gfrancine/f-impose">source repository</a> or
        contact me personally! Made with ❤️ by{" "}
        <a href="https://instagram.com/gracefrancines">@gracefrancines</a>
      </p>
      <fieldset>
        <legend>Upload PDF</legend>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileUpload}
          disabled={isProcessing}
        />
      </fieldset>
      <fieldset>
        <legend>Layout Preset</legend>
        <label>
          Select Preset{" "}
          <select
            value={currentPresetId}
            onChange={(e) => setCurrentPresetId(e.target.value as PresetId)}
          >
            {Object.entries(presets).map(([id, preset]) => (
              <option key={id} value={id}>
                {preset.name}
              </option>
            ))}
          </select>
        </label>
        <div>{descriptionToElements(currentPreset.description)}</div>
        {currentPreset.settingsSchema && (
          <>
            <h3>Preset Settings</h3>
            <SettingsForm
              schema={presets[currentPresetId].settingsSchema as SettingsSchema}
              rawSettings={rawSettings}
              setRawSettings={setRawSettings}
            />
          </>
        )}
      </fieldset>
      <br />
      <button onClick={impose}>Impose</button>
      <br />
      {isProcessing && <p>Processing...</p>}
      {downloadUrl && (
        <>
          <h2>Output</h2>
          <PdfOutput downloadUrl={downloadUrl} />
        </>
      )}
      <br />
      <DummyGenerator />
    </div>
  );
}

export default App;
