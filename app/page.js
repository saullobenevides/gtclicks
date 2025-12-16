import Link from 'next/link';
import { getHomepageData } from '@/lib/data/marketplace';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';

const quickLinks = [
  {
    title: 'Coleções',
    description: 'Descubra álbuns completos',
    href: '/colecoes',
    icon: '📚'
  },
  {
    title: 'Buscar coleções',
    description: 'Filtre por tema, categoria ou cor',
    href: '/busca',
    icon: '🔍'
  },
  {
    title: 'Seja Fotógrafo',
    description: 'Comece a vender suas fotos',
    href: '/cadastro',
    icon: '📸'
  },
];

export default async function Home() {
  const { collections = [], photographers = [], highlights = [] } =
    await getHomepageData();

  return (
    <div className="flex flex-col gap-24 pb-24">
      {/* Hero Section */}
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-6 text-center">
        {/* Dynamic Background */}
        <div className="absolute inset-0 -z-20 bg-black" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-black/50 to-black" />
        <div className="absolute inset-0 -z-10 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

        <div className="z-10 flex max-w-5xl flex-col items-center gap-8 animate-in fade-in zoom-in duration-700">
          <Badge variant="outline" className="border-primary/50 text-primary bg-primary/10 px-6 py-2 text-sm uppercase tracking-[0.2em] backdrop-blur-sm">
            Marketplace Premium
          </Badge>
          
          <h1 className="text-5xl font-black tracking-tighter text-white sm:text-7xl md:text-8xl lg:text-9xl leading-none">
            CAPTURE <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-600">MOMENTOS</span>
            <br />
            VENDA <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">ARTE</span>
          </h1>
          
          <p className="max-w-2xl text-xl text-gray-400 md:text-2xl leading-relaxed font-light">
            A plataforma definitiva para fotógrafos profissionais. 
            Compre e venda imagens exclusivas com segurança e estilo.
          </p>
          
          <div className="mt-10 flex flex-col w-full sm:w-auto sm:flex-row gap-6">
            <Button asChild size="lg" className="h-14 px-10 text-lg bg-primary hover:bg-primary/90 text-white shadow-[0_0_30px_rgba(239,35,60,0.3)] hover:shadow-[0_0_50px_rgba(239,35,60,0.5)] transition-all hover:-translate-y-1">
              <Link href="/busca">Explorar Galeria</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 px-10 text-lg border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 backdrop-blur-sm transition-all hover:-translate-y-1">
              <Link href="/cadastro">Começar a Vender</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Collections Section */}
      <section className="">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 flex flex-col items-center text-center gap-4">
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Coleções em Destaque
            </h2>
            <p className="max-w-2xl text-lg text-gray-400">
              Séries autorais selecionadas para inspirar sua próxima criação.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {collections.map((collection, index) => {
              const isUrl = collection.cover?.startsWith("http");
              const isGradient = collection.cover?.startsWith("linear-gradient");
              
              const backgroundStyle = isUrl
                ? { backgroundImage: `url(${collection.cover})` }
                : isGradient
                ? { backgroundImage: collection.cover }
                : { backgroundColor: collection.cover };

            return (
              <Link
                key={collection.slug ?? index}
                href={`/colecoes/${collection.slug}`}
                className="group bg-card border rounded-lg overflow-hidden transition cursor-pointer hover:-translate-y-1 hover:shadow-lg aspect-video block"
                style={{ ...backgroundStyle, backgroundSize: 'cover', backgroundPosition: 'center' }}
              >
                <div className="p-6 bg-black/50 h-full flex flex-col justify-end">
                  <h3 className="text-xl font-bold mb-2 text-white">{collection.name}</h3>
                  <p className="text-white/80 text-sm mb-4 line-clamp-2">{collection.description}</p>
                  <div className="flex justify-between text-xs text-white/70">
                    <span>{collection.totalPhotos || 0} fotos</span>
                    <span>Por {collection.photographerName || 'GT Clicks'}</span>
                  </div>
                </div>
              </Link>
            );
          })}
          </div>
        </div>
      </section>

      {/* Photographers Section */}
      <section className="bg-white/5 py-24 border-y border-white/5">
        <div className="container-wide">
          <div className="mb-16 flex flex-col items-center text-center gap-4">
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Criadores
            </h2>
            <p className="max-w-2xl text-lg text-gray-400">
              Conheça os talentos por trás das lentes.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {photographers.map((photographer) => (
              <Link
                key={photographer.username}
                href={`/fotografo/${photographer.username}`}
                className="group block"
              >
                <Card className="glass-panel flex h-full flex-col items-center justify-center p-8 text-center transition-all duration-300 hover:border-primary/50 hover:bg-white/10">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl opacity-0 transition-opacity group-hover:opacity-100" />
                    <Avatar className="h-24 w-24 border-2 border-white/10 group-hover:border-primary transition-colors relative">
                      <AvatarImage
                        src={photographer.avatarUrl}
                        alt={photographer.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-white/10 text-white text-xl">
                        {photographer.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <CardHeader className="p-0">
                    <CardTitle className="text-xl font-bold text-white mb-1">
                      {photographer.name}
                    </CardTitle>
                    <p className="text-sm text-primary font-medium uppercase tracking-wider">
                      {photographer.city}
                    </p>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container-wide">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {highlights.map((item, index) => (
            <Card key={index} className="glass-panel p-8 transition-all hover:bg-white/5">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-2xl font-bold text-white">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-gray-400 leading-relaxed">{item.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container-wide pb-12">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-black p-12 text-center md:p-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
          
          <div className="relative z-10">
            <h2 className="mb-8 text-3xl font-bold text-white md:text-5xl">
              Pronto para começar?
            </h2>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 max-w-4xl mx-auto mt-12">
              {quickLinks.map((link) => (
                <Link key={link.href} href={link.href} className="group block">
                  <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/5 bg-black/50 p-8 transition-all hover:border-primary/50 hover:bg-white/5 hover:-translate-y-1">
                    <span className="text-4xl mb-2 grayscale group-hover:grayscale-0 transition-all">{link.icon}</span>
                    <div className="space-y-2">
                      <h3 className="font-bold text-white text-lg">{link.title}</h3>
                      <p className="text-sm text-gray-400">{link.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
