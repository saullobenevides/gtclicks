"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PaymentFailurePage() {
  return (
    <div className="container">
      <section className="py-24">
        <div className="text-center max-w-2xl mx-auto p-12 bg-card border rounded-lg">
          <div className="w-20 h-20 mx-auto mb-8 rounded-full flex items-center justify-center text-5xl font-bold text-white bg-red-500">✗</div>
          <h1 className="text-4xl font-bold mb-4 text-heading">Pagamento Não Aprovado</h1>
          <p className="text-xl text-body mb-8">
            Infelizmente, não foi possível processar seu pagamento.
          </p>

          <div className="bg-background p-6 rounded-md my-8 text-left">
            <p>
              Isso pode ter acontecido por diversos motivos, como dados incorretos,
              saldo insuficiente ou problemas com seu método de pagamento.
            </p>
          </div>

          <div className="flex flex-col gap-4 mt-8">
            <Button asChild>
              <Link href="/carrinho">
                Voltar ao Carrinho
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/busca">
                Continuar Navegando
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
