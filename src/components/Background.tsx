import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { ReactNode } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";

type View = "Home" | "Resume" | "Prototypes" | "Emails" | "Concept Projects";

const viewIndex: Record<View, number> = {
    Home: 0,
    Resume: 1,
    Prototypes: 2,
    Emails: 3,
    "Concept Projects": 4,
};

interface BackgroundProps {
    view: View;
    children: ReactNode;
}

function Background({ view, children }: BackgroundProps) {
    const isDesktop = useMediaQuery("(min-width: 1150px)");

    const backgroundTextCss = {
        fontSize: `${isDesktop ? "300px" : "100px"}`,
        fontWeight: "bold",
        letterSpacing: `${isDesktop ? "-20px" : "-6px"}`,
        position: "absolute",
        width: "100%",
        transform: `translateY(-${viewIndex[view] * 100}vh)`,
        transition: "transform .5s ease, opacity .5s ease",
        whiteSpace: "nowrap",
    };
    const backgroundTextOffset: number = isDesktop ? 67 : 89;

    return (
        <Box sx={{ minHeight: "100vh", position: "relative" }}>
            {/* Animated background layer */}
            <Box
                className="background-container"
                sx={{
                    position: "fixed",
                    inset: 0,
                    overflow: "hidden",
                    zIndex: 0,
                }}
            >
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateRows: "repeat(5, 100vh)",
                        width: "100%",
                        transform: `translateY(-${viewIndex[view] * 100}vh)`,
                        transition: "transform 0.2s ease",
                    }}
                >
                    <Box sx={{ backgroundColor: "#ffffff" }}></Box>
                    <Box sx={{ backgroundColor: "#4d6be3" }}></Box>
                    <Box sx={{ backgroundColor: "#ac426c" }}></Box>
                    <Box sx={{ backgroundColor: "#4d913d" }}></Box>
                    <Box sx={{ backgroundColor: "#5b5b5b" }}></Box>
                </Box>
                <Typography
                    sx={{
                        top: `${100 + backgroundTextOffset}vh`,
                        opacity: view === "Resume" ? 0.25 : 0,
                        ...backgroundTextCss,
                    }}
                >
                    Resume
                </Typography>
                <Typography
                    sx={{
                        top: `${200 + backgroundTextOffset}vh`,
                        opacity: view === "Prototypes" ? 0.25 : 0,
                        ...backgroundTextCss,
                    }}
                >
                    Prototypes
                </Typography>
                <Typography
                    sx={{
                        top: `${300 + backgroundTextOffset}vh`,
                        opacity: view === "Emails" ? 0.25 : 0,
                        ...backgroundTextCss,
                    }}
                >
                    Emails
                </Typography>
                <Typography
                    sx={{
                        top: `${400 + backgroundTextOffset}vh`,
                        opacity: view === "Concept Projects" ? 0.25 : 0,
                        ...backgroundTextCss,
                    }}
                >
                    Concept Projects
                </Typography>
            </Box>
            {/* Content on top */}
            <Box sx={{ position: "relative", zIndex: 1 }}>{children}</Box>
        </Box>
    );
}

export default Background;
