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