import { getHomepageData } from "@/lib/data/marketplace";
import HeroSection from "@/components/home/HeroSection";
import FeaturedCollections from "@/components/home/FeaturedCollections";
import PhotographerSpotlight from "@/components/home/PhotographerSpotlight";
import BuyerRanking from "@/components/home/BuyerRanking";
import dynamic from "next/dynamic";

const FAQSection = dynamic(() => import("@/components/home/FAQSection"));

// Revalidate a cada minuto para o ranking atualizar
export const revalidate = 60;

export default async function Home() {
  const {
    featuredCollections = [],
    recentCollections = [],
    photographers = [],
    topBuyers = [],
    lastMonthWinner = null,
    rankingMonth = "",
    lastMonthName = "",
  } = await getHomepageData();

  return (
    <div className="flex flex-col gap-0 pb-24 md:pb-0">
      <HeroSection />

      <FeaturedCollections
        collections={featuredCollections}
        title="COLEÇÕES EM DESTAQUE"
        subtitle="As coleções mais visualizadas da comunidade"
      />

      <PhotographerSpotlight photographers={photographers} />

      <BuyerRanking
        buyers={topBuyers}
        month={rankingMonth}
        lastMonthWinner={lastMonthWinner}
        lastMonthName={lastMonthName}
      />

      <FeaturedCollections
        collections={recentCollections}
        title="COLEÇÕES RECENTES"
        subtitle="Fique por dentro das obras mais frescas"
      />

      <FAQSection />
    </div>
  );
}
