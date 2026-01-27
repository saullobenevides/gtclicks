import Link from "next/link";
export const dynamic = "force-dynamic";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { stackServerApp } from "@/stack/server";
import prisma from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Images, PlusCircle, Edit, ExternalLink } from "lucide-react";
import CreateCollectionButton from "@/features/collections/components/CreateCollectionButton";
import { formatDateShort as formatDate } from "@/lib/utils/formatters";
import AppPagination from "@/components/shared/AppPagination";

export default async function MinhasColecoesPage(props) {
  const searchParams = await props.searchParams;
  const page = searchParams?.page ? Number(searchParams.page) : 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  let user;
  try {
    user = await stackServerApp.getUser();
  } catch (error) {
    console.error("Error fetching user:", error);
  }

  if (!user) {
    redirect("/login?callbackUrl=/dashboard/fotografo/colecoes");
  }

  const fotografo = await prisma.fotografo.findUnique({
    where: { userId: user.id },
  });

  if (!fotografo) {
    redirect("/dashboard/fotografo");
  }

  const [total, rawColecoes] = await Promise.all([
    prisma.colecao.count({
      where: { fotografoId: fotografo.id },
    }),
    prisma.colecao.findMany({
      where: { fotografoId: fotografo.id },
      include: {
        _count: {
          select: { fotos: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: skip,
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  const colecoes = rawColecoes.map((c) => ({
    ...c,
    precoFoto: c.precoFoto ? Number(c.precoFoto) : 0,
  }));

  return (
    <div className="flex flex-col gap-8 p-4 md:p-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="heading-display font-display text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
            Minhas Coleções
          </h1>
          <p className="text-muted-foreground">
            Gerencie todas as suas coleções de fotos.
          </p>
        </div>
        <CreateCollectionButton />
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {colecoes.length === 0 ? (
          <Card className="bg-black/20 border-white/10">
            <CardContent className="py-8 text-center text-muted-foreground">
              <div className="flex flex-col items-center gap-2">
                <Images className="h-8 w-8 opacity-20" />
                <p>Nenhuma coleção encontrada.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          colecoes.map((colecao) => (
            <Card key={colecao.id} className="bg-black/20 border-white/10">
              <CardContent className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-white">{colecao.nome}</h3>
                    {colecao.descricao && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {colecao.descricao}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={
                      colecao.status === "PUBLICADA" ? "default" : "secondary"
                    }
                    className={
                      colecao.status === "PUBLICADA"
                        ? "bg-green-500/10 text-green-500"
                        : ""
                    }
                  >
                    {colecao.status === "PUBLICADA" ? "Ativo" : "Rascunho"}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground border-t border-white/10 pt-2">
                  <div className="flex items-center gap-1">
                    <Images className="h-4 w-4" />
                    <span>{colecao._count.fotos} fotos</span>
                  </div>
                  <span>{formatDate(colecao.createdAt)}</span>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11 text-muted-foreground hover:text-white bg-white/5"
                  >
                    <Link
                      href={`/dashboard/fotografo/colecoes/${colecao.id}/editar`}
                    >
                      <Edit className="h-5 w-5" />
                    </Link>
                  </Button>
                  {colecao.status === "PUBLICADA" && (
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className="h-11 w-11 text-muted-foreground hover:text-white bg-white/5"
                    >
                      <Link href={`/colecoes/${colecao.slug}`} target="_blank">
                        <ExternalLink className="h-5 w-5" />
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Desktop View */}
      <Card className="hidden md:block overflow-hidden border-white/10 bg-black/20">
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
                        <span>{colecao._count.fotos}</span>
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
        currentPage={page}
        totalPages={totalPages}
        baseUrl="/dashboard/fotografo/colecoes"
        searchParams={searchParams}
      />
    </div>
  );
}
