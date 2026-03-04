import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { ReactNode } from "react";

type View = "Home" | "Resume" | "Prototypes" | "Emails";

const viewIndex: Record<View, number> = {
    Home: 0,
    Resume: 1,
    Prototypes: 2,
    Emails: 3,
};

interface BackgroundProps {
    view: View;
    children: ReactNode;
}

function Background({ view, children }: BackgroundProps) {
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
                        gridTemplateRows: "repeat(4, 100vh)",
                        width: "100%",
                        transform: `translateY(-${viewIndex[view] * 100}vh)`,
                        transition: "transform 0.2s ease",
                    }}
                >
                    <Box sx={{ backgroundColor: "#ffffff" }}></Box>
                    <Box sx={{ backgroundColor: "#fff8e1" }}></Box>
                    <Box sx={{ backgroundColor: "#e3f2fd" }}></Box>
                    <Box sx={{ backgroundColor: "#ede7f6" }}></Box>
                </Box>
                <Typography
                    sx={{
                        fontSize: "300px",
                        fontWeight: "bold",
                        letterSpacing: "-20px",
                        position: "absolute",
                        top: "162vh",
                        width: "100%",
                        transform: `translateY(-${viewIndex[view] * 100}vh)`,
                        transition: "transform .5s ease, opacity .5s ease",
                        opacity: view === "Resume" ? 0.25 : 0,
                    }}
                >
                    Resume
                </Typography>
                <Typography
                    sx={{
                        fontSize: "300px",
                        fontWeight: "bold",
                        letterSpacing: "-20px",
                        position: "absolute",
                        top: "262vh",
                        width: "100%",
                        transform: `translateY(-${viewIndex[view] * 100}vh)`,
                        transition: "transform .5s ease, opacity .5s ease",
                        opacity: view === "Prototypes" ? 0.25 : 0,
                    }}
                >
                    Prototypes
                </Typography>
                <Typography
                    sx={{
                        fontSize: "300px",
                        fontWeight: "bold",
                        letterSpacing: "-20px",
                        position: "absolute",
                        top: "362vh",
                        width: "100%",
                        transform: `translateY(-${viewIndex[view] * 100}vh)`,
                        transition: "transform .5s ease, opacity .5s ease",
                        opacity: view === "Emails" ? 0.25 : 0,
                    }}
                >
                    Emails
                </Typography>
            </Box>
            {/* Content on top */}
            <Box sx={{ position: "relative", zIndex: 1 }}>{children}</Box>
        </Box>
    );
}

export default Background;
