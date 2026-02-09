import Link from "next/link";
import { searchPhotographers } from "@/lib/data/marketplace";
import type { SearchFilters } from "@/lib/data/marketplace";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Camera, MapPin, ChevronRight, Instagram } from "lucide-react";
import AppPagination from "@/components/shared/AppPagination";
import EmptyState from "@/components/shared/states/EmptyState";

type SearchParams = Record<string, string | string[] | undefined>;

function toFlatParams(p: SearchParams): Record<string, string> {
  return Object.fromEntries(
    Object.entries(p)
      .filter(([, v]) => v != null && v !== "")
      .map(([k, v]) => [k, Array.isArray(v) ? v[0] ?? "" : String(v)])
  );
}

interface FotografosResultsProps {
  filters: SearchFilters;
  searchParams: SearchParams;
}

export default async function FotografosResults({
  filters,
  searchParams,
}: FotografosResultsProps) {
  const flatParams = toFlatParams(searchParams);
  const { data: fotografos, metadata } = await searchPhotographers(filters);
  const totalPages = metadata.totalPages;

  if (fotografos.length === 0) {
    return (
      <EmptyState
        icon={Camera}
        title="Nenhum fotógrafo encontrado"
        description="Tente outros filtros ou explore nossas categorias."
        action={{ label: "Explorar categorias", href: "/categorias" }}
        variant="default"
        className="py-20 bg-surface-subtle/50 rounded-radius-2xl border-2 border-dashed border-border-subtle"
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
        {fotografos.map((fotografo) => (
          <Link
            key={fotografo.id}
            href={`/fotografo/${fotografo.username}`}
            className="group"
          >
            <Card className="h-full border-2 border-border-subtle hover:border-primary/50 bg-surface-card transition-all duration-300 hover:-translate-y-1 overflow-hidden">
              <CardContent className="p-0">
                <div className="h-32 bg-gradient-to-br from-primary/10 via-surface-subtle to-surface-card relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-primary to-transparent" />
                </div>

                <div className="px-6 pb-6 relative">
                  <div className="flex justify-between items-end -mt-12 mb-4">
                    <Avatar className="h-24 w-24 border-4 border-surface-card bg-surface-card shadow-shadow-lg">
                      <AvatarImage
                        src={fotografo.user?.image ?? undefined}
                        alt={fotografo.user?.name ?? undefined}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-2xl font-black bg-primary text-white">
                        {fotografo.user?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-surface-subtle text-text-secondary text-[10px] uppercase font-black tracking-widest border-border-subtle"
                      >
                        {fotografo._count?.colecoes ?? 0} Coleções
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h3 className="text-xl font-black text-white group-hover:text-primary transition-colors truncate">
                        {fotografo.user?.name || fotografo.username}
                      </h3>
                      <p className="text-sm text-text-muted">
                        @{fotografo.username}
                      </p>
                    </div>

                    {fotografo.bio && (
                      <p className="text-sm text-text-secondary line-clamp-2 min-h-[40px]">
                        {fotografo.bio}
                      </p>
                    )}

                    <div className="flex flex-col gap-2 pt-2 border-t border-border-subtle">
                      {(fotografo.cidade || fotografo.estado) && (
                        <div className="flex items-center gap-2 text-xs text-text-muted">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                          <span>
                            {fotografo.cidade}
                            {fotografo.cidade && fotografo.estado ? ", " : ""}
                            {fotografo.estado}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-text-muted">
                        <Camera className="h-3.5 w-3.5 text-primary" />
                        <span>
                          {fotografo.especialidades?.[0] ||
                            "Fotografia Profissional"}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 flex items-center justify-between">
                      <div className="flex gap-2">
                        {fotografo.instagram && (
                          <Instagram className="h-4 w-4 text-text-muted hover:text-primary cursor-pointer transition-colors" />
                        )}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Ver Perfil <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-12">
          <AppPagination
            currentPage={metadata.page}
            totalPages={totalPages}
            baseUrl="/fotografos"
            searchParams={flatParams}
          />
        </div>
      )}
    </>
  );
}
