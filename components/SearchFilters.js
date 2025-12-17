'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CATEGORIES } from '@/lib/constants';

export default function SearchFilters({ filters }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside className="lg:sticky lg:top-24 h-fit z-30">
        {/* Mobile Toggle */}
        <div className="lg:hidden mb-4">
            <Button 
                onClick={() => setIsOpen(!isOpen)} 
                variant="outline" 
                className="w-full justify-between bg-black/40 border-white/10 text-white backdrop-blur-md"
            >
                <span className="flex items-center gap-2">
                    <Filter className="h-4 w-4" /> Filtros
                </span>
                {isOpen ? <X className="h-4 w-4" /> : <span className="text-xs text-muted-foreground">Mostrar</span>}
            </Button>
        </div>

      <form method="get" className={cn("lg:block", isOpen ? "block" : "hidden")}>
        <Card className="glass-panel border-white/10 bg-black/40">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-white hidden lg:block">Filtros</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="q" className="text-gray-400">Palavra-chave</Label>
              <Input
                id="q"
                name="q"
                placeholder="Ex: natureza, retrato..."
                defaultValue={filters.q}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-primary/50 focus:ring-primary/20"
                suppressHydrationWarning
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <Label htmlFor="cor" className="text-gray-400">Cor predominante</Label>
              <Select name="cor" defaultValue={filters.cor}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-primary/20" suppressHydrationWarning>
                  <SelectValue placeholder="Todas as cores" />
                </SelectTrigger>
                <SelectContent className="bg-black border-white/10 text-white">
                  <SelectItem value="all">Todas as cores</SelectItem>
                  <SelectItem value="azul">Azul</SelectItem>
                  <SelectItem value="verde">Verde</SelectItem>
                  <SelectItem value="vermelho">Vermelho</SelectItem>
                  <SelectItem value="amarelo">Amarelo</SelectItem>
                  <SelectItem value="preto">Preto</SelectItem>
                  <SelectItem value="branco">Branco</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid w-full items-center gap-2">
              <Label htmlFor="categoria" className="text-gray-400">Categoria</Label>
              <Select name="categoria" defaultValue={filters.categoria}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-primary/20" suppressHydrationWarning>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent className="bg-black border-white/10 text-white">
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid w-full items-center gap-2">
              <Label htmlFor="orientacao" className="text-gray-400">Orientação</Label>
              <Select name="orientacao" defaultValue={filters.orientacao}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-primary/20" suppressHydrationWarning>
                  <SelectValue placeholder="Qualquer formato" />
                </SelectTrigger>
                <SelectContent className="bg-black border-white/10 text-white">
                  <SelectItem value="all">Qualquer formato</SelectItem>
                  <SelectItem value="horizontal">Horizontal</SelectItem>
                  <SelectItem value="vertical">Vertical</SelectItem>
                  <SelectItem value="panoramica">Panorâmica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pt-2">
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-semibold" suppressHydrationWarning>
              Aplicar Filtros
            </Button>
            {Object.values(filters).some(Boolean) && (
              <Button asChild variant="ghost" className="w-full text-gray-400 hover:text-white hover:bg-white/5">
                <Link href="/busca">Limpar tudo</Link>
              </Button>
            )}
          </CardFooter>
        </Card>
      </form>
    </aside>
  );
}
