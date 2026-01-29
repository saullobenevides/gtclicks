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

export default function PhotographerSpotlight({ photographers = [] }) {
  if (!photographers || photographers.length === 0) return null;

  return (
    <section className="py-space-16">
      <div className="container-wide">
        <div className="mb-space-12 flex flex-col items-center text-center gap-space-3">
          <h2 className="heading-section font-display text-text-2xl sm:text-text-3xl md:text-text-4xl font-font-bold text-text-primary uppercase tracking-tight">
            CRIADORES
          </h2>
          <p className="max-w-2xl text-text-base text-text-secondary font-font-medium">
            Conheça os fotógrafos por trás das lentes
          </p>
        </div>

        <div className="mx-auto max-w-5xl px-space-8">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-space-4 md:-ml-space-8">
              {photographers.map((photographer) => (
                <CarouselItem
                  key={photographer.username}
                  className="pl-space-4 md:pl-space-8 basis-full sm:basis-1/2 md:basis-1/2 lg:basis-1/3"
                >
                  <Link
                    href={`/fotografo/${photographer.username}`}
                    className="group flex flex-col items-center gap-space-4 transition-all duration-300 border border-border-default rounded-radius-2xl p-space-6 hover:bg-surface-subtle hover:border-border-subtle h-full"
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

                    <div className="text-center flex flex-col gap-space-1">
                      <h3 className="text-text-lg font-font-bold text-text-primary group-hover:text-action-primary transition-colors duration-300 truncate w-full px-space-2">
                        {photographer.name}
                      </h3>
                      {photographer.city && (
                        <p className="text-text-sm text-text-secondary font-font-medium">
                          {photographer.city}
                        </p>
                      )}
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </div>
    </section>
  );
}
