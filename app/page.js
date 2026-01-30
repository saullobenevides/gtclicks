import { getHomepageData } from "@/lib/data/marketplace";
import HeroSection from "@/components/home/HeroSection";
import FeaturedCollections from "@/components/home/FeaturedCollections";
import PhotographerSpotlight from "@/components/home/PhotographerSpotlight";
import BuyerRanking from "@/components/home/BuyerRanking";
import dynamic from "next/dynamic";

const FAQSection = dynamic(() => import("@/components/home/FAQSection"));

// Revalidate this page every hour
export const revalidate = 3600;

export default async function Home() {
  const {
    featuredCollections = [],
    recentCollections = [],
    photographers = [],
    topBuyers = [],
  } = await getHomepageData();

  return (
    <div className="flex flex-col gap-0 pb-24">
      <HeroSection />

      <FeaturedCollections
        collections={featuredCollections}
        title="COLEÇÕES EM DESTAQUE"
        subtitle="As coleções mais visualizadas da comunidade"
      />

      <PhotographerSpotlight photographers={photographers} />

      <BuyerRanking buyers={topBuyers} />

      <FeaturedCollections
        collections={recentCollections}
        title="COLEÇÕES RECENTES"
        subtitle="Fique por dentro das obras mais frescas"
      />

      <FAQSection />
    </div>
  );
}
