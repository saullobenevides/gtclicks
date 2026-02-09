import { Suspense } from "react";
import { getPhotographerByUsername } from "@/lib/data/marketplace";
import { notFound } from "next/navigation";
import { MapPin, Camera, Image as ImageIcon, Phone, Globe } from "lucide-react";
import ShareButton from "@/components/shared/actions/ShareButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import PageHeader from "@/components/shared/layout/PageHeader";
import PageContainer from "@/components/shared/layout/PageContainer";
import PhotographerCollections from "./PhotographerCollections";
import PhotographerCollectionsSkeleton from "./PhotographerCollectionsSkeleton";

interface PhotographerPageProps {
  params: Promise<{ username: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: PhotographerPageProps) {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username);
  const photographer = await getPhotographerByUsername(decodedUsername);

  if (!photographer) {
    return {
      title: "Fotógrafo não encontrado",
    };
  }

  return {
    title: `${photographer.name} (@${photographer.username})`,
    description:
      photographer.bio ||
      `Confira o portfólio de ${photographer.name} no GTClicks.`,
    openGraph: {
      title: `${photographer.name} - Portfólio`,
      description: photographer.bio,
      images: photographer.avatarUrl ? [photographer.avatarUrl] : [],
    },
  };
}

function SidebarStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 text-muted-foreground min-w-0">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <span className="font-bold text-foreground tabular-nums shrink-0">
        {value}
      </span>
    </div>
  );
}

export default async function PhotographerProfilePage(
  props: PhotographerPageProps
) {
  try {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const page = searchParams?.page ? parseInt(String(searchParams.page)) : 1;

    const rawUsername = params.username
      ? decodeURIComponent(params.username)
      : "";
    const username = rawUsername;

    const photographer = await getPhotographerByUsername(username);

    if (!photographer) {
      notFound();
    }

    return (
      <div className="min-h-screen pb-20 bg-background">
        <PageHeader
          backgroundImage={null}
          variant="profile"
          overlayOpacity="light"
          title={photographer.name}
        >
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-end md:gap-6">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-linear-to-r from-primary to-primary/60 opacity-80 blur-sm" />
              <Avatar className="h-32 w-32 border-4 border-black md:h-40 md:w-40 relative z-10">
                <AvatarImage
                  src={photographer.avatarUrl}
                  alt={photographer.name}
                  className="object-cover"
                />
                <AvatarFallback className="bg-muted text-4xl font-bold">
                  {photographer.name?.charAt(0) ||
                    photographer.username?.charAt(1)}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="heading-display font-display text-3xl font-black text-white sm:text-4xl md:text-5xl">
                  {photographer.name || photographer.username}
                </h1>
                <Badge variant="secondary" className="glass-panel text-white">
                  Pro
                </Badge>
              </div>
              <p className="text-lg text-muted-foreground">
                {photographer.username}
              </p>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {(photographer.city || photographer.state) && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {photographer.cityState ||
                      photographer.city ||
                      photographer.state}
                  </div>
                )}
                {photographer.instagram && (
                  <a
                    href={`https://instagram.com/${photographer.instagram.replace(
                      "@",
                      ""
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-white transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-instagram"
                    >
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                    {photographer.instagram}
                  </a>
                )}
                <div className="flex items-center gap-1">
                  <Camera className="h-4 w-4" />
                  Fotógrafo desde {new Date().getFullYear()}
                </div>
              </div>
            </div>

            <div className="w-full sm:w-auto sm:shrink-0">
              <ShareButton
                title={`Portfólio de ${photographer.name}`}
                text={`Confira o trabalho de ${photographer.name} no GTClicks!`}
                className="min-h-[48px] w-full sm:w-auto glass-panel border-white/10 text-white hover:bg-white/10"
              />
            </div>
          </div>
        </PageHeader>

        <PageContainer>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px] lg:gap-12">
            <main className="space-y-8 md:space-y-10">
              <section
                className="lg:hidden"
                aria-label="Estatísticas do fotógrafo"
              >
                <Card className="glass-panel border-border/50 overflow-hidden">
                  <CardContent className="flex flex-row items-center gap-4 p-4 sm:p-5">
                    <span className="text-primary">
                      <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </span>
                    <div>
                      <span className="text-2xl font-bold tabular-nums">
                        {photographer.colecoesPublicadas || 0}
                      </span>
                      <span className="text-sm text-muted-foreground ml-2">
                        coleções publicadas
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {photographer.bio && (
                <section className="space-y-3" aria-labelledby="sobre-heading">
                  <h2
                    id="sobre-heading"
                    className="text-xl font-bold sm:text-2xl text-foreground"
                  >
                    Sobre
                  </h2>
                  <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">
                    {photographer.bio}
                  </p>
                </section>
              )}

              {photographer.bio && <Separator className="my-8 md:my-10" />}

              {(photographer.telefone ||
                photographer.portfolioUrl ||
                photographer.especialidades?.length > 0 ||
                photographer.equipamentos) && (
                <>
                  <section
                    className="space-y-4"
                    aria-labelledby="contato-heading"
                  >
                    <h2
                      id="contato-heading"
                      className="text-xl font-bold sm:text-2xl text-foreground"
                    >
                      Contato e Profissional
                    </h2>
                    <div className="flex flex-col gap-4">
                      {photographer.telefone && (
                        <a
                          href={`https://wa.me/55${photographer.telefone.replace(
                            /\D/g,
                            ""
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Phone className="h-4 w-4 shrink-0" />
                          <span>{photographer.telefone}</span>
                        </a>
                      )}
                      {photographer.portfolioUrl && (
                        <a
                          href={photographer.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Globe className="h-4 w-4 shrink-0" />
                          <span>Portfólio externo</span>
                        </a>
                      )}
                      {photographer.especialidades?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {photographer.especialidades.map((spec) => (
                            <Badge
                              key={spec}
                              variant="secondary"
                              className="font-normal"
                            >
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {photographer.equipamentos && (
                        <div className="flex items-start gap-2">
                          <Camera className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {photographer.equipamentos}
                          </p>
                        </div>
                      )}
                    </div>
                  </section>
                  <Separator className="my-8 md:my-10" />
                </>
              )}

              <Suspense fallback={<PhotographerCollectionsSkeleton />}>
                <PhotographerCollections
                  username={username}
                  page={page}
                  searchParams={searchParams}
                />
              </Suspense>
            </main>

            <aside
              className="hidden lg:block space-y-6"
              aria-label="Estatísticas do perfil"
            >
              <Card className="glass-panel border-border/50 overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-foreground">
                    Estatísticas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-0">
                  <SidebarStat
                    label="Coleções publicadas"
                    value={photographer.colecoesPublicadas || 0}
                    icon={
                      <ImageIcon className="h-5 w-5 text-primary shrink-0" />
                    }
                  />
                </CardContent>
              </Card>
            </aside>
          </div>
        </PageContainer>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: photographer.name,
              url: `https://www.gtclicks.com/fotografo/${photographer.username}`,
              image: photographer.avatarUrl,
              description: photographer.bio,
              jobTitle: "Fotógrafo",
              sameAs: [
                photographer.instagram
                  ? `https://instagram.com/${photographer.instagram.replace(
                      "@",
                      ""
                    )}`
                  : null,
                photographer.portfolioUrl,
              ].filter(Boolean),
              knowsAbout: [
                "Fotografia Esportiva",
                "Fotografia de Eventos",
                ...(photographer.especialidades || []),
              ],
              interactionStatistic: [
                {
                  "@type": "InteractionCounter",
                  interactionType: "https://schema.org/WriteAction",
                  userInteractionCount: photographer.colecoesPublicadas || 0,
                },
              ],
            }),
          }}
        />
      </div>
    );
  } catch (error) {
    const err = error as Error;
    console.error("Error rendering PhotographerProfilePage:", error);
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="p-8 bg-red-900/20 border border-red-500/50 rounded-xl max-w-lg">
          <h2 className="text-2xl font-bold mb-4 text-red-500">
            Erro ao carregar perfil
          </h2>
          <p className="mb-4">
            Ocorreu um erro ao tentar carregar este perfil.
          </p>
          <pre className="bg-black/50 p-4 rounded text-xs overflow-auto">
            {err.message}
            {err.stack}
          </pre>
        </div>
      </div>
    );
  }
}
