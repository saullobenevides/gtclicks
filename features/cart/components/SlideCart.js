"use client";

import { useCart } from "@/features/cart/context/CartContext";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
} from "@/components/ui/sheet";
import { Trash2, ShoppingCart } from "lucide-react";
import Link from "next/link";
import ImageWithFallback from "@/components/shared/ImageWithFallback";

export default function SlideCart() {
  const {
    items,
    removeFromCart,
    getTotalPrice,
    getSavings,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="flex w-full flex-col sm:max-w-md bg-black/95 border-l border-white/10 text-white backdrop-blur-xl">
        <SheetHeader className="border-b border-white/10 pb-4">
          <SheetTitle className="text-white flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Seu Carrinho ({items.length})
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Revise seus itens antes de finalizar.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center space-y-4 text-center text-muted-foreground">
              <ShoppingCart className="h-12 w-12 opacity-20" />
              <p>Seu carrinho está vazio.</p>
              <Button variant="link" onClick={() => setIsCartOpen(false)}>
                Continuar comprando
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.fotoId}
                  className="flex gap-4 border-b border-white/5 pb-4 last:border-0"
                >
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-white/10 bg-white/5">
                    <ImageWithFallback
                      src={item.previewUrl}
                      alt={item.titulo}
                      width={80}
                      height={80}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex justify-between gap-2">
                      <h4 className="font-medium line-clamp-2 text-sm">
                        {item.titulo}
                      </h4>
                      <p className="font-bold text-sm">
                        R$ {Number(item.preco).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {item.licenca}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.fotoId)}
                        className="h-6 w-6 text-muted-foreground hover:text-red-500 hover:bg-transparent"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <SheetFooter className="flex-col gap-4 border-t border-white/10 pt-4 sm:flex-col sm:space-x-0">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>R$ {getTotalPrice().toFixed(2)}</span>
            </div>
            {getSavings() > 0 && (
              <div className="flex justify-between text-sm font-medium text-green-400 bg-green-400/10 px-3 py-2 rounded-md animate-in fade-in slide-in-from-bottom-2">
                <span>Você economizou</span>
                <span>R$ {getSavings().toFixed(2)}</span>
              </div>
            )}
            <div className="grid gap-2">
              <Button
                asChild
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold"
                onClick={() => setIsCartOpen(false)}
              >
                <Link href="/checkout">Finalizar Compra</Link>
              </Button>
              <Button
                variant="secondary"
                className="w-full text-white"
                onClick={() => setIsCartOpen(false)}
              >
                <Link href="/carrinho">Ver Carrinho Completo</Link>
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
