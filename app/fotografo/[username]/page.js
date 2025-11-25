import { getPhotographerByUsername } from "@/lib/data/marketplace";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MapPin, Camera, Image as ImageIcon, Download, Share2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function PhotographerProfilePage(props) {
  const params = await props.params;

  const rawUsername = params.username ? decodeURIComponent(params.username) : '';
  const username = rawUsername;
  
  const photographer = await getPhotographerByUsername(username);

  if (!photographer) {
    notFound();
  }

  // Fetch photographer photos
  const photosResponse = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/fotografos/by-username/${username}/fotos`,
    { cache: 'no-store' }
  );
  
  const { data: photos = [] } = photosResponse.ok ? await photosResponse.json() : { data: [] };

  return (
    <div className="min-h-screen pb-20">
      {/* Immersive Header */}
      <div className="relative h-[300px] w-full overflow-hidden md:h-[400px]">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-black/60 to-black z-10" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20 z-0" />
        
        {/* Optional Cover Image - using a gradient fallback for now */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-800" />
        
        <div className="container-wide relative z-20 flex h-full flex-col justify-end pb-8 md:pb-12">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-end">
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
                {photographer.cidade && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {photographer.cidade}
                  </div>
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
              <Button variant="outline" size="icon" className="glass-panel border-white/10 text-white hover:bg-white/10">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-wide mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_300px]">
        {/* Main Content */}
        <div className="space-y-12">
          {/* Stats Grid - Mobile Only (Hidden on Desktop, moved to sidebar) */}
          <div className="grid grid-cols-3 gap-4 lg:hidden">
            <StatsCard label="Coleções" value={photographer.colecoesPublicadas || 0} icon={<ImageIcon className="h-4 w-4" />} />
            <StatsCard label="Fotos" value={photos.length} icon={<Camera className="h-4 w-4" />} />
            <StatsCard label="Downloads" value={photographer.downloads || 0} icon={<Download className="h-4 w-4" />} />
          </div>

          {/* Bio */}
          {photographer.bio && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Sobre</h2>
              <p className="text-lg leading-relaxed text-muted-foreground">{photographer.bio}</p>
            </div>
          )}

          {/* Photos Grid */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Galeria</h2>
              <div className="text-sm text-muted-foreground">{photos.length} fotos publicadas</div>
            </div>

            {photos.length === 0 ? (
              <Card className="glass-panel border-dashed border-white/10 bg-transparent py-12 text-center">
                <CardContent>
                  <Camera className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                  <p className="text-lg font-medium text-white">Nenhuma foto publicada</p>
                  <p className="text-muted-foreground">Este fotógrafo ainda não publicou nenhuma foto.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {photos.map((foto) => (
                  <Link
                    key={foto.id}
                    href={`/foto/${foto.id}`}
                    className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-muted transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10"
                  >
                    {foto.previewUrl ? (
                      <img 
                        src={foto.previewUrl} 
                        alt={foto.titulo} 
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                        <ImageIcon className="h-12 w-12 opacity-20" />
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    
                    <div className="absolute bottom-0 left-0 w-full p-4 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <h3 className="font-bold text-white line-clamp-1">{foto.titulo}</h3>
                      {foto.categoria && (
                        <span className="text-xs text-gray-300">{foto.categoria}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Desktop Only */}
        <div className="hidden space-y-8 lg:block">
          <Card className="glass-panel border-white/10 bg-black/40 p-6">
            <h3 className="mb-6 text-lg font-bold text-white">Estatísticas</h3>
            <div className="space-y-6">
              <SidebarStat label="Coleções Publicadas" value={photographer.colecoesPublicadas || 0} icon={<ImageIcon className="h-5 w-5 text-primary" />} />
              <SidebarStat label="Total de Fotos" value={photos.length} icon={<Camera className="h-5 w-5 text-primary" />} />
              <SidebarStat label="Total de Downloads" value={photographer.downloads || 0} icon={<Download className="h-5 w-5 text-primary" />} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
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
