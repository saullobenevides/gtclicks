"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
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
import { Images, Edit, ExternalLink, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import CreateCollectionButton from "@/features/collections/components/CreateCollectionButton";
import { formatDateShort as formatDate } from "@/lib/utils/formatters";
import AppPagination from "@/components/shared/AppPagination";

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
              className="bg-black/20 border-white/10 hover:bg-black/30 transition-colors"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2">
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
                <TableHead className="w-[300px]">Coleção</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data Criação</TableHead>
                <TableHead>Fotos</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {colecoes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
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
                    className="border-white/10 hover:bg-white/5"
                  >
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
