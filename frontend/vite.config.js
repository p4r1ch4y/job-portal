import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Client-side port
    // proxy: {
    //   // Proxy API requests to the backend server during development
    //   '/api': {
    //     target: 'http://localhost:5000', // Your backend server address
    //     changeOrigin: true,
    //     // rewrite: (path) => path.replace(/^/api/, '') // if your backend doesn't have /api prefix
    //   }
    // }
  }
});