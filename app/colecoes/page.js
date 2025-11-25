import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getCollections } from "@/lib/data/marketplace";

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <div className="container-wide">
      <section className="py-16">
        <div className="text-center mb-16">
          <Badge>Coleções</Badge>
          <h1 className="text-5xl font-bold mb-4 text-heading">Séries Exclusivas</h1>
          <p className="text-xl text-body">
            Navegue por coleções completas com curadoria especial. Encontre a narrativa
            visual perfeita para sua marca ou projeto.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map((collection, index) => {
            const backgroundStyle =
              collection.cover?.startsWith("http") && collection.cover.includes("://")
                ? { backgroundImage: `url(${collection.cover})` }
                : { backgroundColor: collection.cover };

            return (
              <Link
                key={collection.slug ?? index}
                href={`/colecoes/${collection.slug}`}
                className="group bg-card border rounded-lg overflow-hidden transition cursor-pointer hover:-translate-y-1 hover:shadow-lg"
                style={{ ...backgroundStyle, backgroundSize: 'cover', backgroundPosition: 'center' }}
              >
                <div className="p-6 bg-black/50 h-full flex flex-col justify-end">
                  <h3 className="text-xl font-bold mb-2 text-white">{collection.name}</h3>
                  <p className="text-white/80 text-sm mb-4">{collection.description}</p>
                  <div className="flex justify-between text-xs text-white/70">
                    <span>{collection.totalPhotos} fotos</span>
                    <span>Por {collection.photographerName}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
