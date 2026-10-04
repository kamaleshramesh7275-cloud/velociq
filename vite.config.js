import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function telematicsRelayPlugin() {
  return {
    name: 'telematics-relay',
    configureServer(server) {
      server.ws.on('velociq:control', (data, client) => {
        server.ws.clients.forEach((c) => {
          if (c !== client) {
            c.send({ type: 'custom', event: 'velociq:control', data });
          }
        });
      });

      server.ws.on('velociq:feedback', (data, client) => {
        server.ws.clients.forEach((c) => {
          if (c !== client) {
            c.send({ type: 'custom', event: 'velociq:feedback', data });
          }
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), telematicsRelayPlugin()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    cors: true,
    strictPort: true,
    watch: {
      ignored: [
        '**/android/**',
        '**/*.md',
        '**/*.apk',
        '**/dist/**',
        '**/public/downloads/**',
      ],
    },
  },
});
