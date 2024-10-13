import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import mkcert from 'vite-plugin-mkcert'
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), mkcert()],
  base: '/Arknights-Planner/',
  define: {
    BUILD_DATE: JSON.stringify(new Date().toISOString())
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    },
  },
})
