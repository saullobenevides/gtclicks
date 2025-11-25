import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";
import { getCollectionBySlug } from "@/lib/data/marketplace";
import { Button } from "@/components/ui/button";

export default async function CollectionDetail({ params }) {
  const collection = await getCollectionBySlug(params.slug);

  if (!collection) {
    notFound();
  }

  return (
    <section className="py-16 container">
      <div className="text-center mb-16">
        <Badge>Coleção</Badge>
        <h1 className="text-5xl font-bold my-4">{collection.title}</h1>
        <p className="text-xl text-body">{collection.description}</p>
        <p className="text-body">
          por <strong>{collection.photographer}</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {(collection.photos ?? []).map((photo) => (
          <Link key={photo.id} href={`/foto/${photo.id}`} className="bg-card border rounded-md p-6 no-underline transition hover:-translate-y-1 hover:shadow-lg">
            <span className="text-xs py-1 px-2 bg-muted border rounded-sm text-muted-foreground">{photo.orientation}</span>
            <h3 className="mt-4 font-bold">{photo.title}</h3>
            <p className="text-sm text-muted-foreground">ID #{photo.id}</p>
          </Link>
        ))}
      </div>

      <div className="bg-card border rounded-md p-8 mt-16 max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold mb-4">Como usar esta coleção</h3>
        <p className="text-body">
          Adicione as fotos que quiser ao carrinho, escolha a licença adequada e receba
          o download imediatamente após o pagamento. Precisa de ajuda para aplicar as
          imagens no seu projeto? Entre em contato com nosso time e receba sugestões de
          combinações, cores e formatos.
        </p>
        <div className="flex gap-4 mt-8">
          <Button asChild>
            <Link href="/busca">
              Procurar mais fotos
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/carrinho">
              Ver carrinho
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
