"use client";

import Link from "next/link";
import { ImageIcon, Calendar, Image as ImageIconLucide } from "lucide-react";
import ImageWithFallback from "@/components/shared/ImageWithFallback";
import { cn } from "@/lib/utils";
import { formatDateShort } from "@/lib/utils/formatters";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * CollectionCard - Componente padronizado para exibir coleções
 *
 * @param {Object} props
 * @param {Object} props.collection - Objeto da coleção
 * @param {'default'|'compact'|'featured'} props.variant - Variante visual do card
 * @param {boolean} props.showPhotographer - Se deve exibir nome do fotógrafo
 * @param {boolean} props.showDate - Se deve exibir data de criação
 * @param {boolean} props.showDescription - Se deve exibir descrição
 * @param {boolean} props.showPrice - Se deve exibir preço da foto
 * @param {Array} props.badges - Badges customizadas para exibir
 * @param {string} props.className - Classes CSS adicionais
 */
export default function CollectionCard({
  collection,
  variant = "default",
  showPhotographer = false,
  showDate = true,
  showDescription = true,
  showPrice = false,
  badges = [],
  className,
}) {
  // Determine counts
  const photoCount =
    collection.totalPhotos ||
    collection.photos?.length ||
    collection._count?.photos ||
    0;

  // Format info
  const date = collection.createdAt
    ? formatDateShort(collection.createdAt)
    : null;

  const isFeatured = variant === "featured";
  const isCompact = variant === "compact";

  const aspectClass = "aspect-square md:aspect-[2/3]";
  const titleSize = isFeatured
    ? "text-2xl"
    : isCompact
    ? "text-base"
    : "text-xl";
  const padding = isCompact ? "p-4" : "p-6";

  const coverUrl = collection.cover || collection.capaUrl;
  const isGradient = coverUrl?.startsWith("linear-gradient");

  return (
    <Link href={`/colecoes/${collection.slug}`}>
      <Card
        className={cn(
          "group relative block overflow-hidden rounded-xl bg-muted transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10 border-0",
          aspectClass,
          className
        )}
        data-testid="collection-card"
        data-collection-id={collection.id}
        aria-label={`Ver coleção ${collection.title || collection.name}`}
      >
        {/* Cover Image */}
        <div className="absolute inset-0 z-0">
          {coverUrl && !isGradient ? (
            <ImageWithFallback
              src={coverUrl}
              alt={collection.title || collection.name || "Coleção"}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : isGradient ? (
            <div
              className="h-full w-full transition-transform duration-700 group-hover:scale-110"
              style={{ background: coverUrl }}
            />
          ) : (
            <div className="h-full w-full bg-linear-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
              <ImageIconLucide className="h-12 w-12 text-zinc-700" />
            </div>
          )}
        </div>

        {/* Overlay Gradient */}
        <div className="absolute inset-0 z-10 bg-linear-to-t from-black/90 via-black/40 to-transparent opacity-80" />

        {/* Badges */}
        {badges.length > 0 && (
          <div className="absolute top-4 right-4 flex gap-2 z-20">
            {badges.map((badge, index) => (
              <Badge
                key={index}
                variant={
                  badge.variant === "success"
                    ? "default"
                    : badge.variant === "primary"
                    ? "default"
                    : "secondary"
                }
                className={cn(
                  "backdrop-blur-sm",
                  badge.variant === "success"
                    ? "bg-green-500/90 hover:bg-green-500 text-white"
                    : badge.variant === "primary"
                    ? "bg-primary/90 hover:bg-primary text-white"
                    : "bg-white/90 hover:bg-white text-black"
                )}
              >
                {badge.label}
              </Badge>
            ))}
          </div>
        )}

        {/* Content */}
        <CardContent
          className={cn(
            "absolute bottom-0 left-0 w-full flex flex-col justify-end z-20 h-full",
            padding
          )}
        >
          <div className="mt-auto">
            <h3
              className={cn(
                "font-bold text-white line-clamp-1 mb-1 drop-shadow-md group-hover:text-primary transition-colors",
                titleSize
              )}
            >
              {collection.title ||
                collection.name ||
                collection.titulo ||
                "Sem título"}
            </h3>

            {showDescription && collection.description && !isCompact && (
              <p className="text-sm text-gray-300 line-clamp-1 mb-3 opacity-90">
                {collection.description}
              </p>
            )}

            {/* Price Display */}
            {showPrice &&
              collection.precoFoto &&
              Number(collection.precoFoto) > 0 && (
                <div className="mb-3">
                  <span className="text-lg font-bold text-primary">
                    R${" "}
                    {Number(collection.precoFoto).toFixed(2).replace(".", ",")}
                  </span>
                </div>
              )}

            <div className="flex items-center justify-between border-t border-white/10 pt-3 mt-1">
              <span className="text-xs font-medium text-white/70 bg-white/10 px-2 py-1 rounded-full backdrop-blur-sm flex items-center gap-1">
                <ImageIconLucide className="h-3 w-3" />
                {photoCount} {photoCount === 1 ? "foto" : "fotos"}
              </span>

              <div className="flex items-center gap-3">
                {showDate && date && (
                  <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {date}
                  </span>
                )}

                {showPhotographer && collection.fotografo && (
                  <span className="text-xs text-gray-400 font-medium">
                    por {collection.fotografo.displayName}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
