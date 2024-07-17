import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/Arknights-Planner/',
  define: {
    BUILD_DATE: JSON.stringify(new Date().toISOString())
  }
})
