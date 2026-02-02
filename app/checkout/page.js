"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/features/cart/context/CartContext";
import { useStackApp } from "@stackframe/stack";
import PaymentBrick from "@/components/checkout/PaymentBrick";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ImageWithFallback from "@/components/shared/ImageWithFallback";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck, Lock } from "lucide-react";
import { toast } from "sonner";

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const {
    items: cartItems,
    getTotalPrice,
    getItemPrice,
    clearCart,
  } = useCart();
  const app = useStackApp();
  const [user, setUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // State for Order Retry Mode
  const [orderItems, setOrderItems] = useState(null);
  const [orderTotal, setOrderTotal] = useState(0);
  const [loadingOrder, setLoadingOrder] = useState(!!orderId);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Check user authentication
    const checkUser = async () => {
      const currentUser = await app.getUser();
      if (!currentUser) {
        // Redirect to login (unificado com o resto do app) preservando retorno ao checkout
        const returnTo =
          typeof window !== "undefined"
            ? `${window.location.pathname}${window.location.search || ""}`
            : "/checkout";
        const callbackUrl = encodeURIComponent(returnTo);
        router.push(`/login?callbackUrl=${callbackUrl}`);
        return;
      }
      setUser(currentUser);
      setIsLoadingUser(false);
    };
    checkUser();
  }, [app, router]);

  // Fetch Order if retrying
  useEffect(() => {
    if (orderId && user) {
      fetch(`/api/pedidos/${orderId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.itens) {
            const mappedItems = data.itens.map((item) => ({
              fotoId: item.fotoId,
              licencaId: item.licencaId,
              titulo: item.foto?.titulo || "Foto",
              previewUrl: item.foto?.previewUrl || "",
              preco: Number(item.precoPago),
              licenca: item.licenca?.nome || "Padrão",
            }));
            setOrderItems(mappedItems);
            setOrderTotal(Number(data.total));
          }
        })
        .catch((err) => console.error("Error loading order:", err))
        .finally(() => setLoadingOrder(false));
    }
  }, [orderId, user]);

  /** Mapeia status_detail do Mercado Pago para mensagens amigáveis */
  const getPaymentErrorMessage = (result) => {
    const fromError =
      typeof result?.error === "string" ? result.error : result?.error?.message;
    if (fromError) return fromError;

    const detail = result?.status_detail;
    const messages = {
      rejected_by_bank:
        "O pagamento foi recusado. Verifique os dados preenchidos (nome, CPF, endereço completo para boleto) e tente novamente.",
      cc_rejected_bad_filled_card_number: "Número do cartão inválido.",
      cc_rejected_bad_filled_date: "Data de validade inválida.",
      cc_rejected_bad_filled_security_code:
        "Código de segurança (CVV) inválido.",
      cc_rejected_insufficient_amount:
        "Limite insuficiente no cartão. Tente outro cartão ou método de pagamento.",
      cc_rejected_max_attempts:
        "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
      cc_rejected_blacklist: "Cartão não autorizado para esta operação.",
      cc_rejected_other_reason:
        "O banco recusou o pagamento. Entre em contato com seu banco ou tente outro método.",
    };
    return messages[detail] || "Ocorreu um erro ao processar o pagamento.";
  };

  const handlePaymentResult = (result) => {
    console.log("Payment Result Full:", result);

    if (
      result.status === "approved" ||
      result.status === "PAGO" ||
      result.status === "in_process" ||
      result.status === "pending"
    ) {
      setIsRedirecting(true); // Prevent redirect to empty cart
      if (!orderId) {
        clearCart();
      }
      router.push(
        `/checkout/sucesso?orderId=${
          result.orderId || orderId || "pending"
        }&status=${result.status}`
      );
    } else {
      const errorMessage = getPaymentErrorMessage(result);
      console.error("Payment Failed:", result);
      toast.error("Erro no Pagamento", {
        description: errorMessage + " Verifique os dados e tente novamente.",
      });
      // Mantém o mesmo pedido para retentativa: atualiza URL com orderId
      if (result.orderId && !orderId) {
        router.replace(`/checkout?orderId=${result.orderId}`);
      }
    }
  };

  // Determine items and total based on mode (Cart or Order Retry)
  const displayItems = orderId ? orderItems : cartItems;
  const displayTotal = orderId ? orderTotal : getTotalPrice();

  useEffect(() => {
    if (
      !isLoadingUser &&
      !loadingOrder &&
      !isRedirecting &&
      (!displayItems || displayItems.length === 0)
    ) {
      router.push("/carrinho");
    }
  }, [isLoadingUser, loadingOrder, displayItems, router, isRedirecting]);

  if (isLoadingUser || !user || loadingOrder) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!displayItems || displayItems.length === 0) {
    return null;
  }

  const totalToPay = Number(displayTotal) || 0;
  if (totalToPay <= 0) {
    return (
      <div className="container-wide px-4 py-12 md:py-20 text-center">
        <h1 className="text-xl font-bold text-white mb-4">
          Valor do pedido inválido
        </h1>
        <p className="text-muted-foreground mb-6">
          O total do pedido precisa ser maior que zero. Verifique os itens e
          tente novamente.
        </p>
        <Button asChild>
          <Link href="/carrinho">Voltar ao Carrinho</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-wide px-4 py-12 md:py-20">
      <div className="mb-10 text-center">
        <h1 className="heading-display text-3xl md:text-4xl font-black text-white uppercase tracking-tight mb-2">
          {orderId ? "Finalizar Pagamento" : "Finalizar Compra"}
        </h1>
        <p className="text-muted-foreground flex items-center justify-center gap-2">
          <Lock className="w-4 h-4" /> Ambiente Seguro
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_450px] gap-12">
        {/* Left Column: Review Order */}
        <div className="space-y-6">
          <Card className="glass-panel border-white/10 bg-black/40">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                Itens do Pedido{" "}
                {orderId && `#${orderId.slice(-8).toUpperCase()}`}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {displayItems.map((item) => {
                const itemPrice = orderId
                  ? Number(item.preco)
                  : getItemPrice(item);
                return (
                  <div
                    key={`${item.fotoId}-${item.licencaId}`}
                    className="flex gap-4 items-start"
                  >
                    <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
                      <ImageWithFallback
                        src={item.previewUrl}
                        alt={item.titulo}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="font-bold text-white text-sm sm:text-base">
                        {item.titulo}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <ShieldCheck className="h-3 w-3 text-primary" />
                        <span>
                          {typeof item.licenca === "object"
                            ? item.licenca.nome
                            : item.licenca}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-white text-sm sm:text-base">
                        R$ {(itemPrice || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}

              <Separator className="bg-white/10 my-4" />

              <div className="flex justify-between items-center text-lg font-bold text-white">
                <span>Total a Pagar</span>
                <span>R$ {totalToPay.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <div className="hidden lg:block bg-primary/5 border border-primary/20 rounded-xl p-6">
            <h3 className="text-green-400 font-bold mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" /> Garantia GTClicks
            </h3>
            <p className="text-sm text-muted-foreground">
              Ao finalizar a compra, você receberá acesso imediato aos arquivos
              em alta resolução. Todas as transações são criptografadas e
              processadas de forma segura.
            </p>
          </div>
        </div>

        {/* Right Column: Payment Brick */}
        <div className="relative">
          <Card className="glass-panel border-white/10 bg-black/40 lg:sticky lg:top-24">
            <CardHeader>
              <CardTitle className="text-xl text-white">Pagamento</CardTitle>
              <CardDescription>
                Escolha sua forma de pagamento preferida. Se tiver problemas
                (ex.: boleto sem preencher endereço), desative temporariamente
                bloqueadores de anúncios.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="min-h-[400px]">
                <PaymentBrick
                  amount={totalToPay}
                  payer={
                    user
                      ? {
                          email: user.primaryEmail || user.email,
                          firstName:
                            user.displayName?.split(" ")[0] ||
                            user.name?.split(" ")[0],
                          lastName:
                            user.displayName?.split(" ").slice(1).join(" ") ||
                            user.name?.split(" ").slice(1).join(" ") ||
                            "",
                        }
                      : undefined
                  }
                  onPaymentResult={handlePaymentResult}
                  orderId={orderId}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
