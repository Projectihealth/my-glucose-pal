import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    host: true,

    // 代理配置：解决CORS问题
    proxy: {
      // Minerva后端（Retell语音服务）
      '/intake': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },

      // Flask后端（Avatar和Dashboard服务）
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  },

  // 路径别名配置
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@services': path.resolve(__dirname, './src/services'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@types': path.resolve(__dirname, './src/types'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@utils': path.resolve(__dirname, './src/utils'),
    }
  },

  // 环境变量配置
  // 注意：不要在这里硬编码API密钥！
  // 使用 .env 文件代替
  define: {
    // Vite会自动处理VITE_前缀的环境变量
  },

  // 构建配置
  build: {
    outDir: 'dist',
    sourcemap: true,
    // 代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'daily': ['@daily-co/daily-react'],
        }
      }
    }
  }
})
