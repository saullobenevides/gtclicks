'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DollarSign, PlusCircle, Trash2, ArrowLeft } from 'lucide-react';

export default function PricingTab({ collectionData, onDataChange, addDiscount, removeDiscount, updateDiscount }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Precificação</CardTitle>
        <CardDescription>Defina o valor base e descontos progressivos.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-4">
          <Label htmlFor="price-base" className="text-lg font-medium text-primary">Preço Unitário da Foto</Label>
          <div className="relative max-w-[200px] w-full">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xl">R$</span>
            <Input 
              id="price-base" 
              type="number" 
              className="pl-12 h-14 text-2xl font-bold text-center bg-background border-primary/30 focus-visible:ring-primary shadow-sm"
              value={collectionData.precoFoto} 
              onChange={(e) => onDataChange('precoFoto', e.target.value)} 
            />
          </div>
          <p className="text-sm text-muted-foreground">Este é o valor padrão para uma única foto.</p>
        </div>

        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                Pacotes de Desconto
              </h3>
              <p className="text-sm text-muted-foreground">Incentive a compra de mais fotos oferecendo preços menores.</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addDiscount} className="border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800">
              <PlusCircle className="mr-2 h-4 w-4" /> Novo Pacote
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(!collectionData.descontos || collectionData.descontos.length === 0) && (
              <div className="col-span-full text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground bg-muted/30">
                <p>Nenhuma regra de desconto ativa.</p>
                <p className="text-xs mt-1">Clique em "Novo Pacote" para criar uma.</p>
              </div>
            )}
            
            {collectionData.descontos?.map((discount, index) => (
              <div key={index} className="relative group border rounded-xl p-4 bg-card shadow-sm hover:shadow-md transition-all flex flex-col gap-3">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" 
                  onClick={() => removeDiscount(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

                <div className="flex items-center justify-between gap-2">
                  <div className="space-y-1 flex-1">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">Quantidade Mínima</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="number" 
                        className="h-9 font-medium" 
                        value={discount.min} 
                        onChange={(e) => updateDiscount(index, 'min', e.target.value)}
                      />
                      <span className="text-sm font-medium">fotos</span>
                    </div>
                  </div>
                  <ArrowLeft className="h-4 w-4 text-muted-foreground rotate-180" />
                  <div className="space-y-1 flex-1 text-right">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide text-green-600">Novo Preço Unitário</Label>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">R$</span>
                      <Input 
                        type="number" 
                        className="h-9 pl-7 font-bold text-green-600 text-right" 
                        value={discount.price} 
                        onChange={(e) => updateDiscount(index, 'price', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="text-xs text-center bg-muted/50 py-1 rounded">
                  Cliente paga <span className="font-bold text-green-700">R$ {(discount.price * discount.min).toFixed(2)}</span> por {discount.min} fotos
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
