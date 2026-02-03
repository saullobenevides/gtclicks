import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16">
      <div className="text-center max-w-md">
        <h1 className="text-8xl font-black text-primary/20 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-white mb-2">
          Página não encontrada
        </h2>
        <p className="text-muted-foreground mb-8">
          O endereço que você procurou não existe ou foi movido.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="min-h-[48px]">
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Ir para início
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="min-h-[48px]">
            <Link href="/busca" className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Buscar fotos
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
