const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Check if we have express installed
try {
  require.resolve('express');
} catch(e) {
  console.error('Express not found. Installing...');
  const { execSync } = require('child_process');
  execSync('npm install express http-proxy-middleware', { stdio: 'inherit' });
}

const app = express();
const PORT = 4000;

// Proxy all requests to Vite dev server
app.use('/', createProxyMiddleware({
  target: 'http://127.0.0.1:5173',
  changeOrigin: true,
  ws: true,
  logLevel: 'debug',
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).send('Proxy error');
  }
}));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
🚀 Server is running!

Try these URLs:
- http://localhost:${PORT}
- http://127.0.0.1:${PORT}
- http://0.0.0.0:${PORT}

If localhost doesn't work, try the IP addresses above.
  `);
});