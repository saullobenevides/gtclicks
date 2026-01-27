import prisma from "@/lib/prisma";

const BASE_URL = "https://gtclicks.com.br"; // Adjust domain as needed

export default async function sitemap() {
  // Static pages
  const staticRoutes = [
    "",
    "/busca",
    "/cadastro",
    "/faq",
    "/contato",
    "/termos",
    "/privacidade",
    "/fotografos",
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "monthly",
    priority: route === "" ? 1 : 0.8,
  }));

  // Dynamic Collections
  const collections = await prisma.colecao.findMany({
    where: { status: "PUBLICADA" }, // Only published collections
    select: { slug: true, createdAt: true },
  });

  const collectionRoutes = collections.map((col) => ({
    url: `${BASE_URL}/colecoes/${col.slug}`,
    lastModified: col.createdAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // Dynamic Photographers
  const photographers = await prisma.fotografo.findMany({
    select: { username: true, user: { select: { createdAt: true } } },
  });

  const photographerRoutes = photographers.map((p) => ({
    url: `${BASE_URL}/fotografo/${p.username}`,
    lastModified: p.user?.createdAt || new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...collectionRoutes, ...photographerRoutes];
}
