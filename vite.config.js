import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readdirSync } from "fs";
import { resolve } from "path";

const quizListPlugin = () => {
    const virtualModuleId = "virtual:quiz-list";
    const resolvedId = "\0" + virtualModuleId;
    const quizDir = resolve(process.cwd(), "public/quiz");

    const getQuizList = () =>
        readdirSync(quizDir)
            .filter((f) => f.endsWith(".html"))
            .sort()
            .map((f) => ({
                label: f
                    .replace(".html", "")
                    .split("-")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" "),
                href: `/quiz/${f}`,
            }));

    return {
        name: "quiz-list",
        resolveId(id) {
            if (id === virtualModuleId) return resolvedId;
        },
        load(id) {
            if (id === resolvedId) {
                return `export default ${JSON.stringify(getQuizList())};`;
            }
        },
        configureServer(server) {
            server.watcher.add(quizDir);
            const invalidateAndReload = (filePath) => {
                if (!filePath.endsWith(".html")) return;
                const mod = server.moduleGraph.getModuleById(resolvedId);
                if (mod) server.moduleGraph.invalidateModule(mod);
                server.ws.send({ type: "full-reload" });
            };
            server.watcher.on("add", invalidateAndReload);
            server.watcher.on("unlink", invalidateAndReload);
        },
    };
};

export default defineConfig({
    plugins: [react(), quizListPlugin()],
    build: {
        outDir: "dist/public",
        emptyOutDir: true,
    },
});
