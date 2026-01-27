import { cn } from "@/lib/utils";
import Image from "next/image";
import ImageWithFallback from "@/components/shared/ImageWithFallback";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { User } from "lucide-react";
import { formatDateLong } from "@/lib/utils/formatters";
import ShareButton from "@/components/shared/actions/ShareButton";

export default function CollectionHero({ collection }) {
  if (!collection) return null;

  return (
    <div className="relative w-full h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 select-none">
        <ImageWithFallback
          src={collection.capaUrl}
          alt={collection.title}
          className="h-full w-full object-cover"
          priority
          fill
        />
        {/* Overlay Gradients */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 container-wide w-full flex flex-col items-center justify-center text-center gap-4 px-4">
        {/* Title */}
        <h1 className="heading-display font-display text-4xl font-black text-white sm:text-5xl md:text-6xl mb-2">
          {collection.title}
        </h1>

        {/* Location */}
        {collection.location && (
          <div className="flex items-center gap-2 text-sm md:text-base text-gray-200">
            <Image
              src="/icons/icon-location.png"
              alt="Localização"
              width={20}
              height={20}
              className="h-5 w-5 object-contain"
            />
            <span>{collection.location}</span>
          </div>
        )}

        {/* Date */}
        {collection.eventDate && (
          <div className="flex items-center gap-2 text-sm md:text-base text-gray-200">
            <Image
              src="/icons/icon-calendar.png"
              alt="Data"
              width={20}
              height={20}
              className="h-5 w-5 object-contain"
            />
            <span>{formatDateLong(collection.eventDate)}</span>
          </div>
        )}

        {/* Photographer Pill */}
        <div className="mt-4 flex flex-col md:flex-row items-center gap-4">
          <Link
            href={
              collection.photographerUsername
                ? `/fotografo/${collection.photographerUsername}`
                : "#"
            }
            className="flex items-center gap-3 bg-black rounded-2xl p-3 pr-6 pl-4 border border-white/10 hover:bg-black/80 transition-all group shadow-lg"
          >
            <Avatar className="h-10 w-10 border-2 border-primary shadow-sm">
              <AvatarImage
                src={collection.photographerAvatar}
                className="object-cover"
              />
              <AvatarFallback className="bg-neutral-800 text-white text-[10px]">
                {collection.photographer?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start leading-none gap-0.5">
              <span className="text-base font-bold text-white group-hover:text-primary transition-colors">
                {collection.photographer}
              </span>
              <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                Autor
              </span>
            </div>
          </Link>

          <ShareButton
            title={collection.title}
            text={`Confira as fotos de ${collection.title} no GT Clicks!`}
            className="bg-black/50 hover:bg-black/80 text-white border-white/10 h-14 w-14 rounded-2xl backdrop-blur-md"
          />
        </div>
      </div>
    </div>
  );
}
