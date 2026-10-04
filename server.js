import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, 'dist');
const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.mjs': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.wasm': 'application/wasm',
};

const server = http.createServer((req, res) => {
  // Normalize URL and strip query strings
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = parsedUrl.pathname;

  // Health check endpoint for Render
  if (pathname === '/healthz' || pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
    return;
  }

  // Security check: prevent directory traversal
  let safePath = path.normalize(path.join(DIST_DIR, pathname));
  if (!safePath.startsWith(DIST_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  // Check if requested file exists in dist
  fs.stat(safePath, (err, stats) => {
    if (!err && stats.isFile()) {
      const ext = path.extname(safePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
      });
      fs.createReadStream(safePath).pipe(res);
    } else {
      // SPA Fallback: Serve index.html for all client-side routes (e.g. /dashboard, /engine-twin, /controller)
      const indexPath = path.join(DIST_DIR, 'index.html');
      fs.readFile(indexPath, (errIndex, content) => {
        if (errIndex) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Error loading application. Please run `npm run build` first.');
        } else {
          res.writeHead(200, {
            'Content-Type': 'text/html; charset=UTF-8',
            'Cache-Control': 'no-cache',
          });
          res.end(content);
        }
      });
    }
  });
});

// Setup WebSocket server on /ws for production multi-device telematics relay
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    try {
      const parsed = JSON.parse(message.toString());
      // Broadcast control & feedback packets to all other connected devices
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(parsed));
        }
      });
    } catch (_) {}
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 VelocIQ Web Service running on port ${PORT}`);
  console.log(`🌐 Local / Render URL: http://0.0.0.0:${PORT}`);
});
