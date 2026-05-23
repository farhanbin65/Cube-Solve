import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), basicSsl()],
  optimizeDeps: {
    include: ['kociemba-wasm']
  },
  server: {
    https: true,
    host: true,
  },
  worker: {
    format: 'es'
  }
})
