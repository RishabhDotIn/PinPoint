import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // For GitHub Pages later, set the base path to your repo name:
  // base: '/YOUR_REPO_NAME/'
});
