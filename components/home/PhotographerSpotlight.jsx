import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { PageSection, SectionHeader } from "@/components/shared/layout";

export default function PhotographerSpotlight({ photographers = [] }) {
  if (!photographers || photographers.length === 0) return null;

  return (
    <PageSection variant="default" containerWide>
      <SectionHeader
        title="CRIADORES"
        description="Conheça os fotógrafos por trás das lentes"
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-8">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4 md:-ml-8">
            {photographers.map((photographer) => (
              <CarouselItem
                key={photographer.username}
                className="pl-4 md:pl-8 basis-full sm:basis-1/2 md:basis-1/2 lg:basis-1/3"
              >
                <Link
                  href={`/fotografo/${photographer.username}`}
                  className="group flex flex-col items-center gap-4 transition-all duration-300 border border-white/10 rounded-2xl p-5 sm:p-6 hover:bg-white/5 hover:border-white/20 h-full min-h-[180px] touch-manipulation active:scale-[0.99]"
                  aria-label={`Ver perfil de ${photographer.name}`}
                >
                  <div className="relative">
                    <div className="h-24 w-24 rounded-radius-full p-[2px] bg-action-primary shadow-shadow-md">
                      <Avatar className="h-full w-full border-2 border-surface-page">
                        <AvatarImage
                          src={photographer.avatarUrl}
                          alt={photographer.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-surface-subtle text-text-primary font-font-bold text-text-xl">
                          {photographer.name?.charAt(0) || "F"}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>

                  <div className="text-center flex flex-col gap-1">
                    <h3 className="text-lg font-font-bold text-text-primary group-hover:text-action-primary transition-colors duration-300 truncate w-full px-2">
                      {photographer.name}
                    </h3>
                    {photographer.city && (
                      <p className="text-sm text-text-secondary font-font-medium">
                        {photographer.city}
                      </p>
                    )}
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious
            className="min-h-11 min-w-11 h-11 w-11 -left-2 sm:-left-4 md:-left-12"
            aria-label="Fotógrafo anterior"
          />
          <CarouselNext
            className="min-h-11 min-w-11 h-11 w-11 -right-2 sm:-right-4 md:-right-12"
            aria-label="Próximo fotógrafo"
          />
        </Carousel>
      </div>
    </PageSection>
  );
}
