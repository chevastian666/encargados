import { createServer } from 'vite';

async function startServer() {
  try {
    const server = await createServer({
      configFile: './vite.config.js',
      server: {
        port: 5173,
        host: true
      }
    });
    
    await server.listen();
    
    console.log('Server is running at:');
    server.printUrls();
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

startServer();