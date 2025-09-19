import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  build: {
    ssr: 'src/entry-server.tsx',
    outDir: 'dist/server',
    ssrManifest: true,
  },
  ssr: {
    noExternal: [
       /^@mui\/.*/,
      'react',
      'react-dom',
      'react-redux',
      'use-sync-external-store',
      'react-router',
      'react-router-dom',
      'react-share',
      'react-toastify',
      '@emotion/react',
      '@emotion/styled',
      'swiper', 
      'swiper/react'
    ],
    target: 'node',
  },
})
