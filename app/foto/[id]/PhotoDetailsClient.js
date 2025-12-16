'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useCart } from '@/components/CartContext';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import ImageWithFallback from '@/components/ImageWithFallback';
import { Heart, Share2, Info, CheckCircle2, ShoppingCart } from 'lucide-react';
import { useUser } from '@stackframe/stack';

export default function PhotoDetailsClient({ photo }) {
  const { addToCart } = useCart();
  const [addedToCart, setAddedToCart] = useState(false);
  
  const price = photo.colecao?.precoFoto || 0;

  const handleAddToCart = () => {
    addToCart({
      fotoId: photo.id,
      titulo: photo.titulo,
      preco: price,
      licenca: 'Uso Padrão', // Default license name
      previewUrl: photo.previewUrl,
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Background Blur Effect */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black" />
        <img src={photo.previewUrl} alt="" className="h-full w-full object-cover blur-3xl" />
      </div>

      <div className="container-wide relative z-10 grid grid-cols-1 gap-12 py-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
        {/* Left Column - Image */}
        <div className="flex flex-col gap-6">
          <div className="sticky top-24 overflow-hidden rounded-2xl border border-white/10 bg-black/50 shadow-2xl backdrop-blur-sm">
            <div className="relative aspect-[4/3] w-full">
              <ImageWithFallback
                src={photo.previewUrl}
                alt={photo.titulo}
                className="pointer-events-none block h-full w-full select-none object-contain"
                onContextMenu={(e) => e.preventDefault()}
              />
              <div
                className="pointer-events-none absolute inset-0 z-10 opacity-20"
                style={{
                  backgroundImage: 'url(/watermark-pattern.png)',
                  backgroundRepeat: 'repeat',
                }}
              />
            </div>
            <div className="flex items-center justify-between border-t border-white/10 bg-black/40 p-4 backdrop-blur-md">
              <div className="flex gap-4 text-sm font-medium text-white">
                <span className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  {photo.width} x {photo.height}px
                </span>
                <span className="text-white/20">|</span>
                <span>{photo.orientacao}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <Share2 className="h-4 w-4" />
                </Button>
                <LikeButton photoId={photo.id} initialLikes={photo.likes || 0} />
              </div>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            <MetadataItem label="Câmera" value={photo.camera} />
            <MetadataItem label="Lente" value={photo.lens} />
            <MetadataItem label="Distância Focal" value={photo.focalLength} />
            <MetadataItem label="ISO" value={photo.iso} />
            <MetadataItem label="Obturador" value={photo.shutterSpeed} />
            <MetadataItem label="Abertura" value={photo.aperture} />
          </div>
        </div>

        {/* Right Column - Details & Actions */}
        <div className="flex flex-col gap-8">
          <div>
            <div className="mb-4 flex flex-wrap gap-2">
              {photo.categoria && (
                <Badge variant="outline" className="border-primary/50 text-primary bg-primary/10">
                  {photo.categoria}
                </Badge>
              )}
              {photo.tags && (Array.isArray(photo.tags) ? photo.tags : photo.tags.split(',')).map((tag, i) => (
                <Badge key={i} variant="secondary" className="bg-white/10 text-white hover:bg-white/20">
                  {tag.trim()}
                </Badge>
              ))}
            </div>
            
            <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">{photo.titulo}</h1>
            
            {photo.descricao && (
              <p className="text-lg leading-relaxed text-gray-400">
                {photo.descricao}
              </p>
            )}
          </div>

          {/* Collection Card */}
          {photo.colecao && (
            <Link href={`/colecoes/${photo.colecao.slug}`}>
              <Card className="glass-panel border-white/10 bg-white/5 transition-all hover:bg-white/10">
                <CardHeader className="flex flex-row items-center gap-4 p-4">
                   <div className="h-12 w-12 flex items-center justify-center rounded bg-primary/20 text-primary">
                      <span className="text-xl">📚</span>
                   </div>
                  <div>
                    <CardTitle className="text-base text-white">{photo.colecao.nome}</CardTitle>
                    <CardDescription className="text-gray-400">Ver coleção completa</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          )}

          {/* Photographer Card */}
          {photo.fotografo && (
            <Link href={`/fotografo/${photo.fotografo.username}`}>
              <Card className="glass-panel border-white/10 bg-white/5 transition-all hover:bg-white/10">
                <CardHeader className="flex flex-row items-center gap-4 p-4">
                  <Avatar className="h-12 w-12 border-2 border-white/10">
                    <AvatarImage src={photo.fotografo.avatarUrl} alt={photo.fotografo.name} />
                    <AvatarFallback>{photo.fotografo.name?.charAt(0) || 'F'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base text-white">{photo.fotografo.name || photo.fotografo.username}</CardTitle>
                    <CardDescription className="text-gray-400">Ver perfil completo</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          )}

          {/* Price Card */}
          <Card className="glass-panel border-white/10 bg-black/40">
            <CardHeader>
              <CardTitle className="text-xl text-white">Valor da Foto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-primary">
                  R$ {Number(price).toFixed(2)}
                </span>
                <span className="text-muted-foreground mb-1 font-medium">/ unidade</span>
              </div>
              <p className="text-sm text-gray-400 mt-2">
                Licença de uso padrão incluída.
              </p>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col gap-4">
            <Button
              onClick={handleAddToCart}
              disabled={addedToCart}
              size="lg"
              className={`h-14 text-lg font-bold transition-all ${
                addedToCart 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-primary hover:bg-primary/90 text-white'
              }`}
            >
              {addedToCart ? (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6" />
                  Adicionado ao Carrinho!
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <ShoppingCart className="h-6 w-6" />
                  Adicionar ao Carrinho
                </span>
              )}
            </Button>
            
            {addedToCart && (
              <Button asChild variant="outline" size="lg" className="h-12 border-white/10 bg-white/5 text-white hover:bg-white/10">
                <Link href="/carrinho">Ir para o Carrinho</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetadataItem({ label, value }) {
  return (
    <div className="glass-panel flex flex-col items-center justify-center rounded-lg border border-white/10 bg-white/5 p-3 text-center">
      <span className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-white">{value || "-"}</span>
    </div>
  );
}



function LikeButton({ photoId, initialLikes }) {
  const user = useUser();
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false); 
  const [loading, setLoading] = useState(false);

  const toggleLike = async () => {
    if (!user) {
      alert("Você precisa estar logado para curtir esta foto.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/photos/${photoId}/like`, { method: 'POST' });
      const data = await res.json();
      if (data.liked !== undefined) {
        setLiked(data.liked);
        setLikes(prev => data.liked ? prev + 1 : prev - 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="ghost" size="sm" onClick={toggleLike} disabled={loading} className="gap-2 text-white hover:bg-white/10">
      <Heart
        className={`h-5 w-5 transition-colors ${liked ? "fill-red-500 text-red-500" : "text-white"}`}
      />
      <span className="font-medium">{likes}</span>
    </Button>
  );
}
