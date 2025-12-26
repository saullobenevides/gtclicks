"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import ImageWithFallback from "@/components/shared/ImageWithFallback";
import { ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/features/cart/context/CartContext";
import { useSelection } from "../context/SelectionContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function PhotoCard({ photo, priority = false }) {
  const { addToCart } = useCart();
  const { selectedIds, toggleSelection, isSelectionMode } = useSelection();

  const isSelected = selectedIds.has(photo.id);

  const handleQuickAdd = (e) => {
    e.preventDefault(); 
    e.stopPropagation();

    addToCart({
        fotoId: photo.id,
        colecaoId: photo.colecaoId,
        titulo: photo.title || photo.titulo || "Foto sem título",
        preco: photo.colecao?.precoFoto || photo.preco || 0,
        precoBase: photo.colecao?.precoFoto || photo.preco || 0,
        descontos: photo.colecao?.descontos || [],
        licenca: 'Uso Padrão',
        previewUrl: photo.previewUrl,
    });
    
    toast.success("Foto adicionada ao carrinho", {
        description: photo.title || photo.titulo,
        action: {
            label: "Ver Carrinho",
            onClick: () => window.location.href = "/carrinho"
        },
    });
  };

  const handleSelection = (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleSelection(photo.id);
  };

  return (
    <div className="relative group">
        <Link
        href={`/foto/${photo.id}`}
        className={cn(
            "block relative aspect-[4/5] overflow-hidden rounded-xl bg-muted transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10",
            isSelected ? "ring-4 ring-primary translate-y-[-4px] shadow-xl" : ""
        )}
        >
        <ImageWithFallback
            src={photo.previewUrl}
            alt={photo.titulo}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
            className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-110"
        />
        <div className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent",
             isSelected ? "opacity-60 bg-primary/20" : "opacity-80"
        )} />
        
        {/* Selection Checkbox */}
        <div className="absolute top-4 left-4 z-20">
            <button
                onClick={handleSelection}
                className={cn(
                    "h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 shadow-lg",
                    isSelected 
                        ? "bg-primary border-primary text-white scale-110" 
                        : "bg-black/40 border-white/50 text-transparent hover:bg-black/60 hover:border-white"
                )}
            >
                <Check className="h-5 w-5 stroke-[3]" />
            </button>
        </div>

        {/* Quick Add Button - Only show if not in selection mode or unchecked? 
            Actually keeps it useful. But maybe move it down slightly or keep it.
        */}
        <div className="absolute top-4 right-4 translate-y-0 opacity-100 z-10">
            <Button 
                size="icon" 
                className="rounded-full h-10 w-10 bg-white/90 text-black hover:bg-neutral-900 hover:text-white shadow-lg backdrop-blur-sm transition-colors"
                onClick={handleQuickAdd}
                title="Adicionar ao carrinho"
            >
                <ShoppingCart className="h-5 w-5" />
            </Button>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-4">
            <h3 className="font-bold text-white line-clamp-1 text-sm shadow-black/80 drop-shadow-md">{photo.title || photo.titulo || "Sem título"}</h3>
            <span className="text-xs text-gray-300 font-medium opacity-90">#{photo.id ? photo.id.slice(-4) : '...'}</span>
        </div>
        </Link>
    </div>
  );
}

