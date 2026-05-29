import React, { useState } from "react";
import cardPreset from "./presets/card90x55-8up";
import addTrimMarksPreset from "./presets/add-trim-marks";
import { PDFDocument } from "pdf-lib";
import DummyGenerator from "./DummyGenerator";
import PdfOutput from "./PdfOutput";
import "./App.css";
import { pdfToUrl } from "./utils";

function App() {
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

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
      const outPdf = await addTrimMarksPreset.impose(srcPdf);
      setDownloadUrl(await pdfToUrl(outPdf));
    } catch (err) {
      console.error("Error processing PDF:", err);
      alert(`Failed to process PDF: ${err}\n\nCheck console for details.`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="app">
      <h1>Impose</h1>
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
        <legend>Preset</legend>
        <select>
          <option>Test</option>
        </select>
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
