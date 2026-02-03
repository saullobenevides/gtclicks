"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DollarSign, PlusCircle, Trash2, ArrowLeft } from "lucide-react";

export default function PricingTab({
  collectionData,
  onDataChange,
  addDiscount,
  removeDiscount,
  updateDiscount,
}) {
  return (
    <Card className="border-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card">
      <CardHeader className="px-0 pl-4 md:px-6 py-4 md:py-6">
        <CardTitle>Precificação</CardTitle>
        <CardDescription>
          Defina o valor base e descontos progressivos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6">
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 md:p-6 flex flex-col items-center justify-center text-center gap-4">
          <Label
            htmlFor="price-base"
            className="text-lg font-medium text-primary"
          >
            Preço Unitário da Foto
          </Label>
          <div className="space-y-1.5 max-w-xs">
            <Label htmlFor="price">
              Preço por Foto (R$) <span className="text-primary">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold z-10">
                R$
              </span>
              <Input
                id="price-base"
                type="number"
                className="pl-12 h-14 text-2xl font-bold text-center bg-background border-2 border-primary/30 focus-visible:ring-primary shadow-sm rounded-radius-lg"
                value={collectionData.precoFoto}
                onChange={(e) => onDataChange("precoFoto", e.target.value)}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Valor unitário padrão para cada foto.
            </p>
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div className="space-y-1">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <DollarSign
                  className="h-5 w-5 text-status-success shrink-0"
                  aria-hidden
                />
                Pacotes de Desconto
              </h3>
              <p className="text-sm text-muted-foreground">
                Incentive a compra de mais fotos oferecendo preços menores.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addDiscount}
              className="w-full sm:w-auto min-h-[44px] border-status-success/30 text-status-success hover:bg-status-success/10 touch-manipulation"
              aria-label="Adicionar novo pacote de desconto"
            >
              <PlusCircle className="mr-2 h-4 w-4 shrink-0" aria-hidden />
              Novo Pacote
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(!collectionData.descontos ||
              collectionData.descontos.length === 0) && (
              <div className="col-span-full text-center py-12 border border-dashed border-white/10 rounded-none text-muted-foreground bg-white/5">
                <p className="font-bold uppercase tracking-widest text-[10px]">
                  Nenhuma regra de desconto ativa.
                </p>
                <p className="text-[10px] mt-1 opacity-40">
                  Clique em &quot;Novo Pacote&quot; para criar uma.
                </p>
              </div>
            )}

            {collectionData.descontos?.map((discount, index) => (
              <div
                key={index}
                className="relative group border border-white/10 rounded-none p-4 md:p-6 bg-white/5 shadow-sm hover:border-primary/30 transition-all flex flex-col gap-4"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-10 w-10 min-h-[44px] min-w-[44px] text-muted-foreground hover:text-status-error rounded-radius-lg bg-black/40 touch-manipulation"
                  onClick={() => removeDiscount(index)}
                  aria-label={`Remover pacote ${index + 1}`}
                >
                  <Trash2 className="h-4 w-4 shrink-0" aria-hidden />
                </Button>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                      Qtd. Mínima
                    </Label>
                    <Input
                      type="number"
                      className="h-11 bg-transparent border-2 border-border-default rounded-radius-lg"
                      value={discount.min}
                      onChange={(e) =>
                        updateDiscount(index, "min", e.target.value)
                      }
                      min="2"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                      Preço Individual (R$)
                    </Label>
                    <Input
                      type="number"
                      className="h-11 bg-transparent border-2 border-border-default rounded-radius-lg"
                      value={discount.price}
                      step="0.50"
                      onChange={(e) =>
                        updateDiscount(index, "price", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-center bg-black/40 py-2 border border-white/5">
                  Total no plano:{" "}
                  <span className="text-green-500">
                    R$ {(discount.price * discount.min).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
