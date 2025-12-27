import Link from 'next/link';
import ImageWithFallback from '@/components/shared/ImageWithFallback';

export default function FeaturedCollections({ collections = [], title = "Coleções em Destaque", subtitle = "Séries autorais selecionadas para inspirar sua próxima criação" }) {
  if (!collections || collections.length === 0) return null;

  return (
    <section className="py-16">
      <div className="container-wide">
        <div className="mb-16 flex flex-col items-center text-center gap-3">
          <h2 className="heading-section font-display text-4xl font-black text-white sm:text-5xl lg:text-6xl">
            {title}
          </h2>
          {subtitle && (
            <p className="max-w-2xl text-base text-gray-400 font-medium">
              {subtitle}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection, index) => {
            const isUrl = collection.cover?.startsWith("http");
            const isGradient = collection.cover?.startsWith("linear-gradient");
            
            return (
              <Link
                key={collection.slug ?? index}
                href={`/colecoes/${collection.slug}`}
                className="group relative rounded-2xl overflow-hidden transition-all duration-500 cursor-pointer hover:shadow-2xl hover:shadow-primary/20 hover:scale-[1.02] aspect-[3/4] block border border-white/5"
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
                <div className="absolute inset-0 p-8 bg-gradient-to-t from-black via-black/60 to-transparent flex flex-col justify-end z-10 transition-all duration-500 group-hover:from-black/90">
                  <h3 className="text-2xl font-black mb-3 text-white leading-tight uppercase tracking-wide">{collection.name}</h3>
                  <p className="text-gray-300 text-sm mb-5 line-clamp-3 leading-relaxed">{collection.description}</p>
                  <div className="flex justify-between text-xs text-gray-400 font-bold uppercase tracking-widest">
                    <span>{collection.totalPhotos || 0} fotos</span>
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
