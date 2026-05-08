import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

try {
  // Preserve the server bundle filename expected by the TanStack preview tooling.
  const serverSrc = path.join(__dirname, 'dist', 'server', 'index.js');
  const serverDest = path.join(__dirname, 'dist', 'server', 'server.js');
  if (fs.existsSync(serverSrc)) {
    fs.copyFileSync(serverSrc, serverDest);
    console.log('✓ Copied dist/server/index.js to dist/server/server.js');
  }

  // Prevent Vercel from serving the raw source HTML shell from dist/client.
  const clientIndex = path.join(__dirname, 'dist', 'client', 'index.html');
  if (fs.existsSync(clientIndex)) {
    fs.unlinkSync(clientIndex);
    console.log('✓ Removed dist/client/index.html');
  }
} catch (error) {
  console.error('Error preparing build output:', error.message);
  process.exit(1);
}
