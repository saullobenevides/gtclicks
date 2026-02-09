import { getCollectionsByPhotographerUsername } from "@/lib/data/marketplace";
import { CollectionCard } from "@/components/shared/cards";
import { Card, CardContent } from "@/components/ui/card";
import { ImageIcon } from "lucide-react";
import AppPagination from "@/components/shared/AppPagination";

type SearchParams = Record<string, string | string[] | undefined>;

function toFlatParams(p: SearchParams): Record<string, string> {
  return Object.fromEntries(
    Object.entries(p)
      .filter(([, v]) => v != null && v !== "")
      .map(([k, v]) => [k, Array.isArray(v) ? v[0] ?? "" : String(v)])
  );
}

interface PhotographerCollectionsProps {
  username: string;
  page: number;
  searchParams: SearchParams;
}

export default async function PhotographerCollections({
  username,
  page,
  searchParams,
}: PhotographerCollectionsProps) {
  const { data: collections, metadata } =
    await getCollectionsByPhotographerUsername(username, page);

  const flatParams = toFlatParams(searchParams);
  const totalPages = metadata.totalPages ?? 1;

  return (
    <section
      className="space-y-4 md:space-y-6"
      aria-labelledby="colecoes-heading"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2
          id="colecoes-heading"
          className="text-xl font-bold sm:text-2xl text-foreground"
        >
          Coleções
        </h2>
        <p className="text-sm text-muted-foreground">
          {collections.length} coleções publicadas
        </p>
      </div>

      {collections.length === 0 ? (
        <Card className="glass-panel border-dashed border-border/50 bg-transparent overflow-hidden">
          <CardContent className="py-12 px-4 text-center">
            <ImageIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-lg font-medium text-foreground">
              Nenhuma coleção publicada
            </p>
            <p className="text-muted-foreground mt-1">
              Este fotógrafo ainda não publicou nenhuma coleção.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {collections.map((collection, index) => (
              <CollectionCard
                key={collection.id ?? index}
                collection={collection}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-8 flex flex-col items-center gap-3">
              <p className="text-sm text-muted-foreground">
                Página {metadata.page} de {totalPages}
              </p>
              <AppPagination
                currentPage={metadata.page ?? 1}
                totalPages={totalPages}
                baseUrl={`/fotografo/${username}`}
                searchParams={flatParams}
                aria-label="Paginação das coleções"
              />
            </div>
          )}
        </>
      )}
    </section>
  );
}
