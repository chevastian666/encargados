const { spawn } = require('child_process');
const http = require('http');

// Start Vite in the background
const vite = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

// Create a simple proxy server
setTimeout(() => {
  const proxy = http.createServer((req, res) => {
    const options = {
      hostname: '127.0.0.1',
      port: 5173,
      path: req.url,
      method: req.method,
      headers: req.headers
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.error('Proxy error:', err);
      res.writeHead(502);
      res.end('Bad Gateway');
    });

    req.pipe(proxyReq);
  });

  proxy.listen(8080, () => {
    console.log('\n=================================');
    console.log('Proxy server running on port 8080');
    console.log('Try accessing: http://localhost:8080');
    console.log('=================================\n');
  });
}, 3000);

// Handle termination
process.on('SIGINT', () => {
  vite.kill();
  process.exit();
});