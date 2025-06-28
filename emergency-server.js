const express = require('express');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = 9999;

// Servir archivos estáticos
app.use(express.static('dist'));

// Ruta de fallback
app.get('*', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Servidor de Emergencia</title>
    </head>
    <body>
      <h1>Servidor de emergencia funcionando</h1>
      <p>El servidor está corriendo en el puerto ${PORT}</p>
      <p>Para acceder a la aplicación, primero necesitas compilarla:</p>
      <pre>npm run build</pre>
      <p>Luego refresca esta página.</p>
      <hr>
      <p>También puedes intentar acceder por:</p>
      <ul>
        <li><a href="http://192.168.1.125:${PORT}">http://192.168.1.125:${PORT}</a></li>
        <li><a href="http://127.0.0.1:${PORT}">http://127.0.0.1:${PORT}</a></li>
      </ul>
    </body>
    </html>
  `);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
🚨 SERVIDOR DE EMERGENCIA ACTIVO 🚨
===================================
Accede a tu aplicación en:

1. http://192.168.1.125:${PORT}
2. http://127.0.0.1:${PORT}
3. http://localhost:${PORT}

Si localhost no funciona, usa la IP directa: http://192.168.1.125:${PORT}
===================================
  `);
  
  // Intentar abrir el navegador
  exec(`open http://192.168.1.125:${PORT}`);
});