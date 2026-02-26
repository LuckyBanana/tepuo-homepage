import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'images',
  // Base path for GitHub Pages - use '/' for custom domain, or '/repo-name/' for github.io subdomain
  base: process.env.GITHUB_PAGES ? '/' : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: './index.html',
        bijoux: './bijoux.html',
        atelier: './atelier.html',
        blog: './blog.html',
        entretien: './entretien.html',
        pointsVente: './points-vente.html',
        admin: './admin.html'
      }
    },
    // Minify for production using esbuild (standard in Vite)
    minify: 'esbuild',
  },
  esbuild: {
    // Remove console and debugger in production
    drop: ['console', 'debugger'],
  },
  server: {
    port: 3000,
    open: true
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        'vite.config.js'
      ]
    }
  }
});
