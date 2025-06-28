#!/bin/bash

echo "🧹 Limpiando procesos anteriores..."
killall node 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
lsof -ti:8080 | xargs kill -9 2>/dev/null || true

echo "🚀 Iniciando servidor en puerto 8080..."

# Cambiar puerto en vite.config.js temporalmente
cat > vite.config.temp.js << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    host: true,
    open: false,
    cors: true
  }
})
EOF

# Backup y reemplazar config
mv vite.config.js vite.config.backup.js
mv vite.config.temp.js vite.config.js

# Iniciar servidor
echo "📡 Servidor iniciando en http://localhost:8080"
npm run dev