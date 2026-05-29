import "./PdfOutput.css";

export default function PdfOutput({
  fileName = "download",
  downloadUrl,
}: {
  fileName?: string;
  downloadUrl: string;
}) {
  return (
    <div className="pdf-output">
      <iframe src={downloadUrl} className="output" />
      <br />
      <a href={downloadUrl} download={fileName + ".pdf"}>
        Download PDF
      </a>
    </div>
  );
}
