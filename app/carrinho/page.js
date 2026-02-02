"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/context/CartContext";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ImageWithFallback from "@/components/shared/ImageWithFallback";
import { Trash2, ShoppingCart, ArrowRight, ShieldCheck } from "lucide-react";

export default function CartPage() {
  const {
    items,
    removeFromCart,
    clearCart,
    getTotalPrice,
    getItemPrice,
    getSavings,
  } = useCart();
  const savings = getSavings();

  if (items.length === 0) {
    return (
      <div className="container-wide px-4 flex min-h-[60vh] flex-col items-center justify-center py-16 sm:py-24 text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10">
          <ShoppingCart className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="mb-2 text-3xl font-bold text-white">
          Seu carrinho está vazio
        </h1>
        <p className="mb-8 max-w-md text-muted-foreground">
          Explore nossa galeria de fotos exclusivas e encontre a imagem perfeita
          para o seu projeto.
        </p>
        <Button asChild size="lg" className="min-h-[48px] w-full sm:w-auto">
          <Link href="/busca">Explorar Fotos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-wide px-4 py-12 sm:py-16 md:py-24">
      <div className="mb-12">
        <h1 className="heading-display font-display text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
          Seu Carrinho
        </h1>
        <p className="text-lg text-muted-foreground">
          Revise seus itens antes de finalizar a compra.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:gap-12 lg:grid-cols-[1fr_400px]">
        {/* Cart Items List */}
        <div className="space-y-6">
          {items.map((item) => (
            <div
              key={`${item.fotoId}-${item.licencaId}`}
              className="glass-panel group relative flex flex-col gap-6 rounded-xl border border-white/10 bg-black/40 p-6 transition-all hover:border-white/20 sm:flex-row sm:items-center"
            >
              <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-lg sm:h-32 sm:w-48">
                <ImageWithFallback
                  src={item.previewUrl}
                  alt={item.titulo}
                  fill
                  className="transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="flex flex-1 flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white">
                    {item.titulo}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span>
                      Licença:{" "}
                      {typeof item.licenca === "object"
                        ? item.licenca.nome
                        : item.licenca}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-6 sm:justify-end">
                  <div className="flex flex-col items-end gap-1">
                    {Number(item.precoBase) > getItemPrice(item) && (
                      <span className="text-xs text-muted-foreground line-through">
                        R$ {Number(item.precoBase).toFixed(2)}
                      </span>
                    )}
                    <span className="text-xl font-bold text-white">
                      R$ {getItemPrice(item).toFixed(2)}
                    </span>
                    {Number(item.precoBase) > getItemPrice(item) && (
                      <span className="text-[10px] font-bold bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                        Desconto Aplicado
                      </span>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="min-h-11 min-w-11 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 touch-manipulation"
                    onClick={() => removeFromCart(item.fotoId, item.licencaId)}
                    aria-label={`Remover ${item.titulo} do carrinho`}
                  >
                    <Trash2 className="h-5 w-5" />
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
              <CardTitle className="text-xl text-white">
                Resumo do Pedido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal ({items.length} itens)</span>
                <span>
                  R${" "}
                  {items
                    .reduce((sum, i) => sum + Number(i.precoBase || i.preco), 0)
                    .toFixed(2)}
                </span>
              </div>
              {savings > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Economia Progressiva</span>
                  <span>- R$ {savings.toFixed(2)}</span>
                </div>
              )}

              {/* Progressive Discount Upsell */}
              {(() => {
                // Get items from first collection to check next discount tier
                const collectionItems = items.filter(
                  (i) => i.colecaoId === items[0]?.colecaoId
                );
                const count = collectionItems.length;
                const firstItem = collectionItems[0];

                if (firstItem?.descontos && firstItem.descontos.length > 0) {
                  // Find next applicable discount
                  const nextDiscount = firstItem.descontos
                    .filter((d) => d.min > count)
                    .sort((a, b) => a.min - b.min)[0];

                  if (nextDiscount) {
                    const photosNeeded = nextDiscount.min - count;
                    const currentPrice = getItemPrice(firstItem);
                    const savingsPerPhoto = currentPrice - nextDiscount.price;
                    const totalSavings = savingsPerPhoto * count;

                    return (
                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 animate-slide-up">
                        <p className="text-sm font-medium text-white mb-1">
                          🎉 Faltam {photosNeeded}{" "}
                          {photosNeeded === 1 ? "foto" : "fotos"} para
                          economizar mais!
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Adicione mais {photosNeeded} e economize R${" "}
                          {totalSavings.toFixed(2)}
                        </p>
                        <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{
                              width: `${(count / nextDiscount.min) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  }
                }
                return null;
              })()}

              <div className="my-4 h-px bg-white/10" />
              <div className="flex justify-between text-2xl font-bold text-white">
                <span>Total</span>
                <span>R$ {getTotalPrice().toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button
                asChild
                className="w-full font-bold min-h-[48px] h-12 text-base sm:text-lg touch-manipulation"
                size="lg"
              >
                <Link
                  href="/checkout"
                  className="flex items-center justify-center gap-2"
                >
                  Ir para Pagamento
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <div className="space-y-2 text-center">
                <p className="text-xs text-green-400 font-medium">
                  ⚡ Entrega automática e download imediato
                </p>
                <p className="text-xs text-muted-foreground">
                  Pagamento 100% seguro via Mercado Pago
                </p>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
