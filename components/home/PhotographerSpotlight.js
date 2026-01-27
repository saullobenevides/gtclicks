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
    <section className="py-20">
      <div className="container-wide">
        <div className="mb-16 flex flex-col items-center text-center gap-3">
          <h2 className="heading-section font-display text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
            CRIADORES
          </h2>
          <p className="max-w-2xl text-base text-gray-400 font-medium">
            Conheça os fotógrafos por trás das lentes
          </p>
        </div>

        <div className="mx-auto max-w-5xl px-8">
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
                    className="group flex flex-col items-center gap-4 transition-all duration-300 border border-white/20 rounded-[32px] p-6 hover:bg-white/5 hover:border-white/40 h-full"
                  >
                    <div className="relative">
                      <div className="h-24 w-24 rounded-full p-[2px] bg-primary">
                        <Avatar className="h-full w-full border-2 border-black">
                          <AvatarImage
                            src={photographer.avatarUrl}
                            alt={photographer.name}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-zinc-800 text-white font-bold text-xl">
                            {photographer.name?.charAt(0) || "F"}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </div>

                    <div className="text-center flex flex-col gap-1">
                      <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors duration-300 truncate w-full px-2">
                        {photographer.name}
                      </h3>
                      {photographer.city && (
                        <p className="text-sm text-gray-400 font-medium">
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
