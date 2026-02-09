"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/context/CartContext";
import { toast } from "sonner";
import ImageWithFallback from "@/components/shared/ImageWithFallback";
import {
  ShoppingCart,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ShareButton from "@/components/shared/actions/ShareButton";
import LikeButton from "@/components/shared/actions/LikeButton";
import { LICENSE_MVP_LABEL } from "@/lib/constants";
import { formatCartItemTitle } from "@/lib/utils";

interface Photo {
  id: string;
  previewUrl?: string | null;
  numeroSequencial?: number;
  colecaoId?: string;
  colecao?: {
    id?: string;
    nome?: string;
    precoFoto?: number;
    descontos?: unknown[];
  };
  preco?: number;
  likes?: number;
  [key: string]: unknown;
}

interface PhotoModalContentProps {
  photo: Photo;
  onClose: () => void;
  onNext?: (() => void) | null;
  onPrev?: (() => void) | null;
}

export default function PhotoModalContent({
  photo,
  onClose,
  onNext,
  onPrev,
}: PhotoModalContentProps) {
  const { items, addToCart } = useCart();
  const isAdded = items.some((i) => i.fotoId === photo.id);

  const price = photo.colecao?.precoFoto ?? photo.preco ?? 0;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && onNext) {
        onNext();
      } else if (e.key === "ArrowLeft" && onPrev) {
        onPrev();
      } else if (e.key === "Escape" && onClose) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onNext, onPrev, onClose]);

  const handleAddToCart = () => {
    const titulo = formatCartItemTitle({
      collectionName: photo.colecao?.nome,
      numeroSequencial: photo.numeroSequencial,
      photoId: photo.id,
    });
    addToCart({
      fotoId: photo.id,
      colecaoId: photo.colecaoId || photo.colecao?.id,
      titulo,
      preco: price,
      precoBase: price,
      descontos: photo.colecao?.descontos || [],
      licenca: LICENSE_MVP_LABEL,
      previewUrl: photo.previewUrl,
    });
    toast.success("Adicionado ao carrinho", {
      description: titulo,
    });
  };

  const displayName = formatCartItemTitle({
    collectionName: photo.colecao?.nome,
    numeroSequencial: photo.numeroSequencial,
    photoId: photo.id,
  });

  return (
    <div className="relative h-full w-full bg-black flex items-center justify-center overflow-hidden animate-fade-in group/modal">
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      <div
        className="absolute top-4 right-4 z-50 flex items-center gap-2"
        style={{ top: "max(1rem, env(safe-area-inset-top))" }}
      >
        <LikeButton
          photoId={photo.id}
          likesCount={photo.likes ?? 0}
          className="bg-black/40 text-white hover:bg-black/60 hover:text-white backdrop-blur-md rounded-full border border-white/10 min-h-11 min-w-11 h-11 w-11 md:h-12 md:w-12 shrink-0 p-0"
        />
        <ShareButton
          title="Foto GTClicks"
          text="Olha essa foto incrível!"
          variant="ghost"
          className="bg-black/40 text-white hover:bg-black/60 backdrop-blur-md rounded-full border border-white/10 min-h-11 min-w-11 h-11 w-11 md:h-12 md:w-12 shrink-0"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="bg-black/40 text-white hover:bg-black/60 backdrop-blur-md rounded-full border border-white/10 min-h-11 min-w-11 h-11 w-11 md:h-12 md:w-12 shrink-0"
          aria-label="Fechar"
        >
          <X className="h-5 w-5 md:h-6 md:w-6" />
        </Button>
      </div>

      {onPrev && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 z-40 min-h-11 min-w-11 h-11 w-11 md:h-14 md:w-14 p-0 rounded-full bg-black/20 text-white/70 hover:text-white hover:bg-black/60 active:scale-95 transition-all backdrop-blur-sm border border-white/5 flex items-center justify-center group/nav touch-manipulation"
          aria-label="Foto anterior"
        >
          <ChevronLeft className="h-6 w-6 md:h-8 md:w-8 group-hover/nav:-translate-x-0.5 transition-transform" />
        </button>
      )}

      {onNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 z-40 min-h-11 min-w-11 h-11 w-11 md:h-14 md:w-14 p-0 rounded-full bg-black/20 text-white/70 hover:text-white hover:bg-black/60 active:scale-95 transition-all backdrop-blur-sm border border-white/5 flex items-center justify-center group/nav touch-manipulation"
          aria-label="Próxima foto"
        >
          <ChevronRight className="h-6 w-6 md:h-8 md:w-8 group-hover/nav:translate-x-0.5 transition-transform" />
        </button>
      )}

      <div
        className="relative w-full h-full flex items-center justify-center p-0 md:p-8 transition-all duration-500 ease-out"
        onContextMenu={(e) => e.preventDefault()}
      >
        <ImageWithFallback
          src={photo.previewUrl ?? undefined}
          alt={displayName}
          className="w-full h-full"
          imageClassName="object-contain drop-shadow-2xl"
        />
      </div>

      <div
        className="absolute bottom-4 md:bottom-10 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3 sm:gap-4 w-[90%] max-w-md md:w-auto px-2"
        style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        <div className="bg-black/60 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full flex items-center gap-3 shadow-xl">
          <span className="text-white/90 text-sm font-medium">
            {displayName}
          </span>
          <span className="w-1 h-1 bg-white/30 rounded-full" />
          <span className="text-white font-bold text-sm">
            R$ {Number(price).toFixed(2)}
          </span>
        </div>

        <Button
          onClick={handleAddToCart}
          disabled={isAdded}
          size="lg"
          className={cn(
            "min-h-[48px] h-14 w-full sm:w-auto px-8 md:px-12 text-base sm:text-lg font-bold shadow-[0_8px_30px_rgb(0,0,0,0.5)] transition-all duration-300 rounded-full border border-white/10 backdrop-blur-sm touch-manipulation active:scale-[0.98]",
            isAdded
              ? "bg-zinc-800/90 text-zinc-300 hover:bg-zinc-800 cursor-default"
              : "bg-primary hover:bg-action-primary-hover text-white hover:scale-105 shadow-button-primary hover:shadow-card"
          )}
        >
          {isAdded ? (
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              No Carrinho
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Adicionar
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
