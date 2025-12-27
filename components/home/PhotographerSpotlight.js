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
    <section className="py-20">
      <div className="container-wide">
        <div className="mb-16 flex flex-col items-center text-center gap-3">
          <h2 className="heading-section font-display text-4xl font-black text-white sm:text-5xl lg:text-6xl">
            CRIADORES
          </h2>
          <p className="max-w-2xl text-base text-gray-400 font-medium">
            Conheça os fotógrafos por trás das lentes
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-12 md:gap-20">
          {photographers.map((photographer) => (
            <Link
              key={photographer.username}
              href={`/fotografo/${photographer.username}`}
              className="group flex flex-col items-center gap-5 transition-all duration-300"
            >
              <div className="relative">
                <div className="h-32 w-32 rounded-full p-[3px] bg-gradient-to-tr from-transparent via-transparent to-transparent group-hover:from-primary group-hover:via-primary group-hover:to-primary transition-all duration-500">
                  <Avatar className="h-full w-full border-[3px] border-background">
                    <AvatarImage
                      src={photographer.avatarUrl}
                      alt={photographer.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-zinc-800 text-white font-bold text-2xl">
                      {photographer.name?.charAt(0) || "F"}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors duration-300">
                  {photographer.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
