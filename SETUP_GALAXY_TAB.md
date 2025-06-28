# Guía de Instalación - Samsung Galaxy Tab Active5 5G

## Opción 1: Desarrollo Local en la Tablet (Recomendado para pruebas)

### 1. Instalar Termux
1. Descarga Termux desde F-Droid (NO desde Google Play - versión desactualizada)
   - Ve a: https://f-droid.org/packages/com.termux/
   - O descarga el APK directo desde GitHub: https://github.com/termux/termux-app/releases

### 2. Configurar Termux
```bash
# Actualizar paquetes
pkg update && pkg upgrade

# Instalar Node.js y Git
pkg install nodejs git

# Instalar build tools (necesario para algunas dependencias)
pkg install build-essential python

# Crear directorio de trabajo
mkdir ~/projects
cd ~/projects
```

### 3. Clonar y configurar el proyecto
```bash
# Clonar el repositorio
git clone [URL_DE_TU_REPOSITORIO]
cd encargados-master

# Instalar dependencias
npm install

# Configurar para acceso externo
# Crear archivo .env.local
echo "VITE_HOST=0.0.0.0" > .env.local
```

### 4. Iniciar el servidor
```bash
# Iniciar en modo desarrollo
npm run dev -- --host 0.0.0.0

# El servidor estará disponible en:
# http://localhost:5173
# http://[IP-DE-LA-TABLET]:5173
```

## Opción 2: Acceder desde PC/Servidor (Recomendado para producción)

### 1. En tu PC de desarrollo:
```bash
# Iniciar el servidor con acceso de red
npm run dev -- --host 0.0.0.0

# O para producción
npm run build
npm run preview -- --host 0.0.0.0
```

### 2. En la tablet:
1. Asegúrate de estar en la misma red WiFi
2. Abre Chrome o Samsung Internet
3. Navega a: `http://[IP-DE-TU-PC]:5173`

### Encontrar la IP de tu PC:
- Windows: `ipconfig`
- Mac/Linux: `ifconfig` o `ip addr`
- Busca la IP en tu red local (ej: 192.168.1.100)

## Opción 3: Despliegue con Servidor Web Local (Mejor rendimiento)

### 1. Construir la aplicación
```bash
npm run build
```

### 2. Servir con un servidor estático

#### Opción A: Con serve (Node.js)
```bash
# Instalar serve globalmente
npm install -g serve

# Servir la carpeta dist
serve -s dist -l 8080 --no-clipboard
```

#### Opción B: Con Python (si está disponible)
```bash
cd dist
python3 -m http.server 8080 --bind 0.0.0.0
```

#### Opción C: Con servidor Android (Simple HTTP Server)
1. Instala "Simple HTTP Server" desde Play Store
2. Selecciona la carpeta `dist` del proyecto
3. Inicia el servidor en puerto 8080

## Configuración de Red para la Tablet

### Si estás en red corporativa:
1. Verifica que los puertos 5173 (dev) u 8080 (prod) estén abiertos
2. Puede necesitar configurar proxy:
```bash
# En Termux
export HTTP_PROXY=http://proxy.empresa.com:8080
export HTTPS_PROXY=http://proxy.empresa.com:8080
```

### Para mejor rendimiento:
1. Usa Chrome o Samsung Internet (NO otros navegadores)
2. Activa el modo desarrollador en Android:
   - Ajustes → Acerca del dispositivo → Número de compilación (tocar 7 veces)
   - Ajustes → Opciones de desarrollador → Activar "Forzar renderizado GPU"

## Modo Kiosko (Para uso en producción)

### 1. Instalar Fully Kiosk Browser
- Descarga desde Play Store
- Configura la URL de inicio: `http://[IP-SERVIDOR]:8080`

### 2. Configuración recomendada:
- Activar modo pantalla completa
- Desactivar barra de navegación
- Activar inicio automático
- Configurar reconexión automática WiFi

## Solución de Problemas

### Error: "ERR_CONNECTION_REFUSED"
```bash
# Verificar que el servidor esté corriendo
lsof -i :5173

# Verificar firewall (en Termux)
iptables -L

# Reiniciar con puerto diferente
npm run dev -- --host 0.0.0.0 --port 3000
```

### La tablet se desconecta del WiFi
1. Ajustes → Conexiones → WiFi → Avanzado
2. Desactivar "Cambiar a datos móviles"
3. Mantener WiFi activo: "Siempre"

### Rendimiento lento
1. Cerrar otras apps
2. Limpiar caché de Chrome: Ajustes → Privacidad → Borrar datos
3. Usar el build de producción en lugar de desarrollo

## Scripts útiles para la tablet

### start-server.sh
```bash
#!/data/data/com.termux/files/usr/bin/bash
cd ~/projects/encargados-master
npm run dev -- --host 0.0.0.0
```

### auto-restart.sh
```bash
#!/data/data/com.termux/files/usr/bin/bash
while true; do
    npm run dev -- --host 0.0.0.0
    echo "Servidor caído, reiniciando en 5 segundos..."
    sleep 5
done
```

Hacer ejecutables:
```bash
chmod +x start-server.sh auto-restart.sh
```

## Acceso Directo en la Pantalla de Inicio

1. En Chrome/Samsung Internet, navega a la aplicación
2. Menú (3 puntos) → "Agregar a pantalla de inicio"
3. Nombrar como "Sistema Precintado"
4. Aparecerá como app nativa

## Notas de Seguridad

- NO expongas el servidor de desarrollo a internet público
- Usa HTTPS en producción (configura certificados SSL)
- Implementa autenticación antes del despliegue final
- Considera usar VPN para acceso remoto seguro