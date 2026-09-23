import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base must match the GitHub Pages project-site path (https://waseemaboliel.github.io/sup-tag-test-site/).
// If this repo is ever renamed, update this to match.
export default defineConfig({
  base: '/sup-tag-test-site/',
  plugins: [react()],
})
