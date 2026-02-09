import prisma from "@/lib/prisma";
import { MetadataRoute } from "next";

const BASE_URL = "https://gtclicks.com.br";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
    changeFrequency: (route === "" ? "daily" : "monthly") as
      | "daily"
      | "monthly",
    priority: route === "" ? 1 : 0.8,
  }));

  const collections = await prisma.colecao.findMany({
    where: { status: "PUBLICADA" },
    select: { slug: true, createdAt: true },
  });

  const collectionRoutes = collections.map((col) => ({
    url: `${BASE_URL}/colecoes/${col.slug}`,
    lastModified: col.createdAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const photographers = await prisma.fotografo.findMany({
    select: { username: true, user: { select: { createdAt: true } } },
  });

  const photographerRoutes = photographers.map((p) => ({
    url: `${BASE_URL}/fotografo/${p.username}`,
    lastModified: p.user?.createdAt ?? new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...collectionRoutes, ...photographerRoutes];
}
