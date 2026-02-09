"use client";

import { useContext } from "react";
import { SelectionContext } from "@/features/collections/context/SelectionContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ImageWithFallback from "@/components/shared/ImageWithFallback";
import { ShoppingCart, Check, Eye } from "lucide-react";
import { cn, formatCartItemTitle } from "@/lib/utils";
import { usePhotoModal } from "@/components/providers/PhotoModalProvider";

interface Photo {
  id: string;
  titulo?: string;
  previewUrl?: string | null;
  numeroSequencial?: number;
  colecao?: { nome?: string };
  [key: string]: unknown;
}

interface PhotoCardProps {
  photo: Photo;
  variant?: "default" | "compact" | "large" | "centered-hover";
  priority?: boolean;
  showSelection?: boolean;
  showQuickAdd?: boolean;
  customActions?: React.ReactNode;
  onAddToCart?: (photo: Photo) => void;
  onSelect?: (id: string) => void;
  isSelected?: boolean;
  className?: string;
  contextList?: Photo[];
}

/**
 * PhotoCard - Componente padronizado para exibir fotos
 */
export default function PhotoCard({
  photo,
  variant = "default",
  priority = false,
  showSelection = true,
  showQuickAdd = true,
  customActions,
  onAddToCart,
  onSelect: propOnSelect,
  isSelected: propIsSelected = false,
  className,
  contextList = [],
}: PhotoCardProps) {
  const { openPhoto } = usePhotoModal();
  const selectionContext = useContext(SelectionContext);

  const isSelected = propOnSelect
    ? propIsSelected
    : selectionContext?.selectedIds?.has(photo.id);
  const onSelect =
    propOnSelect || ((id: string) => selectionContext?.toggleSelection(id));

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(photo);
    }
  };

  const handleSelection = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onSelect) {
      onSelect(photo.id);
    }
  };

  const handleOpenModal = (e: React.MouseEvent) => {
    e.preventDefault();
    openPhoto(photo, contextList);
  };

  const displayTitle = formatCartItemTitle({
    collectionName: photo.colecao?.nome,
    numeroSequencial: photo.numeroSequencial,
    photoId: photo.id || "",
  });

  const aspectClass = "aspect-square md:aspect-[2/3]";
  const textSize =
    variant === "compact"
      ? "text-xs"
      : variant === "large"
      ? "text-base"
      : "text-sm";

  return (
    <div
      className={cn("relative group cursor-pointer", className)}
      data-testid="photo-card"
      data-photo-id={photo.id}
      onClick={handleOpenModal}
    >
      <Card
        className={cn(
          "relative overflow-hidden rounded-radius-xl bg-surface-card transition-all duration-300 hover:-translate-y-1 hover:shadow-shadow-card-hover border border-border-subtle",
          aspectClass,
          isSelected
            ? "border-action-primary border-4 translate-y-[-4px] shadow-shadow-lg"
            : ""
        )}
        aria-label={`Ver detalhes de ${displayTitle}`}
      >
        <ImageWithFallback
          src={photo.previewUrl ?? undefined}
          alt={`${displayTitle} - GTClicks`}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priority}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        <div
          className={cn(
            "absolute inset-0 bg-linear-to-t from-surface-page/90 via-surface-page/40 to-transparent",
            isSelected ? "opacity-60 bg-action-primary/20" : "opacity-80",
            variant === "centered-hover"
              ? "opacity-0 group-hover:opacity-40 transition-opacity duration-300 bg-surface-page"
              : ""
          )}
        />

        {variant === "centered-hover" && (
          <>
            <div className="absolute inset-0 hidden md:flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 scale-90 group-hover:scale-100">
              <Button
                size="icon"
                className="h-12 w-12 rounded-radius-lg bg-surface-subtle/50 backdrop-blur-md border border-action-primary/20 hover:bg-surface-page hover:text-text-primary text-text-primary transition-all duration-200 shadow-shadow-md"
                onClick={handleOpenModal}
                title="Ver detalhes"
              >
                <Eye className="h-6 w-6" />
              </Button>

              {showSelection && (
                <Button
                  size="icon"
                  className={cn(
                    "h-12 w-12 rounded-radius-lg backdrop-blur-md border transition-all duration-200 shadow-shadow-md",
                    isSelected
                      ? "bg-action-primary border-action-primary text-text-on-brand shadow-action-primary/30 scale-105"
                      : "bg-surface-subtle/50 border-action-primary/20 text-text-primary hover:bg-surface-page hover:text-text-primary"
                  )}
                  onClick={handleSelection}
                  title={
                    isSelected
                      ? "Remover da seleção"
                      : "Selecionar para comprar"
                  }
                >
                  {isSelected ? (
                    <Check className="h-6 w-6 stroke-3" />
                  ) : (
                    <ShoppingCart className="h-6 w-6" />
                  )}
                </Button>
              )}
            </div>

            <div className="absolute top-1 right-1 z-30 md:hidden">
              {showSelection && (
                <Button
                  size="icon"
                  className={cn(
                    "h-11 w-11 rounded-radius-full backdrop-blur-md border transition-all duration-200 shadow-shadow-sm",
                    isSelected
                      ? "bg-action-primary border-action-primary text-text-on-brand shadow-action-primary/30"
                      : "bg-surface-subtle/20 border-action-primary/20 text-text-primary"
                  )}
                  onClick={handleSelection}
                  title={
                    isSelected
                      ? "Remover da seleção"
                      : "Selecionar para comprar"
                  }
                >
                  {isSelected ? (
                    <Check className="h-5 w-5 stroke-3" />
                  ) : (
                    <ShoppingCart className="h-5 w-5" />
                  )}
                </Button>
              )}
            </div>
          </>
        )}

        {showSelection && variant !== "centered-hover" && (
          <div
            className={cn(
              "absolute top-4 left-4 z-30 transition-all duration-200",
              !isSelected ? "opacity-100" : "opacity-100"
            )}
          >
            <button
              onClick={handleSelection}
              className={cn(
                "h-8 w-8 rounded-radius-full border-2 flex items-center justify-center transition-all duration-200 shadow-shadow-md backdrop-blur-sm z-50",
                isSelected
                  ? "bg-surface-elevated border-surface-elevated text-text-primary scale-110 shadow-shadow-sm"
                  : "bg-surface-page/50 border-border-default text-text-secondary hover:bg-surface-page/80 hover:border-text-primary hover:text-text-primary hover:scale-105"
              )}
              aria-label={isSelected ? "Desselecionar foto" : "Selecionar foto"}
              aria-pressed={isSelected}
            >
              <Check className="h-4 w-4 stroke-4" />
            </button>
          </div>
        )}

        {variant !== "centered-hover" && (
          <div className="absolute top-4 right-4 translate-y-0 opacity-100 z-10 flex gap-2">
            {showQuickAdd && onAddToCart && (
              <Button
                size="icon"
                className="rounded-radius-full h-10 w-10 bg-surface-page/90 text-text-primary hover:bg-surface-elevated hover:text-text-primary shadow-shadow-md backdrop-blur-sm transition-colors"
                onClick={handleQuickAdd}
                title="Adicionar ao carrinho"
                aria-label="Adicionar ao carrinho"
              >
                <ShoppingCart className="h-5 w-5" />
              </Button>
            )}
            {customActions}
          </div>
        )}

        <div className="absolute bottom-0 left-0 w-full p-4 pointer-events-none">
          <h3
            className={cn(
              "font-bold text-white line-clamp-1 shadow-black/80 drop-shadow-md",
              textSize,
              variant === "centered-hover"
                ? "opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                : ""
            )}
          >
            {displayTitle}
          </h3>
        </div>
      </Card>
    </div>
  );
}
