import prisma from "@/lib/prisma";

export default async function sitemap() {
  const baseUrl = "https://www.gtclicks.com";

  // Static routes
  const routes = [
    "",
    "/categorias",
    "/cadastro",
    "/login",
    "/termos",
    "/privacidade",
    "/contato",
    "/faq",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: route === "" ? 1 : 0.8,
  }));

  // Dynamic routes: Collections
  let collections = [];
  try {
    const collectionsData = await prisma.colecao.findMany({
      where: { status: "PUBLICADA" },
      select: { slug: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    collections = collectionsData.map((item) => ({
      url: `${baseUrl}/colecoes/${item.slug}`,
      lastModified: item.createdAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Failed to generate collection sitemap:", error);
  }

  // Dynamic routes: Photographers
  let photographers = [];
  try {
    const photographersData = await prisma.fotografo.findMany({
      select: { username: true }, // No updatedAt in Fotografo, using now() or maybe user updatedAt? Schema says Fotografo has no updatedAt.
    });
    photographers = photographersData.map((item) => ({
      url: `${baseUrl}/fotografo/${item.username}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    }));
  } catch (error) {
    console.error("Failed to generate photographer sitemap:", error);
  }
  
  // Dynamic routes: Photos
  // Since there might be thousands, listing all might be heavy. For now, let's limit to recent ones or skip if too many.
  // I'll skip photos for now to keep the sitemap manageable, or just add recent 1000.
  // Let's add recent 100 published photos.
  let photos = [];
  try {
    const photosData = await prisma.foto.findMany({
        where: { status: "PUBLICADA" },
        select: { id: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 100
    });
    photos = photosData.map((item) => ({
        url: `${baseUrl}/foto/${item.id}`,
        lastModified: item.createdAt,
        changeFrequency: 'monthly',
        priority: 0.5
    }));
  } catch (error) {
      console.error("Failed to generate photo sitemap:", error);
  }

  return [...routes, ...collections, ...photographers, ...photos];
}
