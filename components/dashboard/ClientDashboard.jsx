'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Download, Camera, Heart } from "lucide-react";

export default function ClientDashboard({ user }) {
  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-3xl font-bold">Olá, {user?.displayName || 'Cliente'}</h1>
            <p className="text-muted-foreground mt-1">Bem-vindo ao seu painel.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card: Meus Downloads */}
        <Card className="flex flex-col h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5 text-primary"/> 
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

        {/* Card: Favoritos */}
        <Card className="flex flex-col h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500"/> 
                    Favoritos
                </CardTitle>
                <CardDescription>
                    Suas fotos e coleções salvas.
                </CardDescription>
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

        {/* Card: Fotógrafo */}
        <Card className="flex flex-col h-full border-primary/50 bg-primary/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -mr-12 -mt-12" />
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-primary"/> 
                    Área do Fotógrafo
                </CardTitle>
                <CardDescription>
                    Venda suas fotos na plataforma.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground">
                    Cadastre-se como fotógrafo, publique seus trabalhos e receba pagamentos via Pix.
                </p>
            </CardContent>
            <CardFooter>
                <Button asChild className="w-full" variant="default">
                    <Link href="/dashboard/fotografo">Começar Agora</Link>
                </Button>
            </CardFooter>
        </Card>
      </div>
    </div>
  );
}
