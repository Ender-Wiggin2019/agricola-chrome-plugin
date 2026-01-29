// biome-ignore-all lint: <config file>

import react from '@vitejs/plugin-react';
// @ts-expect-error
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // @ts-expect-error
      '@': path.resolve(__dirname, './src'),
    },
  },
});
