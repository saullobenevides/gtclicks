import { getPhotographerByUsername, getCollectionsByPhotographerUsername } from "@/lib/data/marketplace";

import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MapPin, Camera, Image as ImageIcon, Download, Share2 } from "lucide-react";
import ShareButton from "@/components/ShareButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export async function generateMetadata({ params }) {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username);
  const photographer = await getPhotographerByUsername(decodedUsername);

  if (!photographer) {
    return {
      title: "Fotógrafo não encontrado | GTClicks",
    };
  }

  return {
    title: `${photographer.name} (@${photographer.username}) | GTClicks`,
    description: photographer.bio || `Confira o portfólio de ${photographer.name} no GTClicks.`,
    openGraph: {
      title: `${photographer.name} - Portfólio`,
      description: photographer.bio,
      images: photographer.avatarUrl ? [photographer.avatarUrl] : [],
    },
  };
}

export default async function PhotographerProfilePage(props) {
  try {
    const params = await props.params;

    const rawUsername = params.username ? decodeURIComponent(params.username) : '';
    const username = rawUsername;
    
    const photographer = await getPhotographerByUsername(username);

    if (!photographer) {
      notFound();
    }

    // Fetch photographer collections directly from DB
    const collections = await getCollectionsByPhotographerUsername(username);
    const totalPhotos = collections.reduce((acc, col) => acc + (col.totalPhotos || 0), 0);

    return (
      <div className="min-h-screen pb-20">
        {/* Immersive Header */}
        <div className="relative min-h-[450px] w-full overflow-hidden md:h-[400px]">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-black/60 to-black z-10" />
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20 z-0" />
          
          {/* Optional Cover Image - using a gradient fallback for now */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-800" />
          
          <div className="container-wide relative z-20 flex h-full flex-col justify-end pb-8 pt-20 md:pb-12">
            <div className="flex flex-col items-start gap-4 md:flex-row md:items-end md:gap-6">
              <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary to-orange-500 opacity-75 blur-sm" />
                <Avatar className="h-32 w-32 border-4 border-black md:h-40 md:w-40">
                  <AvatarImage src={photographer.avatarUrl} alt={photographer.name} className="object-cover" />
                  <AvatarFallback className="bg-muted text-4xl font-bold">
                    {photographer.name?.charAt(0) || photographer.username?.charAt(1)}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold text-white md:text-5xl">{photographer.name || photographer.username}</h1>
                  <Badge variant="secondary" className="glass-panel text-white">Pro</Badge>
                </div>
                <p className="text-lg text-gray-300">{photographer.username}</p>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                  {(photographer.city || photographer.state) && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {photographer.cityState || photographer.city || photographer.state}
                    </div>
                  )}
                  {photographer.instagram && (
                    <a href={`https://instagram.com/${photographer.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                      {photographer.instagram}
                    </a>
                  )}
                  <div className="flex items-center gap-1">
                    <Camera className="h-4 w-4" />
                    Fotógrafo desde {new Date().getFullYear()}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  Seguir
                </Button>
                <ShareButton 
                   title={`Portfólio de ${photographer.name}`}
                   text={`Confira o trabalho de ${photographer.name} no GTClicks!`}
                   className="glass-panel border-white/10 text-white hover:bg-white/10"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="container-wide mt-6 grid grid-cols-1 gap-12 lg:mt-12 lg:grid-cols-[1fr_300px]">
          {/* Main Content */}
          <div className="space-y-12">
            {/* Stats Grid - Mobile Only (Hidden on Desktop, moved to sidebar) */}
            <div className="grid grid-cols-3 gap-4 lg:hidden">
              <StatsCard label="Coleções" value={collections.length || 0} icon={<ImageIcon className="h-4 w-4" />} />
              <StatsCard label="Fotos" value={totalPhotos} icon={<Camera className="h-4 w-4" />} />
              <StatsCard label="Downloads" value={photographer.downloads || 0} icon={<Download className="h-4 w-4" />} />
            </div>

            {/* Bio */}
            {photographer.bio && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">Sobre</h2>
                <p className="text-lg leading-relaxed text-muted-foreground">{photographer.bio}</p>
              </div>
            )}

            {/* Collections Grid */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Coleções</h2>
                <div className="text-sm text-muted-foreground">{collections.length} coleções publicadas</div>
              </div>

              {collections.length === 0 ? (
                <Card className="glass-panel border-dashed border-white/10 bg-transparent py-12 text-center">
                  <CardContent>
                    <ImageIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                    <p className="text-lg font-medium text-white">Nenhuma coleção publicada</p>
                    <p className="text-muted-foreground">Este fotógrafo ainda não publicou nenhuma coleção.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-2">
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
                        key={collection.id ?? index}
                        href={`/colecoes/${collection.slug}`}
                        className="group bg-card border rounded-lg overflow-hidden transition cursor-pointer hover:-translate-y-1 hover:shadow-lg h-[400px] block"
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
              )}
            </div>
          </div>

          {/* Sidebar - Desktop Only */}
          <div className="hidden space-y-8 lg:block">
            <Card className="glass-panel border-white/10 bg-black/40 p-6">
              <h3 className="mb-6 text-lg font-bold text-white">Estatísticas</h3>
              <div className="space-y-6">
                <SidebarStat label="Coleções Publicadas" value={collections.length || 0} icon={<ImageIcon className="h-5 w-5 text-primary" />} />
                <SidebarStat label="Total de Fotos" value={totalPhotos} icon={<Camera className="h-5 w-5 text-primary" />} />
                <SidebarStat label="Total de Downloads" value={photographer.downloads || 0} icon={<Download className="h-5 w-5 text-primary" />} />
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error rendering PhotographerProfilePage:", error);
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="p-8 bg-red-900/20 border border-red-500/50 rounded-xl max-w-lg">
          <h2 className="text-2xl font-bold mb-4 text-red-500">Erro ao carregar perfil</h2>
          <p className="mb-4">Ocorreu um erro ao tentar carregar este perfil.</p>
          <pre className="bg-black/50 p-4 rounded text-xs overflow-auto">
            {error.message}
            {error.stack}
          </pre>
        </div>
      </div>
    );
  }
}

function StatsCard({ label, value, icon }) {
  return (
    <div className="glass-panel flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 p-4 text-center">
      <div className="mb-2 text-primary">{icon}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function SidebarStat({ label, value, icon }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <span className="font-bold text-white">{value}</span>
    </div>
  );
}
