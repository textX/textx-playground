import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import importMetaUrlPlugin from '@codingame/esbuild-import-meta-url-plugin';
  
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    esbuildOptions: {
      plugins: [importMetaUrlPlugin]
    }
  },
  resolve: {
    dedupe: ['monaco-editor', 'vscode']
  },
  // Base path the app is served from. Defaults to the GitHub Pages path;
  // the Cloudflare deploy (play.textx.org) builds with VITE_BASE=/ .
  base: process.env.VITE_BASE || '/textx-playground/'
})
