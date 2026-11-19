import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = true;

const PAGINAS = ['', 'soluciones', 'proyectos', 'proceso', 'nosotros', 'contacto', 'blog'];

export const GET: APIRoute = async ({ site }) => {
  const base = site?.toString().replace(/\/$/, '') || 'https://orquestialab.com';
  const posts = await getCollection('blog');

  const urls = [
    ...PAGINAS.map((p) => (p === '' ? base : `${base}/${p}`)),
    ...posts.map((post) => `${base}/blog/${post.slug}`),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>
`;

  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
};
