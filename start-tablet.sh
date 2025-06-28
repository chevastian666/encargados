#!/bin/bash

# Script para iniciar el servidor en Samsung Galaxy Tab Active5
# Optimizado para uso en puerto y condiciones industriales

echo "🚀 Iniciando Sistema de Precintado Aduanero..."
echo "📱 Optimizado para Samsung Galaxy Tab Active5 5G"
echo ""

# Detectar el sistema operativo/entorno
if [ -d "/data/data/com.termux" ]; then
    echo "✅ Detectado: Termux en Android"
    PLATFORM="termux"
else
    echo "✅ Detectado: Sistema Desktop"
    PLATFORM="desktop"
fi

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js no está instalado"
    if [ "$PLATFORM" = "termux" ]; then
        echo "Instala con: pkg install nodejs"
    else
        echo "Instala Node.js desde: https://nodejs.org"
    fi
    exit 1
fi

# Verificar si las dependencias están instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

# Obtener IP local
if [ "$PLATFORM" = "termux" ]; then
    IP=$(ip addr show wlan0 2>/dev/null | grep 'inet ' | awk '{print $2}' | cut -d/ -f1)
else
    # Para Mac/Linux
    IP=$(ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -n1)
fi

# Puerto por defecto
PORT=${PORT:-5173}

echo ""
echo "🌐 Configuración de Red:"
echo "   IP Local: ${IP:-No detectada}"
echo "   Puerto: $PORT"
echo ""

# Crear o actualizar .env.local
cat > .env.local << EOF
VITE_HOST=0.0.0.0
VITE_PORT=$PORT
EOF

# Función para mostrar URLs de acceso
show_urls() {
    echo ""
    echo "✅ Servidor iniciado correctamente!"
    echo ""
    echo "📱 Accede desde la tablet en:"
    echo "   http://localhost:$PORT"
    if [ ! -z "$IP" ]; then
        echo "   http://$IP:$PORT"
    fi
    echo ""
    echo "💡 Consejos:"
    echo "   - Asegúrate de estar en la misma red WiFi"
    echo "   - Si no funciona, verifica el firewall"
    echo "   - Para mejor rendimiento, usa Chrome o Samsung Internet"
    echo ""
    echo "🛑 Presiona Ctrl+C para detener el servidor"
    echo ""
}

# Iniciar servidor según el modo
if [ "$1" = "prod" ] || [ "$1" = "production" ]; then
    echo "🏭 Modo: PRODUCCIÓN"
    echo "🔨 Construyendo aplicación optimizada..."
    npm run build
    
    if [ $? -eq 0 ]; then
        show_urls
        npm run preview -- --host 0.0.0.0 --port $PORT
    else
        echo "❌ Error al construir la aplicación"
        exit 1
    fi
else
    echo "🔧 Modo: DESARROLLO"
    show_urls
    npm run dev -- --host 0.0.0.0 --port $PORT
fi