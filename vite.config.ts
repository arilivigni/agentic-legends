import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string };

export default defineConfig({
  base: '/agentic-legends/',
  server: { port: 5173, host: true },
  build: { target: 'es2020', sourcemap: true },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
});
