import { getHomepageData } from "@/lib/data/marketplace";
import FeaturedCollections from "@/components/home/FeaturedCollections";
import PhotographerSpotlight from "@/components/home/PhotographerSpotlight";
import BuyerRanking from "@/components/home/BuyerRanking";

/**
 * Conteúdo da home que depende de dados do servidor.
 * Envolvido em Suspense para permitir FCP imediato com HeroSection.
 */
export default async function HomeContent() {
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
    <>
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
    </>
  );
}
