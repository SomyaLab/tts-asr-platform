import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // Listen on all network interfaces
    port: 5173,
    allowedHosts: [
      'localhost',
      'somya.ai',
      'www.somya.ai',
      '.somya.ai',  // Allow all subdomains
    ],
    hmr: {
      // Disable HMR over websocket when accessed via domain
      // This prevents wss://localhost:5173 connection errors
      protocol: 'ws',
      host: 'localhost',
      clientPort: 5173,
    },
    // Disable HMR when accessed through Cloudflare Tunnel
    strictPort: false,
  },
})
