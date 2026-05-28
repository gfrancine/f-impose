import React, { useState } from "react";
import { imposePdf } from "./impose";
import { PDFDocument } from "pdf-lib";

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
      const outPdf = await imposePdf(srcPdf);
      const outPdfUint8Array = await outPdf.save();
      const outPdfBlob = new Blob([outPdfUint8Array as BlobPart], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(outPdfBlob);
      setDownloadUrl(url);
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
      {isProcessing && <p>Processing...</p>}
      {downloadUrl && (
        <div>
          <h2>Output</h2>
          <div>
            <a href={downloadUrl} download="imposed.pdf">
              Download PDF
            </a>
          </div>
          <br />
          <iframe src={downloadUrl} className="output" />
        </div>
      )}
    </div>
  );
}

export default App;
