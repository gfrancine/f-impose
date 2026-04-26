import React, { useState } from "react";
import { PDFDocument, PDFPage, rgb } from "pdf-lib";

const toPts = (mm: number) => mm * 2.83465;
const toMm = (pt: number) => pt / 2.83465;

function drawTrimMark(
  sheet: PDFPage,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
) {
  const start = { x: toPts(fromX), y: toPts(fromY) };
  const end = { x: toPts(toX), y: toPts(toY) };

  sheet.drawLine({
    start,
    end,
    thickness: 3,
    color: rgb(0, 0, 0),
  });

  sheet.drawLine({
    start,
    end,
    thickness: 0.75,
    color: rgb(1, 1, 1),
  });
}

async function imposePdf(inputBuffer: ArrayBuffer) {
  const srcDoc = await PDFDocument.load(inputBuffer);
  const outDoc = await PDFDocument.create();

  const A4_WIDTH = toPts(210);
  const A4_HEIGHT = toPts(297);
  const sheet = outDoc.addPage([A4_HEIGHT, A4_WIDTH]);

  // Embed the source pages so we can "draw" them like images
  const embeddedPages = await outDoc.embedPages(srcDoc.getPages());
  const firstPage = embeddedPages[0];

  sheet.drawRectangle({
    x: toPts(10),
    y: toPts(10),
    width: (sheet.getWidth() - toPts(20)) / 4,
    height: sheet.getHeight() - toPts(20),
    borderWidth: 2,
    borderColor: rgb(0, 0, 0),
  });

  // 5. Draw the page onto the sheet
  // This is where your coordinate math will eventually live
  sheet.drawPage(embeddedPages[0], {
    // x: 50,
    // y: 400,
    // width: firstPage.width * 0.5, // Scaling it down to 50% for now
    // height: firstPage.height * 0.5,
    x: toPts(10),
    y: toPts(10),
    width: (sheet.getWidth() - toPts(20)) / 4,
    height: sheet.getHeight() - toPts(20),
  });

  drawTrimMark(sheet, 5, 5, 5, toMm(sheet.getHeight()) - 5);

  return await outDoc.save();
}

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
