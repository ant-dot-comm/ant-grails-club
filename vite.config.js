import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the build works at the GitHub Pages subpath (HashRouter keeps the document at the root).
export default defineConfig({
  base: './',
  plugins: [react()],
});
