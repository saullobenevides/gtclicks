import Link from 'next/link';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

export default function PhotographerSpotlight({ photographers = [] }) {
  if (!photographers || photographers.length === 0) return null;

  return (
    <section className="bg-white/5 py-24 border-y border-white/5">
      <div className="container-wide">
        <div className="mb-16 flex flex-col items-center text-center gap-4">
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Criadores
          </h2>
          <p className="max-w-2xl text-lg text-gray-400">
            Conheça os talentos por trás das lentes.
          </p>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full relative px-4 sm:px-12"
        >
          <CarouselContent className="-ml-4">
            {photographers.map((photographer) => (
              <CarouselItem key={photographer.username} className="pl-4 md:basis-1/2 lg:basis-1/4">
                <Link
                  href={`/fotografo/${photographer.username}`}
                  className="group block h-full"
                >
                  <Card className="glass-panel flex h-full min-h-[300px] flex-col items-center justify-center p-8 text-center transition-all duration-300 hover:border-primary/50 hover:bg-white/10">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl opacity-0 transition-opacity group-hover:opacity-100" />
                      <Avatar className="h-24 w-24 border-2 border-white/10 group-hover:border-primary transition-colors relative">
                        <AvatarImage
                          src={photographer.avatarUrl}
                          alt={photographer.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-white/10 text-white text-xl">
                          {photographer.name?.charAt(0) || "F"}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    
                    <CardHeader className="p-0">
                      <CardTitle className="text-xl font-bold text-white mb-1">
                        {photographer.name}
                      </CardTitle>
                      <p className="text-sm text-primary font-medium uppercase tracking-wider">
                        {photographer.city || "Brasil"}
                      </p>
                    </CardHeader>
                    
                     <div className="mt-4 flex gap-4 text-xs text-gray-400 justify-center">
                        <div>
                            <span className="block font-bold text-white text-lg">{photographer.stats?.colecoes || 0}</span>
                            Coleções
                        </div>
                     </div>
                  </Card>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </div>
    </section>
  );
}
