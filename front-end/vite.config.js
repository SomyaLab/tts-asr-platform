import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // Listen on all network interfaces
    port: 5173,
    hmr: {
      host: 'localhost',  // Explicitly set HMR WebSocket host
      clientPort: 5173,  // Port for HMR WebSocket
    },
  },
})
