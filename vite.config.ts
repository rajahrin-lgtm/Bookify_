import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  // Cast process to any to avoid "Property 'cwd' does not exist on type 'Process'" error if types are missing
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    build: {
      target: 'esnext',
      outDir: 'dist'
    },
    optimizeDeps: {
      exclude: ['lucide-react']
    },
    define: {
      // This exposes the specific VITE_GEMINI_API_KEY as process.env.API_KEY to the browser
      // satisfying the strict Gemini SDK guidelines while using Vite.
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
    }
  };
});