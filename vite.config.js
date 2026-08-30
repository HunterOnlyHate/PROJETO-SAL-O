import { defineConfig } from 'vite';
import { resolve } from 'path';

// Plugin para roteamento automático de páginas limpas no Vite (/ -> index.html, /produtos -> produtos.html, /agendar -> agendar.html)
function multiPageRouterPlugin() {
  return {
    name: 'multi-page-router',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ? req.url.split('?')[0] : '';
        if (url === '/produtos' || url === '/produtos/') {
          req.url = '/produtos.html';
        } else if (url === '/agendar' || url === '/agendar/') {
          req.url = '/agendar.html';
        } else if (url === '/' || url === '') {
          req.url = '/index.html';
        }
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ? req.url.split('?')[0] : '';
        if (url === '/produtos' || url === '/produtos/') {
          req.url = '/produtos.html';
        } else if (url === '/agendar' || url === '/agendar/') {
          req.url = '/agendar.html';
        } else if (url === '/' || url === '') {
          req.url = '/index.html';
        }
        next();
      });
    },
  };
}

export default defineConfig({
  root: './',
  base: '/',

  plugins: [multiPageRouterPlugin()],

  server: {
    port: 3000,
    open: true,
    host: true,
    strictPort: false,
  },

  preview: {
    port: 4173,
    host: true,
    open: true,
  },

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve('index.html'),
        produtos: resolve('produtos.html'),
        agendar: resolve('agendar.html'),
      },
    },
  },
});
