"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Images,
  Edit,
  ExternalLink,
  PlusCircle,
  Search,
  Eye,
  EyeOff,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { bulkUpdateCollectionsStatus } from "@/actions/collections";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import CreateCollectionButton from "@/features/collections/components/CreateCollectionButton";
import { formatDateShort as formatDate } from "@/lib/utils/formatters";
import AppPagination from "@/components/shared/AppPagination";

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debouncedValue;
}

/**
 * Client Component – lista de coleções do fotógrafo (Manual v3.0).
 * Recebe dados do Server Component (page) que usa _data-access.
 */
export default function ColecoesContent({
  colecoes = [],
  totalPages = 1,
  currentPage = 1,
  searchParams = {},
}) {
  const router = useRouter();
  const urlSearchParams = useSearchParams();
  const [queryInput, setQueryInput] = useState(searchParams?.q ?? "");
  const debouncedQuery = useDebounce(queryInput, 400);
  const status = searchParams?.status ?? "all";

  useEffect(() => {
    setQueryInput(searchParams?.q ?? "");
  }, [searchParams?.q]);

  const updateUrl = useCallback(
    (updates) => {
      const params = new URLSearchParams(urlSearchParams);
      Object.entries(updates).forEach(([key, value]) => {
        if (value && value !== "all") params.set(key, value);
        else params.delete(key);
      });
      params.delete("page");
      router.push(`/dashboard/fotografo/colecoes?${params.toString()}`);
    },
    [router, urlSearchParams]
  );

  useEffect(() => {
    if (debouncedQuery !== (searchParams?.q ?? "")) {
      updateUrl({ q: debouncedQuery });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when debounced changes
  }, [debouncedQuery]);

  const handleStatusChange = (v) => updateUrl({ status: v });

  const sort = searchParams?.sort ?? "createdAt";
  const order = searchParams?.order ?? "desc";

  const handleSort = (field) => {
    const nextOrder =
      sort === field && order === "desc" ? "asc" : "desc";
    updateUrl({ sort: field, order: nextOrder });
  };

  const SortableHead = ({ field, children, className }) => {
    const isActive = sort === field;
    const label =
      order === "asc"
        ? `Ordenar por ${children} (ascendente, clicar para descendente)`
        : `Ordenar por ${children} (descendente, clicar para ascendente)`;
    return (
      <TableHead className={className}>
        <button
          type="button"
          onClick={() => handleSort(field)}
          className="flex items-center gap-1.5 w-full text-left font-medium hover:text-white transition-colors group"
          aria-label={isActive ? label : `Ordenar por ${children}`}
        >
          {children}
          <span className="text-muted-foreground group-hover:text-white">
            {isActive ? (
              order === "asc" ? (
                <ArrowUp className="h-4 w-4" aria-hidden />
              ) : (
                <ArrowDown className="h-4 w-4" aria-hidden />
              )
            ) : (
              <ArrowUpDown className="h-4 w-4 opacity-50" aria-hidden />
            )}
          </span>
        </button>
      </TableHead>
    );
  };

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === colecoes.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(colecoes.map((c) => c.id)));
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkStatus = async (status) => {
    if (!selectedIds.size) return;
    setIsBulkLoading(true);
    try {
      const result = await bulkUpdateCollectionsStatus(
        Array.from(selectedIds),
        status
      );
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(
          `${result.updated} coleção(ões) atualizada(s) para ${
            status === "PUBLICADA" ? "Ativo" : "Rascunho"
          }`
        );
        clearSelection();
        router.refresh();
      }
    } catch (err) {
      toast.error("Erro ao atualizar coleções");
    } finally {
      setIsBulkLoading(false);
    }
  };

  const selectedCount = selectedIds.size;

  return (
    <div className="flex flex-col gap-6 md:gap-8 p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="heading-display font-display text-2xl md:text-3xl font-black text-white tracking-tight">
            Minhas Coleções
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Gerencie todas as suas coleções de fotos
          </p>
        </div>
        <CreateCollectionButton />
      </div>

      {/* Filtros */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateUrl({ q: queryInput });
        }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="Buscar por nome ou descrição..."
            className="pl-9 h-10 bg-white/5 border-white/10"
          />
        </div>
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-[180px] h-10 bg-white/5 border-white/10">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px] overflow-y-auto">
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="PUBLICADA">Ativo</SelectItem>
            <SelectItem value="RASCUNHO">Rascunho</SelectItem>
          </SelectContent>
        </Select>
      </form>

      {/* Barra de ações em lote */}
      {selectedCount > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3">
          <span className="text-sm font-medium text-white">
            {selectedCount} selecionada(s)
          </span>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleBulkStatus("PUBLICADA")}
              disabled={isBulkLoading}
              className="h-8"
            >
              <Eye className="mr-2 h-4 w-4" />
              Publicar
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleBulkStatus("RASCUNHO")}
              disabled={isBulkLoading}
              className="h-8"
            >
              <EyeOff className="mr-2 h-4 w-4" />
              Mover para rascunho
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={clearSelection}
              disabled={isBulkLoading}
              className="h-8 text-muted-foreground hover:text-white"
            >
              <X className="mr-2 h-4 w-4" />
              Desmarcar
            </Button>
          </div>
        </div>
      )}

      {/* Mobile View */}
      <div className="md:hidden space-y-3">
        {colecoes.length === 0 ? (
          <Card className="bg-black/20 border-white/10">
            <CardContent className="py-12 text-center">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Images className="h-12 w-12 opacity-20" />
                <div className="space-y-1">
                  <p className="font-medium text-white">
                    Nenhuma coleção encontrada
                  </p>
                  <p className="text-xs">
                    Crie sua primeira coleção para começar
                  </p>
                </div>
                <Button asChild size="sm" variant="outline" className="mt-2">
                  <Link href="/dashboard/fotografo/colecoes/nova">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nova Coleção
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          colecoes.map((colecao) => (
            <Card
              key={colecao.id}
              className={cn(
                "bg-black/20 border-white/10 hover:bg-black/30 transition-colors",
                selectedIds.has(colecao.id) && "ring-2 ring-primary"
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2">
                  <Checkbox
                    checked={selectedIds.has(colecao.id)}
                    onCheckedChange={() => toggleSelect(colecao.id)}
                    className="mt-1 shrink-0"
                    aria-label={`Selecionar ${colecao.nome}`}
                  />
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-semibold text-white truncate">
                      {colecao.nome}
                    </CardTitle>
                    {colecao.descricao && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {colecao.descricao}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={
                      colecao.status === "PUBLICADA" ? "default" : "secondary"
                    }
                    className={cn(
                      "shrink-0",
                      colecao.status === "PUBLICADA" &&
                        "bg-green-500/10 text-green-500 border-green-500/20"
                    )}
                  >
                    {colecao.status === "PUBLICADA" ? "Ativo" : "Rascunho"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="py-2">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Images className="h-4 w-4" />
                    <span>{colecao._count?.fotos ?? 0} fotos</span>
                  </div>
                  <span>{formatDate(colecao.createdAt)}</span>
                </div>
              </CardContent>

              <CardFooter className="pt-3 flex justify-end gap-2 border-t border-white/10">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="h-9 text-muted-foreground hover:text-white"
                >
                  <Link
                    href={`/dashboard/fotografo/colecoes/${colecao.id}/editar`}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Link>
                </Button>
                {colecao.status === "PUBLICADA" && (
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="h-9 text-muted-foreground hover:text-white"
                  >
                    <Link href={`/colecoes/${colecao.slug}`} target="_blank">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ver
                    </Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* Desktop View */}
      <Card className="hidden md:block overflow-hidden border-white/10 bg-black/20 hover:bg-black/30 transition-colors">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-white/10">
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      colecoes.length > 0 &&
                      selectedIds.size === colecoes.length
                    }
                    onCheckedChange={toggleSelectAll}
                    aria-label="Selecionar todas"
                  />
                </TableHead>
                <SortableHead field="nome" className="w-[300px]">
                  Coleção
                </SortableHead>
                <SortableHead field="status">Status</SortableHead>
                <SortableHead field="createdAt">Data Criação</SortableHead>
                <SortableHead field="fotos">Fotos</SortableHead>
                <TableHead className="text-right w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {colecoes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-32 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Images className="h-8 w-8 opacity-20" />
                      <p>Nenhuma coleção encontrada.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                colecoes.map((colecao) => (
                  <TableRow
                    key={colecao.id}
                    className={cn(
                      "border-white/10 hover:bg-white/5",
                      selectedIds.has(colecao.id) && "bg-primary/5"
                    )}
                  >
                    <TableCell className="w-12">
                      <Checkbox
                        checked={selectedIds.has(colecao.id)}
                        onCheckedChange={() => toggleSelect(colecao.id)}
                        aria-label={`Selecionar ${colecao.nome}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium min-w-[200px]">
                      <div className="flex flex-col">
                        <span className="text-base text-white">
                          {colecao.nome}
                        </span>
                        {colecao.descricao && (
                          <span className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                            {colecao.descricao}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          colecao.status === "PUBLICADA"
                            ? "default"
                            : "secondary"
                        }
                        className={
                          colecao.status === "PUBLICADA"
                            ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                            : ""
                        }
                      >
                        {colecao.status === "PUBLICADA" ? "Ativo" : "Rascunho"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {formatDate(colecao.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Images className="h-4 w-4 text-muted-foreground" />
                        <span>{colecao._count?.fotos ?? 0}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-white"
                        >
                          <Link
                            href={`/dashboard/fotografo/colecoes/${colecao.id}/editar`}
                            title="Gerenciar"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        {colecao.status === "PUBLICADA" && (
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-white"
                          >
                            <Link
                              href={`/colecoes/${colecao.slug}`}
                              target="_blank"
                              title="Ver Página Pública"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <AppPagination
        currentPage={currentPage}
        totalPages={totalPages}
        baseUrl="/dashboard/fotografo/colecoes"
        searchParams={searchParams}
      />
    </div>
  );
}
