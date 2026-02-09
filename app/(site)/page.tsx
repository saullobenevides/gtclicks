import { Suspense } from "react";
import HeroSection from "@/components/home/HeroSection";
import HomeContent from "./HomeContent";
import HomeSkeleton from "./HomeSkeleton";
import dynamic from "next/dynamic";

const FAQSection = dynamic(() => import("@/components/home/FAQSection"));

// Revalidate a cada minuto para o ranking atualizar
export const revalidate = 60;

/**
 * HeroSection renderiza imediatamente (FCP rápido).
 * HomeContent carrega em streaming via Suspense.
 */
export default function Home() {
  return (
    <div className="flex flex-col gap-0 pb-24 md:pb-0">
      <HeroSection />

      <Suspense fallback={<HomeSkeleton />}>
        <HomeContent />
      </Suspense>

      <FAQSection />
    </div>
  );
}
