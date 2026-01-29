"use client";

import { useContext } from "react";
import { SelectionContext } from "@/features/collections/context/SelectionContext";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ImageWithFallback from "@/components/shared/ImageWithFallback";
import { ShoppingCart, Check, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePhotoModal } from "@/components/providers/PhotoModalProvider";

/**
 * PhotoCard - Componente padronizado para exibir fotos
 *
 * @param {Object} props
 * @param {Object} props.photo - Objeto da foto com id, titulo, previewUrl, etc
 * @param {'default'|'compact'|'large'} props.variant - Variante visual do card
 * @param {boolean} props.priority - Se a imagem deve ter loading prioritário
 * @param {boolean} props.showSelection - Se deve mostrar checkbox de seleção
 * @param {boolean} props.showQuickAdd - Se deve mostrar botão de adicionar rápido
 * @param {React.ReactNode} props.customActions - Ações customizadas no card
 * @param {Function} props.onAddToCart - Callback ao adicionar no carrinho
 * @param {Function} props.onSelect - Callback ao selecionar foto
 * @param {boolean} props.isSelected - Se a foto está selecionada
 * @param {string} props.className - Classes CSS adicionais
 * @param {Array} props.contextList - Lista de fotos para navegação no modal
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
}) {
  const { openPhoto } = usePhotoModal();
  const selectionContext = useContext(SelectionContext);

  // Derived state: Use props if provided, otherwise fallback to context
  const isSelected = propOnSelect
    ? propIsSelected
    : selectionContext?.selectedIds?.has(photo.id);
  const onSelect =
    propOnSelect || ((id) => selectionContext?.toggleSelection(id));

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (onAddToCart) {
      onAddToCart(photo);
    }
  };

  const handleSelection = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (onSelect) {
      onSelect(photo.id);
    }
  };

  const handleOpenModal = (e) => {
    e.preventDefault();
    openPhoto(photo, contextList);
  };

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
            : "",
        )}
        aria-label={`Ver detalhes de ${photo.titulo || "foto"}`}
      >
        <ImageWithFallback
          src={photo.previewUrl}
          alt={
            photo.titulo && photo.titulo !== "Foto"
              ? `${photo.titulo} - GTClicks`
              : `Foto Esportiva #${photo.numeroSequencial || photo.id.slice(-4)} - GTClicks Marketplace`
          }
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priority}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Gradient Overlay */}
        <div
          className={cn(
            "absolute inset-0 bg-linear-to-t from-surface-page/90 via-surface-page/40 to-transparent",
            isSelected ? "opacity-60 bg-action-primary/20" : "opacity-80",
            variant === "centered-hover"
              ? "opacity-0 group-hover:opacity-40 transition-opacity duration-300 bg-surface-page"
              : "",
          )}
        />

        {/* Variant: Centered Hover Actions (New) */}
        {variant === "centered-hover" && (
          <>
            {/* Desktop: Centered Hover Actions */}
            <div className="absolute inset-0 hidden md:flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 scale-90 group-hover:scale-100">
              <Button
                size="icon"
                className="h-12 w-12 rounded-radius-lg bg-surface-subtle/50 backdrop-blur-md border border-action-primary/20 hover:bg-surface-page hover:text-text-primary text-text-primary transition-all duration-200 shadow-shadow-md"
                onClick={handleOpenModal}
                title="Ver detalhes"
              >
                <Eye className="h-6 w-6" />
              </Button>

              {/* Selection Button (Styled as Cart) */}
              {showSelection && (
                <Button
                  size="icon"
                  className={cn(
                    "h-12 w-12 rounded-radius-lg backdrop-blur-md border transition-all duration-200 shadow-shadow-md",
                    isSelected
                      ? "bg-action-primary border-action-primary text-text-on-brand shadow-action-primary/30 scale-105"
                      : "bg-surface-subtle/50 border-action-primary/20 text-text-primary hover:bg-surface-page hover:text-text-primary",
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

            {/* Mobile: Corner Action (Always Visible) */}
            <div className="absolute top-1 right-1 z-30 md:hidden">
              {showSelection && (
                <Button
                  size="icon"
                  className={cn(
                    "h-11 w-11 rounded-radius-full backdrop-blur-md border transition-all duration-200 shadow-shadow-sm",
                    isSelected
                      ? "bg-action-primary border-action-primary text-text-on-brand shadow-action-primary/30"
                      : "bg-surface-subtle/20 border-action-primary/20 text-text-primary",
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

        {/* Selection Checkbox (Only for non-centered-hover) */}
        {showSelection && variant !== "centered-hover" && (
          <div
            className={cn(
              "absolute top-4 left-4 z-30 transition-all duration-200",
              !isSelected ? "opacity-100" : "opacity-100",
            )}
          >
            <button
              onClick={handleSelection}
              className={cn(
                "h-8 w-8 rounded-radius-full border-2 flex items-center justify-center transition-all duration-200 shadow-shadow-md backdrop-blur-sm z-50",
                isSelected
                  ? "bg-surface-elevated border-surface-elevated text-text-primary scale-110 shadow-shadow-sm"
                  : "bg-surface-page/50 border-border-default text-text-secondary hover:bg-surface-page/80 hover:border-text-primary hover:text-text-primary hover:scale-105",
              )}
              aria-label={isSelected ? "Desselecionar foto" : "Selecionar foto"}
              aria-pressed={isSelected}
            >
              <Check className="h-4 w-4 stroke-4" />
            </button>
          </div>
        )}

        {/* Default Quick Actions (Hide if centered-hover) */}
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

        {/* Photo Info (Always visible, simpler for centered-hover?) */}
        <div className="absolute bottom-0 left-0 w-full p-4 pointer-events-none">
          {/* Hide text in centered-hover unless hovered? Or keep it? keeping it for now but maybe lighter */}
          <h3
            className={cn(
              "font-bold text-white line-clamp-1 shadow-black/80 drop-shadow-md",
              textSize,
              variant === "centered-hover"
                ? "opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                : "",
            )}
          >
            {photo.numeroSequencial
              ? `Foto #${photo.numeroSequencial.toString().padStart(3, "0")}`
              : `Foto #${
                  photo.id ? photo.id.replace(/\D/g, "").slice(-3) : "..."
                }`}
          </h3>
        </div>
      </Card>
    </div>
  );
}
