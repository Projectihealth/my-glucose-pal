import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
  define: {
    'import.meta.env.VITE_TAVUS_API_KEY': JSON.stringify(process.env.VITE_TAVUS_API_KEY || '9b6138127c1946fb98a5ad3b5c86300b'),
    'import.meta.env.VITE_REPLICA_ID': JSON.stringify(process.env.VITE_REPLICA_ID || 'r9fa0878977a'),
    'import.meta.env.VITE_PERSONA_ID': JSON.stringify(process.env.VITE_PERSONA_ID || 'p176d7357a2d'),
    'import.meta.env.VITE_BACKEND_URL': JSON.stringify(process.env.VITE_BACKEND_URL || 'http://localhost:5000'),
  },
})
