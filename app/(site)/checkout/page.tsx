"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/features/cart/context/CartContext";
import { useStackApp } from "@stackframe/stack";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck, Lock, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { PageBreadcrumbs } from "@/components/shared/layout";
import BackButton from "@/components/shared/BackButton";
import CheckoutSteps from "@/components/checkout/CheckoutSteps";
import { ErrorState } from "@/components/shared/states";
import { CheckoutPageSkeleton } from "@/components/shared/Skeletons";
import { isValidCpf } from "@/lib/cpf";

interface CartItem {
  fotoId: string;
  licencaId?: string;
  titulo?: string;
  previewUrl?: string;
  preco?: number;
  licenca?: { nome: string } | string;
}

interface OrderItem {
  fotoId: string;
  licencaId?: string;
  titulo?: string;
  previewUrl?: string;
  preco?: number;
  licenca?: { nome: string } | string;
}

interface OrderApiResponse {
  data?: {
    itens?: Array<{
      fotoId: string;
      licencaId?: string;
      foto?: { titulo?: string; previewUrl?: string };
      precoPago?: number;
      licenca?: { nome?: string };
    }>;
    total?: number;
  };
}

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
  const [user, setUser] = useState<{
    primaryEmail?: string | null;
    email?: string | null;
    displayName?: string | null;
    name?: string | null;
  } | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const [orderItems, setOrderItems] = useState<OrderItem[] | null>(null);
  const [orderTotal, setOrderTotal] = useState(0);
  const [loadingOrder, setLoadingOrder] = useState(!!orderId);
  const [errorOrder, setErrorOrder] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [asaasLoading, setAsaasLoading] = useState(false);
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [addressNumber, setAddressNumber] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [province, setProvince] = useState("");

  const fetchOrder = useCallback(async () => {
    if (!orderId || !user) return;
    setErrorOrder(null);
    setLoadingOrder(true);
    try {
      const res = await fetch(`/api/pedidos/${orderId}`);
      if (!res.ok) {
        setErrorOrder("Não foi possível carregar o pedido. Tente novamente.");
        return;
      }
      const data = (await res.json()) as OrderApiResponse;
      const orderData = data.data;
      if (orderData?.itens) {
        const mappedItems = orderData.itens.map((item) => ({
          fotoId: item.fotoId,
          licencaId: item.licencaId,
          titulo: item.foto?.titulo || "Foto",
          previewUrl: item.foto?.previewUrl || "",
          preco: Number(item.precoPago),
          licenca: item.licenca?.nome || "Padrão",
        }));
        setOrderItems(mappedItems);
        setOrderTotal(Number(orderData?.total ?? 0));
      } else {
        setErrorOrder("Pedido não encontrado ou sem itens.");
      }
    } catch (err) {
      setErrorOrder(
        "Não foi possível carregar o pedido. Verifique sua conexão e tente novamente."
      );
    } finally {
      setLoadingOrder(false);
    }
  }, [orderId, user]);

  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await app.getUser();
      if (!currentUser) {
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

  useEffect(() => {
    if (orderId && user) {
      fetchOrder();
    }
  }, [orderId, user, fetchOrder]);

  const displayItems = orderId ? orderItems : cartItems;
  const displayTotal = orderId ? orderTotal : getTotalPrice();

  useEffect(() => {
    if (
      !isLoadingUser &&
      !loadingOrder &&
      !isRedirecting &&
      !errorOrder &&
      (!displayItems || displayItems.length === 0)
    ) {
      router.push("/carrinho");
    }
  }, [isLoadingUser, loadingOrder, displayItems, router, isRedirecting, errorOrder]);

  if (errorOrder && orderId) {
    return (
      <div className="container-wide px-4 py-12 md:py-20">
        <div className="mb-6 flex items-center justify-between gap-4">
          <PageBreadcrumbs
            items={[
              { label: "Carrinho", href: "/carrinho", isLast: false },
              { label: "Pagamento", isLast: true },
            ]}
            className="shrink-0 min-w-0 mb-0"
          />
          <BackButton href="/carrinho" label="Voltar ao carrinho" />
        </div>
        <ErrorState
          title="Erro ao carregar pedido"
          message={errorOrder}
          onRetry={fetchOrder}
        />
      </div>
    );
  }

  if (isLoadingUser || !user || loadingOrder) {
    return (
      <div className="animate-in fade-in duration-300">
        <CheckoutPageSkeleton />
        <div className="flex justify-center -mt-4 gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">
            {loadingOrder ? "Carregando pedido..." : "Preparando checkout..."}
          </p>
        </div>
      </div>
    );
  }

  if (!displayItems || displayItems.length === 0) {
    return null;
  }

  const totalToPay = Number(displayTotal) || 0;
  if (totalToPay <= 0) {
    return (
      <div className="container-wide px-4 py-12 md:py-20">
        <div className="mb-6 flex items-center justify-between gap-4">
          <PageBreadcrumbs
            items={[
              { label: "Carrinho", href: "/carrinho", isLast: false },
              { label: "Pagamento", isLast: true },
            ]}
            className="shrink-0 min-w-0 mb-0"
          />
          <BackButton href="/carrinho" label="Voltar ao carrinho" />
        </div>
        <ErrorState
          title="Valor do pedido inválido"
          message="O total do pedido precisa ser maior que zero. Verifique os itens e tente novamente."
          variant="default"
        />
        <div className="flex justify-center mt-6">
          <Button asChild>
            <Link href="/carrinho">Voltar ao Carrinho</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-wide px-4 py-12 md:py-20">
      <div className="mb-10">
        <div className="flex items-center justify-between gap-4 mb-4">
          <PageBreadcrumbs
            items={[
              { label: "Carrinho", href: "/carrinho", isLast: false },
              { label: "Pagamento", isLast: true },
            ]}
            className="shrink-0 min-w-0 mb-0"
          />
          <BackButton
            href="/carrinho"
            label="Voltar ao carrinho"
            className=""
          />
        </div>
        <CheckoutSteps className="mb-6" />
        <div className="text-center">
          <h1 className="heading-display text-3xl md:text-4xl font-black text-white uppercase tracking-tight mb-2">
            {orderId ? "Finalizar Pagamento" : "Finalizar Compra"}
          </h1>
          <p className="text-muted-foreground flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" /> Ambiente Seguro
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_450px] gap-12">
        <div className="space-y-6">
          <Card className="border-white/10 bg-[#3a3a3a] rounded-xl">
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
                        alt={item.titulo || "Foto"}
                        fill
                        className="h-16 w-24"
                        imageClassName="object-cover"
                        width={96}
                        height={64}
                        quality={80}
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="font-bold text-white text-sm sm:text-base">
                        {item.titulo}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <ShieldCheck className="h-3 w-3 text-primary" />
                        <span>
                          {typeof item.licenca === "object" &&
                          item.licenca !== null &&
                          "nome" in item.licenca
                            ? item.licenca.nome
                            : String(item.licenca ?? "Padrão")}
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

        <div className="relative">
          <Card className="border-white/10 bg-[#3a3a3a] rounded-xl lg:sticky lg:top-24 overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border border-white/10">
                  <CreditCard className="h-5 w-5 text-action-primary" />
                </div>
                <CardTitle className="text-xl text-white font-bold">
                  Pagamento
                </CardTitle>
              </div>
              <CardDescription className="text-sm text-white/70 leading-relaxed mt-1">
                Pagamento seguro via Asaas. Aceitamos apenas PIX.
              </CardDescription>
            </CardHeader>
            <Separator className="bg-white/10 mx-4 md:mx-6" />
            <CardContent className="pt-5">
              <div className="min-h-[400px] space-y-4">
                <p className="text-sm text-muted-foreground">
                  Informe CPF, telefone, endereço (incl. bairro e CEP) para preencher no Asaas.
                  Você será redirecionado para a página segura para pagar via PIX.
                </p>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="checkout-cpf" className="text-white/90">
                      CPF
                    </Label>
                    <Input
                      id="checkout-cpf"
                      type="text"
                      inputMode="numeric"
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "").slice(0, 11);
                        setCpf(
                          v
                            .replace(/(\d{3})(\d)/, "$1.$2")
                            .replace(/(\d{3})(\d)/, "$1.$2")
                            .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
                        );
                      }}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                      maxLength={14}
                    />
                    {cpf.replace(/\D/g, "").length > 0 &&
                      cpf.replace(/\D/g, "").length !== 11 && (
                        <p className="text-xs text-amber-400">
                          CPF deve ter 11 dígitos
                        </p>
                      )}
                    {cpf.replace(/\D/g, "").length === 11 &&
                      !isValidCpf(cpf) && (
                        <p className="text-xs text-red-400">
                          CPF inválido. Verifique os números.
                        </p>
                      )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="checkout-phone" className="text-white/90">
                      Telefone (com DDD)
                    </Label>
                    <Input
                      id="checkout-phone"
                      type="text"
                      inputMode="tel"
                      placeholder="(00) 00000-0000"
                      value={phone}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "").slice(0, 11);
                        if (v.length <= 2) {
                          setPhone(v ? `(${v}` : v);
                        } else if (v.length <= 6) {
                          setPhone(`(${v.slice(0, 2)}) ${v.slice(2)}`);
                        } else {
                          setPhone(
                            `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`
                          );
                        }
                      }}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                      maxLength={15}
                    />
                    {phone.replace(/\D/g, "").length > 0 &&
                      phone.replace(/\D/g, "").length < 10 && (
                        <p className="text-xs text-amber-400">
                          Telefone deve ter 10 ou 11 dígitos (DDD + número)
                        </p>
                      )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="checkout-address" className="text-white/90">
                      Endereço (rua, avenida)
                    </Label>
                    <Input
                      id="checkout-address"
                      type="text"
                      placeholder="Ex: Rua das Flores"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                      maxLength={200}
                    />
                    {address.length > 0 && address.trim().length < 5 && (
                      <p className="text-xs text-amber-400">
                        Informe o logradouro (mín. 5 caracteres)
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="checkout-address-number" className="text-white/90">
                      Número
                    </Label>
                    <Input
                      id="checkout-address-number"
                      type="text"
                      placeholder="Ex: 123 ou S/N"
                      value={addressNumber}
                      onChange={(e) => setAddressNumber(e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                      maxLength={20}
                    />
                    {addressNumber.length > 0 && !addressNumber.trim() && (
                      <p className="text-xs text-amber-400">
                        Informe o número ou S/N
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="checkout-province" className="text-white/90">
                      Bairro
                    </Label>
                    <Input
                      id="checkout-province"
                      type="text"
                      placeholder="Ex: Centro, Jardins"
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                      maxLength={100}
                    />
                    {province.length > 0 && province.trim().length < 2 && (
                      <p className="text-xs text-amber-400">
                        Informe o bairro (mín. 2 caracteres)
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="checkout-postal-code" className="text-white/90">
                      CEP
                    </Label>
                    <Input
                      id="checkout-postal-code"
                      type="text"
                      inputMode="numeric"
                      placeholder="00000-000"
                      value={postalCode}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "").slice(0, 8);
                        setPostalCode(
                          v.length <= 5 ? v : `${v.slice(0, 5)}-${v.slice(5)}`
                        );
                      }}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                      maxLength={9}
                    />
                    {postalCode.replace(/\D/g, "").length > 0 &&
                      postalCode.replace(/\D/g, "").length !== 8 && (
                        <p className="text-xs text-amber-400">
                          CEP deve ter 8 dígitos
                        </p>
                      )}
                  </div>
                </div>
                <Button
                  size="lg"
                  className="w-full"
                  disabled={
                    asaasLoading ||
                    cpf.replace(/\D/g, "").length !== 11 ||
                    !isValidCpf(cpf) ||
                    phone.replace(/\D/g, "").length < 10 ||
                    address.trim().length < 5 ||
                    !addressNumber.trim() ||
                    province.trim().length < 2 ||
                    postalCode.replace(/\D/g, "").length !== 8
                  }
                  onClick={async () => {
                    setAsaasLoading(true);
                    try {
                      const res = await fetch("/api/asaas/create-checkout", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          orderId: orderId ?? undefined,
                          cpf: cpf.replace(/\D/g, ""),
                          phone: phone.replace(/\D/g, ""),
                          address: address.trim(),
                          addressNumber: addressNumber.trim(),
                          postalCode: postalCode.replace(/\D/g, ""),
                          province: province.trim(),
                        }),
                      });
                      const data = (await res.json()) as {
                        checkoutUrl?: string;
                        orderId?: string;
                        error?: string;
                      };
                      if (res.ok && data.checkoutUrl) {
                        if (!orderId) clearCart();
                        setIsRedirecting(true);
                        window.location.href = data.checkoutUrl;
                      } else {
                        toast.error(
                          data.error || "Erro ao processar checkout"
                        );
                      }
                    } catch (err) {
                      toast.error(
                        "Erro ao processar checkout. Tente novamente."
                      );
                    } finally {
                      setAsaasLoading(false);
                    }
                  }}
                >
                  {asaasLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Redirecionando...
                    </>
                  ) : (
                    "Finalizar compra"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
