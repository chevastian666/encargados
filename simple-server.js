const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  console.log(`Request: ${req.url}`);
  
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test Server</title>
      </head>
      <body>
        <h1>Server is working!</h1>
        <p>If you can see this, the server is running correctly.</p>
        <p>Time: ${new Date().toLocaleString()}</p>
      </body>
      </html>
    `);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

const PORT = 8080;
server.listen(PORT, '127.0.0.1', () => {
  console.log(`Test server running at http://127.0.0.1:${PORT}/`);
  console.log(`Also try: http://localhost:${PORT}/`);
});