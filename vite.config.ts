import { defineConfig } from 'vite';

export default defineConfig({
  base: '/agentic-legends/',
  server: { port: 5173, host: true },
  build: { target: 'es2020', sourcemap: true },
});
