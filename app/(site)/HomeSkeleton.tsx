/**
 * Skeleton exibido enquanto os dados da home carregam.
 * Mantém o layout estável e evita CLS.
 */
export default function HomeSkeleton() {
  return (
    <div className="flex flex-col gap-16 pb-24 md:pb-0">
      <section className="container-wide space-y-6">
        <div className="h-8 w-64 bg-surface-subtle rounded-radius-md animate-pulse" />
        <div className="h-4 w-96 bg-surface-subtle rounded-radius-md animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="aspect-[4/3] bg-surface-subtle rounded-radius-lg animate-pulse"
            />
          ))}
        </div>
      </section>

      <section className="container-wide space-y-6">
        <div className="h-8 w-56 bg-surface-subtle rounded-radius-md animate-pulse" />
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 w-24 shrink-0 bg-surface-subtle rounded-radius-lg animate-pulse"
            />
          ))}
        </div>
      </section>

      <section className="container-wide space-y-6">
        <div className="h-8 w-48 bg-surface-subtle rounded-radius-md animate-pulse" />
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 bg-surface-subtle rounded-radius-md animate-pulse"
            />
          ))}
        </div>
      </section>
    </div>
  );
}
