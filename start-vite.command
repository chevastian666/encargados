#!/bin/bash
cd "$(dirname "$0")"

echo "🚀 Iniciando servidor de desarrollo..."
echo ""
echo "Si aparece un diálogo pidiendo permisos, ACEPTA"
echo ""

# Limpiar procesos anteriores
killall node 2>/dev/null || true

# Esperar un momento
sleep 1

# Iniciar con configuración específica
export NODE_OPTIONS="--no-warnings"
npm run dev