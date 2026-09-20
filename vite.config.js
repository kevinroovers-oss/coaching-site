import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';
import content from './vite-plugin-content.js';

export default defineConfig({
  plugins: [glsl({ compress: false }), content()],
  build: {
    target: 'es2020',
    // Three is the bulk of the payload; keeping it in its own chunk lets the
    // browser cache it separately from the site code we iterate on.
    rollupOptions: {
      input: {
        main: 'index.html',
        'motion-study': 'motion-study.html',
      },
      output: {
        manualChunks: {
          three: ['three'],
          gsap: ['gsap', 'gsap/ScrollTrigger'],
        },
      },
    },
  },
});
