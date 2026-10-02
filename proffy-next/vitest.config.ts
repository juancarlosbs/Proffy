import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        projects: [
            {
                extends: true,
                test: {
                    name: 'node',
                    environment: 'node',
                    include: ['test/**/*.test.ts'],
                },
            },
            {
                extends: true,
                test: {
                    name: 'jsdom',
                    environment: 'jsdom',
                    include: ['test/**/*.test.tsx'],
                    setupFiles: ['./test/setup-jsdom.ts'],
                },
            },
        ],
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
});
