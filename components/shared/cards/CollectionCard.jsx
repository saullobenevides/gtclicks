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
  showPhotographer = true,
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
  const date =
    collection.dataInicio || collection.createdAt
      ? formatDateShort(collection.dataInicio || collection.createdAt)
      : null;

  const isFeatured = variant === "featured";
  const isCompact = variant === "compact";

  const aspectClass = "aspect-square md:aspect-[2/3]";
  const titleSize = isFeatured
    ? "text-text-2xl"
    : isCompact
      ? "text-text-base"
      : "text-text-xl";
  const padding = isCompact ? "p-space-4" : "p-space-6";

  const coverUrl = collection.cover || collection.capaUrl;
  const isGradient = coverUrl?.startsWith("linear-gradient");

  return (
    <Link href={`/colecoes/${collection.slug}`}>
      <Card
        className={cn(
          "group relative block overflow-hidden rounded-radius-xl bg-surface-subtle transition-all duration-300 hover:-translate-y-1 hover:shadow-shadow-card-hover border-0",
          aspectClass,
          className,
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
            <div className="h-full w-full bg-linear-to-br from-surface-elevated to-surface-section flex items-center justify-center">
              <ImageIconLucide className="h-12 w-12 text-surface-subtle" />
            </div>
          )}
        </div>

        {/* Overlay Gradient */}
        <div className="absolute inset-0 z-10 bg-linear-to-t from-surface-page/90 via-surface-page/40 to-transparent opacity-80" />

        {/* Badges */}
        {badges.length > 0 && (
          <div className="absolute top-space-4 right-space-4 flex gap-space-2 z-20">
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
                    ? "bg-status-success/90 hover:bg-status-success text-text-on-dark"
                    : badge.variant === "primary"
                      ? "bg-action-primary/90 hover:bg-action-primary text-text-on-brand"
                      : "bg-text-on-dark/90 hover:bg-text-on-dark text-black",
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
            padding,
          )}
        >
          <div className="mt-auto">
            <h3
              className={cn(
                "font-font-bold text-text-primary line-clamp-1 mb-space-1 drop-shadow-md group-hover:text-action-primary transition-colors",
                titleSize,
              )}
            >
              {collection.title ||
                collection.name ||
                collection.titulo ||
                "Sem título"}
            </h3>

            {showPhotographer &&
              (collection.photographer || collection.fotografo) && (
                <p className="text-text-xs text-text-secondary font-font-medium mb-space-2 opacity-90">
                  por{" "}
                  {collection.photographer?.name ||
                    collection.fotografo?.displayName ||
                    collection.fotografo?.username ||
                    "Autor"}
                </p>
              )}

            {showDescription && collection.description && !isCompact && (
              <p className="text-text-sm text-text-secondary line-clamp-1 mb-space-3 opacity-90">
                {collection.description}
              </p>
            )}

            {/* Price Display */}
            {showPrice &&
              collection.precoFoto &&
              Number(collection.precoFoto) > 0 && (
                <div className="mb-space-3">
                  <span className="text-text-lg font-font-bold text-text-primary">
                    R${" "}
                    {Number(collection.precoFoto).toFixed(2).replace(".", ",")}
                  </span>
                </div>
              )}

            <div className="flex items-center justify-between border-t border-border-subtle pt-space-3 mt-space-1">
              <span className="text-text-xs font-font-medium text-text-primary/70 bg-surface-subtle/40 px-space-2 py-space-1 rounded-radius-full backdrop-blur-sm flex items-center gap-space-1">
                <ImageIconLucide className="h-3 w-3" />
                {photoCount} {photoCount === 1 ? "foto" : "fotos"}
              </span>

              <div className="flex items-center gap-space-3">
                {showDate && date && (
                  <span className="text-text-xs text-text-muted font-font-medium flex items-center gap-space-1">
                    <Calendar className="h-3 w-3" />
                    {date}
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
