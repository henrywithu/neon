import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0', port: 5173, strictPort: true,
    proxy: {
      '/lobby': 'http://127.0.0.1:8787',
      '/room': { target: 'ws://127.0.0.1:8787', ws: true },
    },
  },
  preview: { host: '0.0.0.0', port: 4173, strictPort: true },
  build: {
    target: 'es2022',
    sourcemap: true,
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@dimforge/rapier')) return 'physics';
          if (id.includes('node_modules/three/') || id.includes('three-mesh-bvh')) return 'three';
          if (id.includes('node_modules/gsap')) return 'motion';
        },
      },
    },
  },
});
