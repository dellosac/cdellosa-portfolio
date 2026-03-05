/// <reference types="vite/client" />

declare module "virtual:quiz-list" {
    const quizzes: { label: string; href: string }[];
    export default quizzes;
}

declare module "*.css";

interface ImportMetaEnv {
    readonly VITE_GA_MEASUREMENT_ID: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
