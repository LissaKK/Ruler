import { defineConfig } from 'vite';
import path from 'node:path';
import fs from 'node:fs';

function copyPopupHtmlPlugin() {
  return {
    name: 'copy-popup-html-plugin',
    closeBundle() {
      const popupSource = path.resolve(__dirname, 'src', 'popup', 'popup.html');
      const popupTarget = path.resolve(__dirname, 'dist', 'popup.html');

      if (!fs.existsSync(popupSource)) {
        return;
      }

      const html = fs.readFileSync(popupSource, 'utf8')
        .replace(/<script type="module" src="\.\.\/dist\/assets\/popup\.js"><\/script>/, '<script type="module" src="assets/popup.js"></script>');

      fs.mkdirSync(path.dirname(popupTarget), { recursive: true });
      fs.writeFileSync(popupTarget, html, 'utf8');
    }
  };
}

function copyIconsPlugin() {
  return {
    name: 'copy-icons-plugin',
    closeBundle() {
      const iconsSourceDir = path.resolve(__dirname, 'src', 'icons');
      const iconsTargetDir = path.resolve(__dirname, 'dist', 'icons');

      if (!fs.existsSync(iconsSourceDir)) {
        return;
      }

      fs.mkdirSync(iconsTargetDir, { recursive: true });

      for (const file of fs.readdirSync(iconsSourceDir)) {
        if (file.startsWith('icon') && file.endsWith('.png')) {
          fs.copyFileSync(
            path.resolve(iconsSourceDir, file),
            path.resolve(iconsTargetDir, file)
          );
        }
      }
    }
  };
}

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
    },
    copyPopupHtmlPlugin(),
    copyIconsPlugin()
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
