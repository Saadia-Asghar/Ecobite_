import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:3002',
                changeOrigin: true,
                secure: false,
            }
        }
    },
    build: {
        // Production optimizations - use esbuild (no terser needed)
        minify: 'esbuild',
        rollupOptions: {
            output: {
                manualChunks: {
                    // Split vendor chunks
                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                    'ui-vendor': ['framer-motion', 'recharts'],
                },
            },
        },
        chunkSizeWarningLimit: 1000,
        sourcemap: process.env.NODE_ENV === 'development',
    },
    // Explicitly disable terser
    esbuild: {
        drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    },
})
