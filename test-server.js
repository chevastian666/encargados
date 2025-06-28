const http = require('http');
const PORT = 55555;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Server is working!');
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running at http://127.0.0.1:${PORT}/`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});