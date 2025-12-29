"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ImageWithFallback from "@/components/shared/ImageWithFallback";
import { ShoppingCart, Check, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

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
 */
export default function PhotoCard({ 
  photo,
  variant = 'default',
  priority = false,
  showSelection = true,
  showQuickAdd = true,
  customActions,
  onAddToCart,
  onSelect,
  isSelected = false,
  className
}) {
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

  const aspectClass = 'aspect-square'; // Sempre 1:1
  const textSize = variant === 'compact' ? 'text-xs' : variant === 'large' ? 'text-base' : 'text-sm';

  return (
    <div 
      className={cn("relative group", className)}
      data-testid="photo-card"
      data-photo-id={photo.id}
    >
      <Link href={`/foto/${photo.id}`}>
        <Card
          className={cn(
            "relative overflow-hidden rounded-xl bg-muted transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10 border-0",
            aspectClass,
            isSelected ? "ring-4 ring-primary translate-y-[-4px] shadow-xl" : ""
          )}
          aria-label={`Ver detalhes de ${photo.titulo || 'foto'}`}
        >
          <ImageWithFallback
            src={photo.previewUrl}
            alt={photo.titulo || 'Foto'}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Gradient Overlay */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent",
            isSelected ? "opacity-60 bg-primary/20" : "opacity-80"
          )} />
          
          {/* Selection Checkbox */}
          {showSelection && (
            <div className="absolute top-4 left-4 z-20">
              <button
                onClick={handleSelection}
                className={cn(
                  "h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 shadow-lg",
                  isSelected 
                    ? "bg-primary border-primary text-white scale-110" 
                    : "bg-black/40 border-white/50 text-transparent hover:bg-black/60 hover:border-white"
                )}
                aria-label={isSelected ? "Desselecionar foto" : "Selecionar foto"}
                aria-pressed={isSelected}
              >
                <Check className="h-5 w-5 stroke-[3]" />
              </button>
            </div>
          )}

          {/* Quick Actions */}
          <div className="absolute top-4 right-4 translate-y-0 opacity-100 z-10 flex gap-2">
            {showQuickAdd && onAddToCart && (
              <Button 
                size="icon" 
                className="rounded-full h-10 w-10 bg-white/90 text-black hover:bg-neutral-900 hover:text-white shadow-lg backdrop-blur-sm transition-colors"
                onClick={handleQuickAdd}
                title="Adicionar ao carrinho"
                aria-label="Adicionar ao carrinho"
              >
                <ShoppingCart className="h-5 w-5" />
              </Button>
            )}
            {customActions}
          </div>

          {/* Photo Info */}
          <div className="absolute bottom-0 left-0 w-full p-4">
            <h3 className={cn(
              "font-bold text-white line-clamp-1 shadow-black/80 drop-shadow-md",
              textSize
            )}>
              {photo.title || photo.titulo || "Sem título"}
            </h3>
            <span className="text-xs text-gray-300 font-medium opacity-90">
              #{photo.id ? photo.id.slice(-4) : '...'}
            </span>
          </div>
        </Card>
      </Link>
    </div>
  );
}
