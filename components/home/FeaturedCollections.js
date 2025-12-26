import Link from 'next/link';
import ImageWithFallback from '@/components/shared/ImageWithFallback';

export default function FeaturedCollections({ collections = [] }) {
  if (!collections || collections.length === 0) return null;

  return (
    <section className="">
      <div className="container-wide">
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
            
            return (
              <Link
                key={collection.slug ?? index}
                href={`/colecoes/${collection.slug}`}
                className="group relative bg-card border rounded-lg overflow-hidden transition cursor-pointer hover:-translate-y-1 hover:shadow-lg aspect-square block"
              >
                {/* Background Image */}
                {isUrl ? (
                  <ImageWithFallback
                    src={collection.cover}
                    alt={collection.name}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={index < 2}
                  />
                ) : (
                  <div 
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    style={isGradient ? { backgroundImage: collection.cover } : { backgroundColor: collection.cover }}
                  />
                )}

                {/* Content Overlay */}
                <div className="absolute inset-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end z-10">
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
  );
}
