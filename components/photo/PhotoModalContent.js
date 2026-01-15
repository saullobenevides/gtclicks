import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/context/CartContext";
import { Badge } from "@/components/ui/badge";
import ImageWithFallback from "@/components/shared/ImageWithFallback";
import {
  ShoppingCart,
  CheckCircle2,
  Info,
  Heart,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useUser } from "@stackframe/stack";
import { useRouter } from "next/navigation";

export default function PhotoModalContent({ photo, onClose, onNext, onPrev }) {
  const { addToCart, setIsCartOpen } = useCart();
  const [addedToCart, setAddedToCart] = useState(false);

  const price = photo.colecao?.precoFoto || 0;

  useEffect(() => {
    const handleKeyDown = (e) => {
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
    addToCart({
      fotoId: photo.id,
      titulo: photo.numeroSequencial
        ? `Foto #${photo.numeroSequencial.toString().padStart(3, "0")}`
        : `Foto #${photo.id.replace(/\D/g, "").slice(-3)}`,
      preco: price,
      licenca: "Uso Padrão",
      previewUrl: photo.previewUrl,
    });

    setAddedToCart(true);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] h-full bg-zinc-950 text-white overflow-hidden rounded-lg relative">
      {/* Coluna da Imagem (Esquerda/Topo) */}
      <div className="relative bg-black flex items-center justify-center h-[50vh] md:h-full p-4 overflow-hidden group select-none">
        {/* Navigation Buttons */}
        {onPrev && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-50 rounded-full bg-black/50 text-white hover:bg-black/80 h-12 w-12 hidden md:flex"
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
        )}

        {onNext && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 rounded-full bg-black/50 text-white hover:bg-black/80 h-12 w-12 hidden md:flex"
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        )}

        <ImageWithFallback
          src={photo.previewUrl}
          alt={photo.titulo}
          className="w-full h-full"
          imageClassName="object-contain"
          onContextMenu={(e) => e.preventDefault()}
        />

        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 md:hidden z-50 bg-black/50 text-white hover:bg-black/70 rounded-full"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Coluna de Detalhes (Direita/Baixo) */}
      <div className="flex flex-col h-full overflow-y-auto border-l border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
        {/* Header do Modal */}
        <div className="p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900/95 z-20 backdrop-blur-md flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold leading-tight">
              {photo.numeroSequencial
                ? `Foto #${photo.numeroSequencial.toString().padStart(3, "0")}`
                : `Foto #${photo.id.replace(/\D/g, "").slice(-3)}`}
            </h2>
            <div className="flex items-center gap-2 mt-2 text-zinc-400 text-sm">
              <span>
                {photo.width} x {photo.height}px
              </span>
              <span>•</span>
              <span>{photo.orientacao}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hidden md:flex -mr-2 -mt-2 text-zinc-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="p-6 flex-1 flex flex-col gap-8">
          {/* Fotógrafo */}
          {photo.fotografo && (
            <div className="flex items-center gap-4 p-4 rounded-xl border border-zinc-800 hover:bg-zinc-800/50 transition-colors">
              <div className="h-10 w-10 rounded-full bg-zinc-700 flex items-center justify-center text-zinc-300 font-bold overflow-hidden">
                {photo.fotografo.image ? (
                  <img
                    src={photo.fotografo.image}
                    alt={photo.fotografo.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  photo.fotografo.name?.charAt(0)
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-zinc-400">Fotografado por</p>
                <p className="font-semibold text-white">
                  {photo.fotografo.name}
                </p>
              </div>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary/80"
              >
                <Link href={`/fotografo/${photo.fotografo.username}`}>
                  Ver perfil
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Footer de Ação (Sticky Bottom) */}
        <div className="p-6 border-t border-zinc-800 bg-zinc-900/95 backdrop-blur-md sticky bottom-0 z-20 mt-auto">
          <div className="flex items-center justify-between mb-4">
            <span className="text-zinc-400 text-sm">Preço unitário</span>
            <span className="text-3xl font-bold text-primary">
              R$ {Number(price).toFixed(2)}
            </span>
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={addedToCart}
            size="lg"
            className={`w-full h-14 text-lg font-bold shadow-lg shadow-primary/10 transition-all ${
              addedToCart
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-primary hover:bg-primary/90 text-white hover:scale-[1.02]"
            }`}
          >
            {addedToCart ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Adicionado ao Carrinho
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Adicionar ao Carrinho
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
