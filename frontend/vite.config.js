import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('codemirror') || id.includes('@uiw/react-codemirror')) {
              return 'vendor-codemirror';
            }
            if (id.includes('prettier')) {
              return 'vendor-prettier';
            }
            if (id.includes('framer-motion') || id.includes('gsap') || id.includes('lucide-react')) {
              return 'vendor-ui';
            }
            return 'vendor'; // Other node_modules
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})
