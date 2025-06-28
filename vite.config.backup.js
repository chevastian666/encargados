import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  server: {
    port: 5173,
    host: '127.0.0.1',
    open: false,
    cors: true,
    hmr: {
      protocol: 'ws',
      host: '127.0.0.1',
      port: 5173
    }
  }
})
