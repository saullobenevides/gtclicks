import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useCart } from '@/components/CartContext';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import ImageWithFallback from '@/components/ImageWithFallback';
import { Trash2, ShoppingCart, ArrowRight, ShieldCheck } from 'lucide-react';

export default function CartPage() {
  const { items, removeFromCart, clearCart, getTotalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="container-wide flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10">
          <ShoppingCart className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="mb-2 text-3xl font-bold text-white">Seu carrinho está vazio</h1>
        <p className="mb-8 max-w-md text-muted-foreground">
          Explore nossa galeria de fotos exclusivas e encontre a imagem perfeita para o seu projeto.
        </p>
        <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white">
          <Link href="/busca">Explorar Fotos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-wide py-16 md:py-24">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white">Seu Carrinho</h1>
        <p className="text-lg text-muted-foreground">
          Revise seus itens antes de finalizar a compra.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_400px]">
        {/* Cart Items List */}
        <div className="space-y-6">
          {items.map((item) => (
            <div 
              key={`${item.fotoId}-${item.licencaId}`}
              className="glass-panel group relative flex flex-col gap-6 rounded-xl border border-white/10 bg-black/40 p-6 transition-all hover:border-white/20 sm:flex-row sm:items-center"
            >
              <div className="relative aspect-video w-full overflow-hidden rounded-lg sm:w-48">
                <ImageWithFallback
                  src={item.previewUrl}
                  alt={item.titulo}
                  width={300}
                  height={200}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              
              <div className="flex flex-1 flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white">{item.titulo}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span>Licença: {item.licenca}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between gap-6 sm:justify-end">
                  <span className="text-xl font-bold text-white">
                    R$ {Number(item.preco).toFixed(2)}
                  </span>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
                    onClick={() => removeFromCart(item.fotoId, item.licencaId)}
                  >
                    <Trash2 className="h-5 w-5" />
                    <span className="sr-only">Remover</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          <div className="flex justify-end pt-4">
            <Button
              onClick={clearCart}
              variant="ghost"
              className="text-muted-foreground hover:text-white"
            >
              Limpar Carrinho
            </Button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="h-fit lg:sticky lg:top-24">
          <Card className="glass-panel border-white/10 bg-black/40">
            <CardHeader>
              <CardTitle className="text-xl text-white">Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal ({items.length} itens)</span>
                <span>R$ {getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="my-4 h-px bg-white/10" />
              <div className="flex justify-between text-2xl font-bold text-white">
                <span>Total</span>
                <span>R$ {getTotalPrice().toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button asChild className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 text-lg" size="lg">
                <Link href="/checkout" className="flex items-center justify-center gap-2">
                  Finalizar Compra
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Pagamento seguro via Mercado Pago
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
