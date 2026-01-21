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
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Images, PlusCircle, Edit, ExternalLink } from "lucide-react";
import CreateCollectionButton from "@/features/collections/components/CreateCollectionButton";

const formatDate = (date) => {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

export default async function MinhasColecoesPage() {
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
    return (
      <div className="container">
        <p>Perfil de fotógrafo não encontrado.</p>
      </div>
    );
  }

  const colecoes = await prisma.colecao.findMany({
    where: { fotografoId: fotografo.id },
    include: {
      _count: {
        select: { fotos: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Minhas Coleções</h1>
          <p className="text-muted-foreground">
            Gerencie todas as suas coleções de fotos.
          </p>
        </div>
        <CreateCollectionButton />
      </div>

      <Card className="overflow-hidden border-white/10 bg-black/20">
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
    </div>
  );
}
