import React, { useState } from "react";
import { imposePdf } from "./impose";

function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);

    try {
      const fileArrayBuffer = await file.arrayBuffer();
      const outputPdfUint8Array = await imposePdf(fileArrayBuffer);
      // Create a blob and URL for preview/download
      const blob = new Blob([outputPdfUint8Array as BlobPart], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (error) {
      console.error("Error processing PDF:", error);
      alert("Failed to process PDF. Check console for details.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Imposer</h1>
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileUpload}
          disabled={isProcessing}
        />
      </div>
      {isProcessing && <p>Processing your zine...</p>}
      {downloadUrl && (
        <div>
          <h3>Preview / Download</h3>
          <iframe
            src={downloadUrl}
            style={{ width: "100%", height: "500px", border: "1px solid #ccc" }}
          />
          <br />
          <a href={downloadUrl} download="imposed-zine.pdf">
            Download PDF
          </a>
        </div>
      )}
    </div>
  );
}

export default App;
