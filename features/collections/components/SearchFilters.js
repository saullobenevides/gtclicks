"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/constants";
import { useRouter, useSearchParams } from "next/navigation";

export default function SearchFilters({ filters }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Local state to manage inputs before applying
  const [query, setQuery] = useState(filters.q || "");
  const [category, setCategory] = useState(filters.categoria || "all");
  const [date, setDate] = useState(filters.date || "");

  const handleApplyFilters = (e) => {
    e.preventDefault();

    // Construct URL params
    const params = new URLSearchParams(searchParams);

    if (query) params.set("q", query);
    else params.delete("q");

    if (category && category !== "all") params.set("categoria", category);
    else params.delete("categoria");

    if (date) params.set("date", date);
    else params.delete("date");

    // Reset page to 1 on new filter
    params.delete("page");

    router.push(`?${params.toString()}`);
    setIsOpen(false); // Close mobile drawer if open
  };

  return (
    <aside className="w-full max-w-3xl mx-auto h-fit z-30 lg:sticky lg:top-24">
      {/* Toggle Button (Mobile Only) */}
      <div className="mb-4 lg:hidden">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="outline"
          className="w-full justify-between bg-black/40 border-white/10 text-white backdrop-blur-md h-12"
        >
          <span className="flex items-center gap-2 font-semibold">
            <Filter className="h-4 w-4" /> Filtros
          </span>
          {isOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <span className="text-xs text-muted-foreground">Mostrar</span>
          )}
        </Button>
      </div>

      <form
        onSubmit={handleApplyFilters}
        className={cn(
          "transition-all duration-300 lg:block",
          isOpen ? "block animate-in fade-in zoom-in-95" : "hidden",
        )}
      >
        <Card className="bg-black border-white/10 rounded-xl shadow-2xl p-4">
          <CardHeader className="p-0 mb-3">
            <CardTitle className="text-lg font-bold text-white">
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex flex-col gap-3">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="q" className="text-xs font-medium text-gray-300">
                Palavra-chave
              </Label>
              <Input
                id="q"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex: natureza, retrato..."
                className="bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 rounded-lg focus:border-primary/50 focus:ring-primary/20 h-9 text-sm"
              />
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label
                htmlFor="categoria"
                className="text-xs font-medium text-gray-300"
              >
                Categoria
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-zinc-900/50 border-zinc-800 text-white rounded-lg focus:ring-primary/20 h-9 text-sm">
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white max-h-[300px] overflow-y-auto">
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label
                htmlFor="date"
                className="text-xs font-medium text-gray-300"
              >
                Data do Evento
              </Label>
              <div className="relative">
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="dd/mm/aaaa"
                  className="bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 rounded-lg focus:border-primary/50 focus:ring-primary/20 h-9 w-full text-sm scheme-dark date-icon-right"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-0 mt-4">
            <Button
              type="submit"
              className="w-full h-12 font-black uppercase tracking-widest text-xs scale-100 hover:scale-[1.02] transition-all"
            >
              Aplicar Filtros
            </Button>
          </CardFooter>
        </Card>
      </form>
    </aside>
  );
}
