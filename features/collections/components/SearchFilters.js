"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Loader2 } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { useRouter, useSearchParams } from "next/navigation";

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debouncedValue;
}

export default function SearchFilters({ filters, cities = [] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [queryInput, setQueryInput] = useState(filters.q || "");
  const debouncedQuery = useDebounce(queryInput, 400);

  useEffect(() => {
    setQueryInput(filters.q || "");
  }, [filters.q]);

  const query = filters.q || "";
  const category = filters.categoria || "all";
  const city = filters.cidade || "all";
  const date = filters.date || "";

  const updateUrl = useCallback(
    (updates) => {
      const params = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([key, value]) => {
        if (value && value !== "all") params.set(key, value);
        else params.delete(key);
      });
      params.delete("page");
      router.push(`/busca?${params.toString()}`);
    },
    [router, searchParams]
  );

  const isSearching = queryInput !== debouncedQuery;

  useEffect(() => {
    if (debouncedQuery !== query) {
      updateUrl({ q: debouncedQuery });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only run when debounced query changes
  }, [debouncedQuery]);

  const handleChange = (key, value) => {
    if (key === "q") setQueryInput(value);
    updateUrl({ [key]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const q = form.q?.value?.trim() || "";
    setQueryInput(q);
    updateUrl({ q });
  };

  return (
    <form
      key={`${query}-${category}-${city}-${date}`}
      onSubmit={handleSubmit}
      className="w-full flex flex-col sm:flex-row gap-3 sm:gap-4"
    >
      <div className="relative flex-1 min-w-0">
        {isSearching ? (
          <Loader2
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin pointer-events-none"
            aria-hidden
          />
        ) : (
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
            aria-hidden
          />
        )}
        <Input
          name="q"
          value={queryInput}
          onChange={(e) => setQueryInput(e.target.value)}
          placeholder="Buscar coleções, eventos ou fotógrafos..."
          className="pl-9 h-11 bg-white dark:bg-zinc-900/50 border-border rounded-lg min-h-[44px]"
          aria-label="Buscar"
          aria-busy={isSearching}
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

      <div className="flex-1 sm:flex-initial sm:w-[180px] min-w-0">
        <Input
          id="search-date"
          type="date"
          aria-label="Data"
          value={date}
          onChange={(e) => handleChange("date", e.target.value)}
          className="w-full h-11 bg-transparent dark:bg-zinc-900/50 border-2 border-border-default rounded-radius-lg date-icon-right"
        />
      </div>
    </form>
  );
}
