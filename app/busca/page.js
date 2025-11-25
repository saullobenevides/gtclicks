import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ImageWithFallback from '@/components/ImageWithFallback';
import { searchPhotos } from '@/lib/data/marketplace';
import { CATEGORIES } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

function SearchFilters({ filters }) {
  return (
    <aside className="sticky top-24 h-fit">
      <form method="get">
        <Card className="glass-panel border-white/10 bg-black/40">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-white">Filtros</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="q" className="text-gray-400">Palavra-chave</Label>
              <Input
                id="q"
                name="q"
                placeholder="Ex: natureza, retrato..."
                defaultValue={filters.q}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-primary/50 focus:ring-primary/20"
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <Label htmlFor="cor" className="text-gray-400">Cor predominante</Label>
              <Select name="cor" defaultValue={filters.cor}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-primary/20">
                  <SelectValue placeholder="Todas as cores" />
                </SelectTrigger>
                <SelectContent className="bg-black border-white/10 text-white">
                  <SelectItem value="all">Todas as cores</SelectItem>
                  <SelectItem value="azul">Azul</SelectItem>
                  <SelectItem value="verde">Verde</SelectItem>
                  <SelectItem value="vermelho">Vermelho</SelectItem>
                  <SelectItem value="amarelo">Amarelo</SelectItem>
                  <SelectItem value="preto">Preto</SelectItem>
                  <SelectItem value="branco">Branco</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid w-full items-center gap-2">
              <Label htmlFor="categoria" className="text-gray-400">Categoria</Label>
              <Select name="categoria" defaultValue={filters.categoria}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-primary/20">
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent className="bg-black border-white/10 text-white">
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid w-full items-center gap-2">
              <Label htmlFor="orientacao" className="text-gray-400">Orientação</Label>
              <Select name="orientacao" defaultValue={filters.orientacao}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-primary/20">
                  <SelectValue placeholder="Qualquer formato" />
                </SelectTrigger>
                <SelectContent className="bg-black border-white/10 text-white">
                  <SelectItem value="all">Qualquer formato</SelectItem>
                  <SelectItem value="horizontal">Horizontal</SelectItem>
                  <SelectItem value="vertical">Vertical</SelectItem>
                  <SelectItem value="panoramica">Panorâmica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pt-2">
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-semibold">
              Aplicar Filtros
            </Button>
            {Object.values(filters).some(Boolean) && (
              <Button asChild variant="ghost" className="w-full text-gray-400 hover:text-white hover:bg-white/5">
                <Link href="/busca">Limpar tudo</Link>
              </Button>
            )}
          </CardFooter>
        </Card>
      </form>
    </aside>
  );
}

export default async function SearchPage(props) {
  const searchParams = await props.searchParams;
  const rawFilters = {
    q: searchParams?.q ?? '',
    cor: searchParams?.cor ?? '',
    orientacao: searchParams?.orientacao ?? '',
    categoria: searchParams?.categoria ?? '',
  };

  const filters = Object.entries(rawFilters).reduce((acc, [key, value]) => {
    acc[key] = value === 'all' ? '' : value;
    return acc;
  }, {});

  const results = await searchPhotos(filters);

  return (
    <div className="container-wide py-24">
      <div className="mb-16 flex flex-col items-center text-center">
        <Badge variant="outline" className="mb-4 border-primary/50 text-primary bg-primary/10 px-4 py-1">
          Explore
        </Badge>
        <h1 className="text-5xl font-black tracking-tighter text-white sm:text-6xl">
          Encontre a foto <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-600">perfeita</span>
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-gray-400">
          Explore nosso acervo de fotos exclusivas. Use os filtros para refinar
          sua busca e encontrar exatamente o que você precisa.
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[300px_1fr]">
        <SearchFilters filters={rawFilters} />

        <main>
          {results.length === 0 ? (
            <Card className="col-span-full py-24 px-8 text-center glass-panel border-dashed border-white/10 bg-transparent">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Nenhum resultado encontrado</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-lg">
                  Tente ajustar seus filtros ou buscar por termos mais genéricos.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((result) => (
                <Link key={result.id} href={`/foto/${result.id}`}>
                  <Card className="group relative overflow-hidden rounded-2xl border-0 bg-gray-900 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10">
                    <CardContent className="aspect-[4/3] relative p-0">
                      <ImageWithFallback
                        src={result.previewUrl}
                        alt={result.titulo}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      
                      <div className="absolute bottom-0 left-0 w-full p-6 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        <h3 className="font-bold text-white text-lg mb-1">{result.titulo}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <Badge variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-0">
                            {result.orientacao}
                          </Badge>
                          {result.corPredominante && (
                            <Badge variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-0">
                              {result.corPredominante}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
