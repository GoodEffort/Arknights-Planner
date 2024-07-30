import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), basicSsl()],
  base: '/Arknights-Planner/',
  define: {
    BUILD_DATE: JSON.stringify(new Date().toISOString())
  }
})
