import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // On Vercel the app is served from the domain root.
  // Fallback to the repo subpath for GitHub Pages deployments.
  base: process.env.VERCEL ? '/' : '/PurchasePulseAI/',
  plugins: [react()],
});