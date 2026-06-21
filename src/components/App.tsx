import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { presets } from "../presets";
import DummyGenerator from "./DummyGenerator";
import PdfOutput from "./PdfOutput";
import "./App.css";
import { pdfToUrl, removeFromArray, setArray } from "../utils";
import PresetStepForm, {
  newPresetStep,
  type PresetStep,
} from "./PresetStepForm";

function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputFiles, setInputFiles] = useState<File[]>([]);
  const [results, setResults] = useState<
    { fileName: string; downloadUrl: string }[]
  >([]);
  const [presetSteps, setPresetSteps] = useState<PresetStep[]>([
    newPresetStep(),
  ]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setInputFiles(Array.from(files));
    setResults([]);
  };

  const addPresetStep = () => setPresetSteps([...presetSteps, newPresetStep()]);
  const deletePresetStep = (i: number) =>
    setPresetSteps(removeFromArray(presetSteps, i));

  const impose = async () => {
    if (inputFiles.length === 0) return;
    setIsProcessing(true);

    try {
      const results = await Promise.all(
        inputFiles.map(async (file) => {
          // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Typed_arrays
          let pdf = await PDFDocument.load(await file.arrayBuffer());

          for (const presetStep of presetSteps) {
            const { presetId, rawSettings } = presetStep;
            const preset = presets[presetId];
            const newPdf = await preset.impose(pdf, rawSettings);
            // pdf-lib can't handle nested embedded pages. The output needs
            // to be rendered to file before feeding it to the next step
            pdf = await PDFDocument.load(await newPdf.save());
          }

          return {
            fileName: file.name,
            downloadUrl: await pdfToUrl(pdf),
          };
        }),
      );
      setResults(results);
    } catch (err) {
      console.error("Error processing PDFs:", err);
      alert(`Failed to process PDF: ${err}\n\nCheck console for details.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadAll = () =>
    results.forEach((result) => {
      const a = document.createElement("a");
      a.href = result.downloadUrl;
      a.download = result.fileName;
      a.click();
    });

  return (
    <div className="app">
      <h1>F-Impose</h1>
      <p>
        Imposition tools for indie printmaking. Upload your PDFs, select a
        layout preset, adjust the settings, then click the 'Impose' button to
        generate an output!
      </p>
      <p>
        To contribute, suggest features, or report issues please see the{" "}
        <a href="https://github.com/gfrancine/f-impose">source repository</a> or
        contact me personally! Made with ❤️ by{" "}
        <a href="https://instagram.com/gracefrancines">@gracefrancines</a>
      </p>
      <fieldset>
        <legend>Upload PDFs</legend>
        <p>Multiple file uploads are also supported!</p>
        <input
          type="file"
          accept=".pdf"
          multiple
          onChange={handleFileUpload}
          disabled={isProcessing}
        />
      </fieldset>
      {/* {{inputFiles.length > 0 && (<>} */}
      {presetSteps.map((presetStep, i) => (
        <PresetStepForm
          key={i}
          presetId={presetStep.presetId}
          rawSettings={presetStep.rawSettings}
          onPresetIdChange={(presetId) =>
            setPresetSteps(setArray(presetSteps, i, newPresetStep(presetId)))
          }
          onRawSettingsChange={(rawSettings) =>
            setPresetSteps(
              setArray(presetSteps, i, { ...presetStep, rawSettings }),
            )
          }
          onDelete={i > 0 ? () => deletePresetStep(i) : undefined}
        />
      ))}
      <p>
        You can apply more than one preset to a PDF!{" "}
        <button onClick={addPresetStep}>+ Add another preset</button>
      </p>
      <button onClick={impose} disabled={inputFiles.length === 0}>
        Impose!
      </button>
      <br />
      {/* {</>)}} */}
      {isProcessing && <p>Processing...</p>}
      {results.length > 0 && (
        <>
          <h2>Output</h2>
          <button onClick={downloadAll}>Download All</button>
          {results.map((result, i) => (
            <div key={i}>
              <h4>{result.fileName}</h4>
              <PdfOutput downloadUrl={result.downloadUrl} />
            </div>
          ))}
        </>
      )}
      <br />
      <DummyGenerator />
    </div>
  );
}

export default App;
