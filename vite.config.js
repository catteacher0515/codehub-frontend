import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:8125',
                changeOrigin: true,
                // rewrite: (path) => path.replace(/^\/api/, ''), // I don't think I need to remove /api based on the description
            },
        },
    },
});
