import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import ReactGA from "react-ga4";

ReactGA.initialize("G-XXXXXXXXXX");

const theme = createTheme();

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <App />
        </ThemeProvider>
    </React.StrictMode>,
);
