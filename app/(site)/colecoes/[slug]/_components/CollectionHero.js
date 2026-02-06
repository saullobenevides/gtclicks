import { cn } from "@/lib/utils";
import { formatDateLong } from "@/lib/utils/formatters";
import Image from "next/image";
import ImageWithFallback from "@/components/shared/ImageWithFallback";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { MapPin, Calendar, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
          sizes="100vw"
          priority
          fill
        />
        {/* Overlay Gradients */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 container-wide w-full flex flex-col items-center justify-center text-center gap-4 px-4">
        {/* Title */}
        <h1 className="heading-display font-display text-4xl font-black text-white sm:text-5xl md:text-6xl mb-2 drop-shadow-lg">
          {collection.title}
        </h1>

        {/* Info Row */}
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm md:text-base text-gray-200">
          {/* Location */}
          {collection.location && (
            <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/5">
              <MapPin className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              <span>{collection.location}</span>
            </div>
          )}

          {/* Date */}
          {collection.eventDate && (
            <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/5">
              <Calendar className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              <span>{formatDateLong(collection.eventDate)}</span>
            </div>
          )}
        </div>

        {/* View Details Button (Description) */}
        {collection.description && (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-white/80 hover:text-white hover:bg-white/10 gap-2 h-auto py-1 px-3 rounded-full"
              >
                <Info className="h-4 w-4" />
                Ver detalhes
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{collection.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                <p className="text-text-secondary leading-relaxed whitespace-pre-line">
                  {collection.description}
                </p>

                <div className="grid grid-cols-2 gap-4 text-sm mt-4 pt-4 border-t border-border-subtle">
                  <div>
                    <span className="text-text-muted text-xs uppercase tracking-wider block mb-1">
                      Data
                    </span>
                    <span className="font-medium">
                      {collection.eventDate
                        ? formatDateLong(collection.eventDate)
                        : "Data não disponível"}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-muted text-xs uppercase tracking-wider block mb-1">
                      Local
                    </span>
                    <span className="font-medium">
                      {collection.location || "Local não informado"}
                    </span>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Photographer Pill & Actions */}
        <div className="mt-6 flex flex-col md:flex-row items-center gap-4">
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
            className="bg-black/50 hover:bg-black/80 text-white border-white/10 h-14 w-14 rounded-2xl backdrop-blur-md transition-all hover:scale-105"
          />
        </div>
      </div>
    </div>
  );
}
