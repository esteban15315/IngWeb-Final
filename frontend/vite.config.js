// Configuración de Vite.
// El "proxy" redirige las peticiones /api al backend (puerto 4000),
// así el frontend puede llamar a fetch('/api/...') sin problemas de CORS en desarrollo.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
});
