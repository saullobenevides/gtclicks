"use client";

import Link from "next/link";
import { ImageIcon } from "lucide-react";
import ImageWithFallback from "@/components/shared/ImageWithFallback";
import { cn } from "@/lib/utils";
import { formatDateShort } from "@/lib/utils/formatters";

export default function CollectionCard({ collection, className }) {
  // Determine counts
  const photoCount = collection.totalPhotos || collection.photos?.length || 0;
  
  // Format info
  const date = collection.createdAt 
    ? formatDateShort(collection.createdAt)
    : null;

  return (
    <Link
      href={`/colecoes/${collection.slug}`}
      className={cn(
        "group relative block overflow-hidden rounded-xl bg-muted aspect-square transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10",
        className
      )}
    >
        {/* Cover Image */}
        {collection.cover || collection.capaUrl ? (
            <ImageWithFallback
                src={collection.cover || collection.capaUrl}
                alt={collection.title || collection.name}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
        ) : (
            <div className="h-full w-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                 <ImageIcon className="h-12 w-12 text-zinc-700" />
            </div>
        )}

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col justify-end">
        <h3 className="text-xl font-bold text-white line-clamp-1 mb-1 drop-shadow-md group-hover:text-primary transition-colors">
            {collection.title || collection.name || "Sem título"}
        </h3>
        
        {collection.description && (
             <p className="text-sm text-gray-300 line-clamp-1 mb-3 opacity-90">{collection.description}</p>
        )}

        <div className="flex items-center justify-between border-t border-white/10 pt-3 mt-1">
            <span className="text-xs font-medium text-white/70 bg-white/10 px-2 py-1 rounded-full backdrop-blur-sm">
                {photoCount} fotos
            </span>
            {date && (
                <span className="text-xs text-gray-400 font-medium">
                    {date}
                </span>
            )}
        </div>
      </div>
    </Link>
  );
}
