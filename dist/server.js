import express from "express";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
// API routes
app.get("/api/hello", (_req, res) => {
    res.json({ message: "Hello from Express!" });
});
// Serve static files from the dist/public directory
app.use(express.static(path.join(__dirname, "public")));
// Catch-all route
app.get("*", (_req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"));
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
