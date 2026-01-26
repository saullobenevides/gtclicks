import { getHomepageData } from "@/lib/data/marketplace";
import HeroSection from "@/components/home/HeroSection";
import FeaturedCollections from "@/components/home/FeaturedCollections";
import PhotographerSpotlight from "@/components/home/PhotographerSpotlight";
import dynamic from "next/dynamic";

const FAQSection = dynamic(() => import("@/components/home/FAQSection"));

// Revalidate this page every hour
export const revalidate = 3600;

export default async function Home() {
  const {
    collections = [],
    photographers = [],
    highlights = [],
  } = await getHomepageData();

  // Split collections for Featured and Recent
  // Assuming we have at least 6 collections, otherwise we might duplicate or show fewer
  const featuredCollections = collections.slice(0, 3);
  const recentCollections =
    collections.length > 3 ? collections.slice(3, 6) : collections.slice(0, 3); // Fallback to show something

  return (
    <div className="flex flex-col gap-0 pb-24">
      <HeroSection />

      <FeaturedCollections
        collections={featuredCollections}
        title="COLEÇÕES EM DESTAQUE"
        subtitle="Séries autorais selecionadas para inspirar sua próxima criação"
      />

      <PhotographerSpotlight photographers={photographers} />

      <FeaturedCollections
        collections={recentCollections}
        title="COLEÇÕES RECENTES"
        subtitle="Fique por dentro das obras mais frescas"
      />

      <FAQSection />
    </div>
  );
}
