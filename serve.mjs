import { createServer } from 'vite';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function startDevServer() {
  const server = await createServer({
    root: __dirname,
    server: {
      port: 3333,
      host: '0.0.0.0',
      strictPort: true
    }
  });
  
  await server.listen();
  
  console.log('\n✅ Servidor corriendo en:');
  console.log('   http://localhost:3333');
  console.log('   http://127.0.0.1:3333');
  console.log('   http://0.0.0.0:3333\n');
}

startDevServer().catch(err => {
  console.error('Error iniciando servidor:', err);
  process.exit(1);
});