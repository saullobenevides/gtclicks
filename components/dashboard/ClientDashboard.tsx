"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Download, Camera, Heart } from "lucide-react";

interface ClientDashboardProps {
  user?: { displayName?: string | null } | null;
}

export default function ClientDashboard({ user }: ClientDashboardProps) {
  return (
    <div className="container-wide px-4 py-10 md:py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Olá, {user?.displayName || "Cliente"}
        </h1>
        <p className="text-muted-foreground mt-1">Bem-vindo ao seu painel.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="glass-panel border-border/50 flex flex-col overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Download className="h-5 w-5 text-primary" />
              Meus Downloads
            </CardTitle>
            <CardDescription>
              Acesse todas as fotos que você comprou.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground">
              Visualize e baixe novamente suas fotos em alta resolução.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/meus-downloads">Ver Downloads</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="glass-panel border-border/50 flex flex-col overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Heart className="h-5 w-5 text-primary" />
              Favoritos
            </CardTitle>
            <CardDescription>Suas fotos e coleções salvas.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground">
              Acesse rapidamente o que você mais gostou.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/meus-favoritos">Ver Favoritos</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="glass-panel border-primary/30 flex flex-col overflow-hidden bg-primary/5 relative">
          <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-primary/10 -mr-12 -mt-12" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Camera className="h-5 w-5 text-primary" />
              Área do Fotógrafo
            </CardTitle>
            <CardDescription>Venda suas fotos na plataforma.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground">
              Cadastre-se como fotógrafo, publique seus trabalhos e receba
              pagamentos via Pix.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full" variant="default">
              <Link href="/dashboard/fotografo/onboarding">
                Criar perfil de fotógrafo
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
