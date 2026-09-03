import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { PRESETS } from "../presets";
import DummyGenerator from "./DummyGenerator";
import PdfOutput from "./PdfOutput";
import "./App.css";
import {
  mergePdfs,
  pdfToUrl,
  removeFromArray,
  setArray,
  toFilenameSafeDate,
} from "../utils";
import PresetStepForm, {
  newPresetStep,
  type PresetStep,
} from "./PresetStepForm";

function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputFiles, setInputFiles] = useState<File[]>([]);
  const [presetSteps, setPresetSteps] = useState<PresetStep[]>([
    newPresetStep(),
  ]);
  const [results, setResults] = useState<
    { fileName: string; downloadUrl: string }[]
  >([]);
  const [shouldMergeResults, setShouldMergeResults] = useState(false);

  const addPresetStep = () => setPresetSteps([...presetSteps, newPresetStep()]);

  const deletePresetStep = (i: number) =>
    setPresetSteps(removeFromArray(presetSteps, i));

  const movePresetStep = (from: number, to: number) => {
    const newPresetSteps = [...presetSteps];
    const step = newPresetSteps.splice(from, 1)[0];
    newPresetSteps.splice(to, 0, step);
    setPresetSteps(newPresetSteps);
  };

  const movePresetStepUp = (i: number) => movePresetStep(i, i - 1);
  const movePresetStepDown = (i: number) => movePresetStep(i, i + 1);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setInputFiles(Array.from(files));
  };

  const impose = async () => {
    if (inputFiles.length === 0) return;
    setIsProcessing(true);
    const jobTimestamp = new Date();
    const jobFilenameSuffix = toFilenameSafeDate(jobTimestamp);

    try {
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Typed_arrays

      let pdfs = await Promise.all(
        inputFiles.map(
          async (file) => await PDFDocument.load(await file.arrayBuffer()),
        ),
      );

      const reloadPdf = async (pdf: PDFDocument) =>
        await PDFDocument.load(await pdf.save());

      for (const presetStep of presetSteps) {
        const { presetId, rawSettings } = presetStep;
        const preset = PRESETS[presetId];
        const newPdfs = await Promise.all(
          pdfs.map(async (pdf) => {
            const outPdfs = await preset.impose(pdf, rawSettings);
            return Promise.all(outPdfs.map(reloadPdf));
          }),
        );
        pdfs = newPdfs.flat();
      }

      if (shouldMergeResults) {
        const mergedPdf = await mergePdfs(pdfs);
        const result = {
          fileName: `merged-${jobFilenameSuffix}.pdf`,
          downloadUrl: await pdfToUrl(mergedPdf),
        };
        setResults([result]);
      } else {
        const results = await Promise.all(
          pdfs.map(async (pdf, i) => ({
            fileName: `output-${i + 1}-${jobFilenameSuffix}.pdf`,
            downloadUrl: await pdfToUrl(pdf),
          })),
        );
        setResults(results);
      }
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
    <main className="app">
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
        {inputFiles.length > 1 && (
          <p>
            <label>
              <input
                type="checkbox"
                checked={shouldMergeResults}
                onChange={(e) => setShouldMergeResults(e.target.checked)}
              />
              Merge all the results into one PDF file
            </label>
          </p>
        )}
      </fieldset>
      {/* {{inputFiles.length > 0 && (<>} */}
      {presetSteps.map((presetStep, i) => (
        <PresetStepForm
          key={i}
          presetId={presetStep.presetId}
          presetOrder={presetSteps.length > 1 ? i + 1 : undefined}
          rawSettings={presetStep.rawSettings}
          onPresetIdChange={(presetId) =>
            setPresetSteps(setArray(presetSteps, i, newPresetStep(presetId)))
          }
          onRawSettingsChange={(rawSettings) =>
            setPresetSteps(
              setArray(presetSteps, i, { ...presetStep, rawSettings }),
            )
          }
          onDelete={
            presetSteps.length > 1 ? () => deletePresetStep(i) : undefined
          }
          onMoveDown={
            presetSteps.length > 1 && i < presetSteps.length - 1
              ? () => movePresetStepDown(i)
              : undefined
          }
          onMoveUp={
            presetSteps.length > 1 && i > 0
              ? () => movePresetStepUp(i)
              : undefined
          }
        />
      ))}
      <p>
        You can apply more than one preset to a PDF!{" "}
        <button onClick={addPresetStep}>+ Add another preset</button>
      </p>
      <p>
        <button onClick={impose} disabled={inputFiles.length === 0}>
          Impose!
        </button>
      </p>
      {/* {</>)}} */}
      {isProcessing && <p role="status">Processing...</p>}
      {results.length > 0 && (
        <>
          <h2>Output</h2>
          {results.length > 1 && (
            <button onClick={downloadAll}>Download All</button>
          )}
          {results.map((result, i) => (
            <div key={i}>
              <PdfOutput
                fileName={result.fileName}
                downloadUrl={result.downloadUrl}
              />
            </div>
          ))}
        </>
      )}
      <br />
      <DummyGenerator />
    </main>
  );
}

export default App;
