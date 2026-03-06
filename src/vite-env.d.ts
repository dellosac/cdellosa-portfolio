/// <reference types="vite/client" />

declare module "*.css";

interface ImportMetaEnv {
    readonly VITE_GA_MEASUREMENT_ID: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
