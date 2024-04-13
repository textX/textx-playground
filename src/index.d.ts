/// <reference types="vite/client" />
import { editor } from 'monaco-editor/esm/vs/editor/editor.api.js';

declare module "*.png" {
    const value: string;
    export = value;
}

declare module "*.svg" {
    const value: string;
    export = value;
}

declare global {
    interface Window { 
        language_client_message: string;
        language_for_grammar_parsing: string;
        grammar_for_parsing: string;
        grammar_for_visualization: string;
        model_for_visualization: string;
        GRAMMAR_DOC_URI: string;
        MODEL_DOC_URI: string;
    }
}
