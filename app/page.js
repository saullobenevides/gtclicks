import { getHomepageData } from '@/lib/data/marketplace';
import HeroSection from '@/components/home/HeroSection';
import FeaturedCollections from '@/components/home/FeaturedCollections';
import PhotographerSpotlight from '@/components/home/PhotographerSpotlight';
import FeaturesGrid from '@/components/home/FeaturesGrid';
import CTASection from '@/components/home/CTASection';

// Revalidate this page every 60 seconds
export const revalidate = 60;

export default async function Home() {
  const { collections = [], photographers = [], highlights = [] } =
    await getHomepageData();

  return (
    <div className="flex flex-col gap-24 pb-24">
      <HeroSection />
      <FeaturedCollections collections={collections} />
      <PhotographerSpotlight photographers={photographers} />
      <FeaturesGrid highlights={highlights} />
      <CTASection />
    </div>
  );
}
