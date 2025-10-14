// @ts-nocheck
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { copyFileSync, existsSync } from 'fs'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    {
      name: 'copy-sw-manual',
      closeBundle() {
        const srcPath = resolve(process.cwd(), 'public/sw.js')
        const destPath = resolve(process.cwd(), 'dist/sw.js')
        
        if (existsSync(srcPath)) {
          try {
            copyFileSync(srcPath, destPath)
            console.log('✅ Service Worker copiado exitosamente a dist/sw.js')
          } catch (err) {
            console.error('❌ Error copiando Service Worker:', err)
          }
        } else {
          console.error('❌ No se encontró public/sw.js')
        }
      }
    }
  ]
  ,
  build: {
    rollupOptions: {
      output: {
        // Fijar nombres sin hashes
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: ({ name }) => {
          if (!name) return 'assets/[name][extname]'
          if ((name as string).endsWith('.css')) return 'assets/[name].css'
          return 'assets/[name][extname]'
        }
      }
    }
  }
})