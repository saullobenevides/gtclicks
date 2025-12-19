"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import ImageWithFallback from "@/components/ImageWithFallback";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/components/CartContext";
import { toast } from "sonner";

export default function PhotoCard({ photo, priority = false }) {
  const { addToCart } = useCart();

  const handleQuickAdd = (e) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();

    addToCart({
        fotoId: photo.id,
        titulo: photo.title || photo.titulo || "Foto sem título",
        preco: photo.colecao?.precoFoto || 0,
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

  return (
    <Link
      href={`/foto/${photo.id}`}
      className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-muted transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10"
    >
      <ImageWithFallback
        src={photo.previewUrl}
        alt={photo.titulo}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        priority={priority}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80" />
      
      {/* Quick Add Button */}
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
  );
}
