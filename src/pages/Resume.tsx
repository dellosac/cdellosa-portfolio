import PDFViewer from "../components/PDFViewer.js";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

interface ResumeProps {
    fileUrl: string;
}

function Resume({ fileUrl }: ResumeProps) {
    return (
        <Stack direction="column" spacing={1}>
            <PDFViewer fileUrl={fileUrl} />
            <Button href="/resume.pdf" size="small">
                Download .pdf
            </Button>
        </Stack>
    );
}

export default Resume;
