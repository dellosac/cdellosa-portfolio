import { useState, useEffect } from "react";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ReactMarkdown from "react-markdown";
import Button from "@mui/material/Button";

interface PrototypeProps {
    name?: string;
    isMobile?: boolean;
    url?: string;
    password?: string;
}

function Prototype(protoTypeProps: PrototypeProps) {
    const { name, isMobile, url } = protoTypeProps;

    const [markdown, setMarkdown] = useState("");

    /** Dynamically load MarkDown descriptions of prototyopes based on name */
    useEffect(() => {
        const loadMarkdown = async () => {
            const file = await import(`../assets/markdown/${name}.md?raw`);
            setMarkdown(file.default);
        };

        loadMarkdown();
    }, [name]); // Reloads whenever filename changes

    return (
        <>
            {/** Mobile Prototypes */}
            {isMobile && (
                <Stack
                    direction="column"
                    spacing={1}
                    sx={{
                        padding: 4,
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <Box
                        component="section"
                        sx={{
                            border: "1px solid #000000",
                            width: "380px",
                            height: "680px",
                            alignItems: "center",
                            display: "flex",
                            borderRadius: "32px",
                            backgroundColor: "#000000",
                        }}
                    >
                        <Box
                            component="section"
                            sx={{
                                maxWidth: "380px",
                                height: "640px",
                                margin: "0 auto",
                                padding: "0px",
                                borderRadius: "16px",
                            }}
                        >
                            <iframe
                                src={url}
                                style={{
                                    width: "340px",
                                    height: "640px",
                                    border: "none",
                                    borderRadius: "16px",
                                    backgroundColor: "#ffffff",
                                }}
                                title={name}
                            />
                        </Box>
                    </Box>
                    <Box>
                        <Typography variant="body2">
                            <ReactMarkdown>{markdown}</ReactMarkdown>
                        </Typography>
                    </Box>
                </Stack>
            )}
            {/** Desktop Prototypes */}
            {!isMobile && (
                <Stack
                    direction="column"
                    spacing={1}
                    sx={{
                        padding: 4,
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <video autoPlay loop width="575">
                        <source src={`/mp4/${name}.mp4`} type="video/mp4" />
                        Your browser doesn't support the video tag.
                    </video>
                    <Box>
                        <Typography variant="body2">
                            <ReactMarkdown>{markdown}</ReactMarkdown>
                        </Typography>
                    </Box>
                    <Button
                        variant="outlined"
                        href={url || "#"}
                        target="_blank"
                        size="small"
                        sx={{ width: "100%" }}
                    >
                        Open Prototype
                    </Button>
                </Stack>
            )}
        </>
    );
}

export default Prototype;
