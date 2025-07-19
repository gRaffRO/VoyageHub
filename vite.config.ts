import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    open: false,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        timeout: 10000,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('❌ [Vite] Proxy error:', err.message);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log(`🔄 [Vite] Proxying ${req.method} ${req.url} to target`);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log(`✅ [Vite] ${proxyRes.statusCode} for ${req.method} ${req.url}`);
          });
        },
      },
    },
  },
  preview: {
    port: 4173,
    host: '0.0.0.0',
  },
  optimizeDeps: {
    include: ['lucide-react'],
    exclude: [],
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  define: {
    // Ensure environment variables are available
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || '/api'),
  },
});