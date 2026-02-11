import { Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

interface PDFViewerProps {
    fileUrl: string;
}

function PDFViewer({ fileUrl }: PDFViewerProps) {
    return (
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            <Viewer fileUrl={fileUrl} />
        </Worker>
    );
}

export default PDFViewer;
