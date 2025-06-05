import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiBaseUrl = env.API_BASE_URL || 'http://localhost:8000'
  
  return {
    plugins: [
      react({
        // Enable fast refresh in development
        fastRefresh: true,
        // Include .jsx files
        include: "**/*.{jsx,tsx}",
      })
    ],
    
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@services': path.resolve(__dirname, './src/services'),
        '@stores': path.resolve(__dirname, './src/stores'),
        '@config': path.resolve(__dirname, './src/config'),
      },
    },
    
    server: {
      port: 5173,
      host: true,
      proxy: {
        '/api': {
          target: apiBaseUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      },
      // Improve HMR performance
      hmr: {
        overlay: true,
      }
    },
    
    // Build optimizations
    build: {
      // Reduce bundle size
      target: 'es2020',
      minify: 'terser',
      sourcemap: mode === 'development',
      
      // Code splitting configuration
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunk for React and core libraries
            vendor: ['react', 'react-dom', 'react-router-dom'],
            
            // UI chunk for UI libraries
            ui: [
              '@headlessui/react',
              '@heroicons/react',
              'framer-motion',
              'lucide-react'
            ],
            
            // Utils chunk for utility libraries
            utils: [
              'axios',
              'zustand',
              'uuid',
              'clsx',
              'tailwind-merge'
            ],
            
            // Video processing chunk
            video: [
              '@ffmpeg/ffmpeg',
              '@ffmpeg/util',
              'react-player'
            ]
          },
          // Optimize chunk names
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId
            if (facadeModuleId) {
              return `chunks/[name]-[hash].js`
            }
            return `chunks/[name]-[hash].js`
          }
        }
      },
      
      // Optimize terser settings
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
        },
      },
      
      // Chunk size warnings
      chunkSizeWarningLimit: 1000,
    },
    
    // Optimize dependencies
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'axios',
        'zustand',
        'framer-motion'
      ],
      exclude: [
        '@ffmpeg/ffmpeg',
        '@ffmpeg/util'
      ]
    },
    
    // Define global variables
    define: {
      global: 'globalThis',
      'import.meta.env.API_BASE_URL': JSON.stringify(apiBaseUrl),
      'import.meta.env.APP_VERSION': JSON.stringify(process.env.npm_package_version || '1.0.0'),
      '__DEV__': mode === 'development',
    },
    
    // CSS optimization
    css: {
      devSourcemap: mode === 'development',
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/variables.scss";`
        }
      }
    },
    
    // Preview server settings
    preview: {
      port: 4173,
      host: true,
    },
    
    // Environment variable prefix
    envPrefix: ['VITE_', 'OPENCLIP_'],
    
    // Worker configuration for video processing
    worker: {
      format: 'es'
    }
  }
})