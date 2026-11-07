// @ts-check
import {defineConfig} from 'astro/config';
import node from '@astrojs/node';

// One Node.js app: `npm run build` creates dist/server/entry.mjs (Hostinger "Entry file":
// server/entry.mjs, PORT is set by the host). Every request renders fresh from Sanity, so a
// publish is live within seconds and the Studio's Presentation tab can show drafts.
export default defineConfig({
  site: 'https://www.example.com', // real domain
  output: 'server',
  adapter: node({mode: 'standalone'}),
  trailingSlash: 'always',
  build: {format: 'directory'},
  server: {port: 4321},
  devToolbar: {enabled: false},
  vite: {server: {fs: {allow: ['.']}}},
});
