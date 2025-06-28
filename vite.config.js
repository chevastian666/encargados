import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    host: true, // Escuchar en todas las interfaces de red (0.0.0.0)
    open: false,
    cors: true,
    // Configuración para mejor compatibilidad con tablets
    hmr: {
      overlay: true,
      timeout: 120000 // Timeout más largo para conexiones lentas
    },
    // Headers para mejor compatibilidad
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  },
  preview: {
    port: 4173,
    host: true,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  },
  // Optimizaciones para build de producción
  build: {
    target: 'es2015', // Compatibilidad con navegadores móviles
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Eliminar console.log en producción
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['lucide-react'],
        }
      }
    }
  },
  // Optimizaciones para tablets
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react']
  }
})
