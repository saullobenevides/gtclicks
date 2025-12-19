'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@stackframe/stack';
import { useCart } from '@/components/CartContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const user = useUser();
  const { items, getTotalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (items.length === 0) {
      router.push('/carrinho');
    }
  }, [items, router]);

  const handleCheckout = async () => {
    if (!user) {
      router.push('/login?redirect=/checkout');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create order in database
      const orderResponse = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clienteId: user.id,
          itens: items.map((item) => ({
            fotoId: item.fotoId,
            licencaId: item.licencaId,
            precoUnitario: item.preco,
          })),
          total: getTotalPrice(),
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || 'Erro ao criar pedido');
      }

      const orderData = await orderResponse.json();
      const pedidoId = orderData.data.id;

      // Create Mercado Pago preference
      const payerEmail = user.email || user.primaryEmail || "cliente@gtclicks.com";
      console.log("Preparing MP Preference for:", payerEmail);
      
      const mpResponse = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pedidoId,
          items: items.map((item) => ({
            title: item.titulo,
            quantity: 1,
            unit_price: Number(item.preco),
            currency_id: 'BRL',
          })),
          payer: {
            email: payerEmail,
            name: (user.name || "Cliente GTClicks").split(" ")[0],
            surname: (user.name || "").split(" ").slice(1).join(" ") || "Teste",
          },
        }),
      });

      if (!mpResponse.ok) {
        const errorData = await mpResponse.json();
        throw new Error(errorData.error || 'Erro ao criar pagamento');
      }

      const mpData = await mpResponse.json();

      clearCart();
      window.location.href = mpData.init_point;
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="container mx-auto py-16">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold">Finalizar Compra</h1>
        <p className="text-lg text-muted-foreground">
          Revise seu pedido e prossiga para o pagamento
        </p>
      </div>

      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-12 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Resumo do Pedido</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {items.map((item) => (
              <div
                key={`${item.fotoId}-${item.licencaId}`}
                className="flex items-center justify-between border-b pb-4"
              >
                <div>
                  <h4 className="font-semibold">{item.titulo}</h4>
                  <p className="text-sm text-muted-foreground">
                    {item.licenca}
                  </p>
                </div>
                <div className="font-medium">
                  R$ {Number(item.preco).toFixed(2)}
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="text-xl font-bold">
            <div className="flex w-full justify-between">
              <span>Total</span>
              <span>R$ {getTotalPrice().toFixed(2)}</span>
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-muted-foreground">
              Você será redirecionado para o Mercado Pago para completar o
              pagamento de forma segura. Aceitamos cartão de crédito, débito e
              PIX.
            </p>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro no Checkout</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex flex-col items-stretch">
            <Button
              onClick={handleCheckout}
              disabled={loading || !user}
              size="lg"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Processando...' : 'Ir para Pagamento'}
            </Button>

            {!user && (
              <p className="mt-4 text-center text-sm text-muted-foreground">
                <a href="/login?redirect=/checkout" className="underline">
                  Faça login
                </a>{' '}
                para finalizar a compra.
              </p>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
