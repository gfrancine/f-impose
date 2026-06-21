import "./PdfOutput.css";

export default function PdfOutput({
  fileName,
  downloadUrl,
}: {
  fileName?: string;
  downloadUrl: string;
}) {
  return (
    <div className="pdf-output">
      <p>
        <span>{fileName}</span>{" "}
        <a href={downloadUrl} download={fileName}>
          Download
        </a>
      </p>
      <iframe src={downloadUrl} className="output" />
      <br />
    </div>
  );
}
