import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://orquestialab.com',
  output: 'static',
  adapter: vercel(),
});
