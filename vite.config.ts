import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  plugins: [
    {
      name: 'extension-content-hot-reload',
      configureServer(server) {
        server.watcher.add(['src/content/**']);
        server.ws.send({
          type: 'custom',
          event: 'extension-content-reload-ready'
        });
      },
      handleHotUpdate(ctx) {
        if (ctx.file.includes('src/content/')) {
          ctx.server.ws.send({
            type: 'custom',
            event: 'content-script-update',
            data: { file: ctx.file }
          });
        }
        return ctx.modules;
      }
    }
  ],
  build: {
    target: 'es2022',
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        background: path.resolve(__dirname, 'src/background/index.ts'),
        content: path.resolve(__dirname, 'src/content/index.ts'),
        popup: path.resolve(__dirname, 'src/popup/index.ts')
      },
      output: {
        format: 'es',
        entryFileNames: 'assets/[name].js'
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    hmr: {
      host: 'localhost',
      port: 5173
    }
  }
});
