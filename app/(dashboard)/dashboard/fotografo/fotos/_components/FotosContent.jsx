"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ResponsiveGrid } from "@/components/shared/layout";
import { EmptyState } from "@/components/shared/states";
import { ImageIcon, FolderPlus } from "lucide-react";
import PhotoCard from "@/components/shared/cards/PhotoCard";

export default function FotosContent({ fotos }) {
  return (
    <div className="flex flex-col gap-6 md:gap-8 p-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="heading-display font-display text-2xl md:text-3xl font-black text-white tracking-tight">
            Minhas Fotos
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            {fotos.length === 0
              ? "Todas as suas fotos publicadas nas coleções"
              : `${fotos.length} ${
                  fotos.length === 1 ? "foto publicada" : "fotos publicadas"
                }`}
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/dashboard/fotografo/colecoes/nova">
            <FolderPlus className="mr-2 h-4 w-4" />
            Nova Coleção
          </Link>
        </Button>
      </div>

      {fotos.length === 0 ? (
        <Card className="bg-black/20 border-white/10 overflow-hidden">
          <CardContent className="py-16 md:py-20">
            <EmptyState
              icon={ImageIcon}
              title="Nenhuma foto publicada"
              description="Crie uma coleção e adicione fotos para começar a vender. As fotos são gerenciadas dentro das suas coleções."
              action={{
                label: "Criar Coleção",
                href: "/dashboard/fotografo/colecoes/nova",
              }}
              variant="dashboard"
              className="py-0"
            />
          </CardContent>
        </Card>
      ) : (
        <ResponsiveGrid cols={{ sm: 1, md: 2, lg: 3, xl: 4 }} gap={8}>
          {fotos.map((foto) => (
            <PhotoCard
              key={foto.id}
              photo={foto}
              contextList={fotos}
              showSelection={false}
              showQuickAdd={false}
            />
          ))}
        </ResponsiveGrid>
      )}
    </div>
  );
}
