'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useCart } from '@/features/cart/context/CartContext';
import { Badge } from '@/components/ui/badge';
import ImageWithFallback from '@/components/shared/ImageWithFallback';
import { ShoppingCart, CheckCircle2, X, ChevronLeft, ChevronRight, Camera, Aperture, Maximize2 } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function PhotoModalContent({ photo, onClose, onNext, onPrev }) {
  const { addToCart } = useCart();
  const [addedToCart, setAddedToCart] = useState(false);
  
  const price = photo.colecao?.precoFoto || 0;

  useEffect(() => {
    const handleKeyDown = (e) => {
        if (e.key === 'ArrowRight' && onNext) {
            onNext();
        } else if (e.key === 'ArrowLeft' && onPrev) {
            onPrev();
        } else if (e.key === 'Escape' && onClose) {
            onClose();
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onPrev, onClose]);

  const handleAddToCart = () => {
    addToCart({
      fotoId: photo.id,
      titulo: photo.numeroSequencial 
        ? `Foto #${photo.numeroSequencial.toString().padStart(3, '0')}` 
        : `Foto #${photo.id.replace(/\D/g, '').slice(-3)}`,
      preco: price,
      licenca: 'Uso Padrão',
      previewUrl: photo.previewUrl,
    });

    setAddedToCart(true);
  };

  const displayName = photo.numeroSequencial 
    ? `Foto #${photo.numeroSequencial.toString().padStart(3, '0')}` 
    : `Foto #${photo.id.replace(/\D/g, '').slice(-3)}`;

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-black text-white overflow-hidden rounded-xl border border-white/10 shadow-2xl animate-fade-in relative">
      
      {/* --- ESQUERDA: CANVAS DA IMAGEM --- */}
      <div className="relative flex-1 bg-zinc-950/50 flex items-center justify-center overflow-hidden group select-none relative">
        
        {/* Background Pattern */}
        <div 
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)',
                backgroundSize: '40px 40px'
            }}
        />

        {/* Botão Fechar Mobile (Flutuante) */}
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="absolute top-4 right-4 md:hidden z-50 bg-black/40 text-white hover:bg-black/60 backdrop-blur-md rounded-full border border-white/10"
        >
            <X className="h-5 w-5" />
        </Button>

        {/* Navegação */}
        {onPrev && (
            <button
                onClick={(e) => { e.stopPropagation(); onPrev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-black/20 text-white/70 hover:text-white hover:bg-black/60 hover:scale-110 transition-all backdrop-blur-sm border border-white/5 hidden md:flex items-center justify-center group/nav"
            >
                <ChevronLeft className="h-8 w-8 group-hover/nav:-translate-x-0.5 transition-transform" />
            </button>
        )}

        {onNext && (
            <button
                onClick={(e) => { e.stopPropagation(); onNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-black/20 text-white/70 hover:text-white hover:bg-black/60 hover:scale-110 transition-all backdrop-blur-sm border border-white/5 hidden md:flex items-center justify-center group/nav"
            >
                <ChevronRight className="h-8 w-8 group-hover/nav:translate-x-0.5 transition-transform" />
            </button>
        )}

        {/* A Imagem */}
        <div className="relative w-full h-[50vh] md:h-full p-2 md:p-12 transition-all duration-500 ease-out">
            <ImageWithFallback
            src={photo.previewUrl}
            alt={displayName}
            className="w-full h-full"
            imageClassName="object-contain drop-shadow-2xl"
            onContextMenu={(e) => e.preventDefault()}
            />
        </div>
      </div>

      {/* --- DIREITA: SIDEBAR DE DETALHES --- */}
      <div className="w-full md:w-[400px] lg:w-[450px] bg-zinc-900/80 backdrop-blur-xl border-l border-white/10 flex flex-col h-full z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.3)]">
        
        {/* Header da Sidebar */}
        <div className="p-6 md:p-8 border-b border-white/5 flex justify-between items-start shrink-0">
            <div>
                <Badge variant="outline" className="mb-3 border-white/20 text-zinc-400 font-normal tracking-wider text-[10px] uppercase bg-white/5">
                    {photo.categoria || "Fotografia"}
                </Badge>
                <h2 className="text-3xl font-bold tracking-tight text-white">{displayName}</h2>
                <div className="flex items-center gap-3 mt-2 text-zinc-500 text-xs font-medium uppercase tracking-wide">
                    <span className="flex items-center gap-1">
                        <Maximize2 className="h-3 w-3" /> {photo.width} x {photo.height}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-zinc-700" />
                    <span>{photo.orientacao}</span>
                </div>
            </div>
            
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose}
                className="hidden md:flex text-zinc-500 hover:text-white hover:bg-white/10 rounded-full -mr-2 -mt-2 transition-colors"
            >
                <X className="h-6 w-6" />
            </Button>
        </div>

        {/* Corpo da Sidebar (Scrollável) */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            
            {/* Seção Fotógrafo */}
            {photo.fotografo && (
                <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Fotógrafo</h3>
                    <Link 
                        href={`/fotografo/${photo.fotografo.username}`}
                        className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all group"
                    >
                        <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold overflow-hidden border-2 border-transparent group-hover:border-primary/50 transition-colors">
                            {photo.fotografo.image ? (
                                <img src={photo.fotografo.image} alt={photo.fotografo.name} className="h-full w-full object-cover" />
                            ) : (
                                photo.fotografo.name?.charAt(0)
                            )}
                        </div>
                        <div>
                            <p className="font-bold text-white text-base group-hover:text-primary transition-colors">{photo.fotografo.name}</p>
                            <p className="text-xs text-zinc-400">@{photo.fotografo.username}</p>
                        </div>
                    </Link>
                </div>
            )}

            {/* Tags (se houver) */}
            {photo.tags && photo.tags.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                        {(Array.isArray(photo.tags) ? photo.tags : photo.tags.split(',')).map((tag, i) => (
                            <span key={i} className="px-3 py-1 rounded-full bg-zinc-950 border border-white/10 text-zinc-400 text-xs hover:text-white hover:border-white/30 transition-colors cursor-default">
                                #{tag.trim()}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Metadados Técnicos */}
            {(photo.camera || photo.lens || photo.iso) && (
                <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Dados Técnicos</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <MetadataItem icon={Camera} label="Câmera" value={photo.camera} />
                        <MetadataItem icon={Aperture} label="Lente" value={photo.lens} />
                        <MetadataItem label="ISO" value={photo.iso} />
                        <MetadataItem label="Abertura" value={photo.aperture} />
                    </div>
                </div>
            )}
        </div>

        {/* Footer da Sidebar (Ação Principal) */}
        <div className="p-6 md:p-8 border-t border-white/10 bg-zinc-950/50 backdrop-blur-md mt-auto">
            <div className="flex items-end justify-between mb-6">
                <div>
                    <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-1">Preço unitário</p>
                    <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Disponível agora
                    </p>
                </div>
                <div className="text-right">
                    <span className="text-4xl font-black text-white tracking-tight">R$ {Number(price).toFixed(2)}</span>
                </div>
            </div>
            
            <Button
              onClick={handleAddToCart}
              disabled={addedToCart}
              size="lg"
              className={cn(
                "w-full h-14 text-base font-bold shadow-xl transition-all duration-300 rounded-xl",
                addedToCart 
                  ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 cursor-default' 
                  : 'bg-primary hover:bg-primary/90 text-white hover:scale-[1.02] hover:shadow-primary/25'
              )}
            >
              {addedToCart ? (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  No Carrinho
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

function MetadataItem({ icon: Icon, label, value }) {
    if (!value) return null;
    return (
        <div className="flex flex-col p-3 rounded-lg bg-white/5 border border-white/5">
            <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider mb-1 flex items-center gap-1">
                {Icon && <Icon className="h-3 w-3" />}
                {label}
            </span>
            <span className="text-zinc-300 font-medium text-sm truncate" title={value}>{value}</span>
        </div>
    )
}
