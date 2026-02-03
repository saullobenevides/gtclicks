"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { useRouter, useSearchParams } from "next/navigation";

export default function PhotographerFilters({ filters, cities = [] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const query = filters.q || "";
  const category = filters.categoria || "all";
  const city = filters.cidade || "all";

  const handleChange = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all") params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/fotografos?${params.toString()}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const q = form.q?.value?.trim() || "";
    handleChange("q", q);
  };

  return (
    <form
      key={`${query}-${category}-${city}`}
      onSubmit={handleSubmit}
      className="w-full flex flex-col sm:flex-row gap-3 sm:gap-4"
    >
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          name="q"
          defaultValue={query}
          placeholder="Buscar por nome ou @username..."
          className="pl-9 h-11 bg-white dark:bg-zinc-900/50 border-border rounded-lg"
        />
      </div>

      <Select
        value={category}
        onValueChange={(v) => handleChange("categoria", v)}
      >
        <SelectTrigger className="w-full sm:w-[180px] h-11 bg-white dark:bg-zinc-900/50 border-border rounded-lg">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px] overflow-y-auto">
          <SelectItem value="all">Todas as categorias</SelectItem>
          {CATEGORIES.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={city} onValueChange={(v) => handleChange("cidade", v)}>
        <SelectTrigger className="w-full sm:w-[180px] h-11 bg-white dark:bg-zinc-900/50 border-border rounded-lg">
          <SelectValue placeholder="Cidade" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px] overflow-y-auto">
          <SelectItem value="all">Todas as cidades</SelectItem>
          {cities.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </form>
  );
}
