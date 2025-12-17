import prisma from "@/lib/prisma";

const BASE_URL = 'https://gtclicks.com.br'; // Adjust domain as needed

export default async function sitemap() {
  // Static pages
  const routes = ['', '/busca', '/carrinho'].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
  }));

  // Dynamic Collections
  const collections = await prisma.colecao.findMany({
    select: { slug: true, updatedAt: true },
  });

  const collectionRoutes = collections.map((col) => ({
    url: `${BASE_URL}/colecoes/${col.slug}`,
    lastModified: col.updatedAt,
  }));

  // Dynamic Photographers
  const photographers = await prisma.fotografo.findMany({
    select: { username: true, user: { select: { createdAt: true } } },
  });

  const photographerRoutes = photographers.map((p) => ({
    url: `${BASE_URL}/fotografo/${p.username}`,
    lastModified: new Date(), // Using current date as profile update isn't tracked easily yet
  }));

  return [...routes, ...collectionRoutes, ...photographerRoutes];
}
