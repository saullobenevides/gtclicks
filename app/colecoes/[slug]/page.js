import Link from "next/link";
import { notFound } from "next/navigation";
import { getCollectionBySlug } from "@/lib/data/marketplace";
import styles from "../../styles/pageShell.module.css";

export default async function CollectionDetail({ params }) {
  const collection = await getCollectionBySlug(params.slug);

  if (!collection) {
    notFound();
  }

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <span className="pill">Coleção</span>
        <h1>{collection.title}</h1>
        <p>{collection.description}</p>
        <p>
          por <strong>{collection.photographer}</strong>
        </p>
      </div>

      <div className={styles.cardGrid}>
        {(collection.photos ?? []).map((photo) => (
          <Link key={photo.id} href={`/foto/${photo.id}`} className={styles.card}>
            <span className={styles.tag}>{photo.orientation}</span>
            <h3>{photo.title}</h3>
            <p>ID #{photo.id}</p>
          </Link>
        ))}
      </div>

      <div className={styles.contentCard}>
        <h3>Como usar esta coleção</h3>
        <p>
          Adicione as fotos que quiser ao carrinho, escolha a licença adequada e receba
          o download imediatamente após o pagamento. Precisa de ajuda para aplicar as
          imagens no seu projeto? Entre em contato com nosso time e receba sugestões de
          combinações, cores e formatos.
        </p>
        <div className={styles.buttonRow}>
          <Link className={styles.primaryButton} href="/busca">
            Procurar mais fotos
          </Link>
          <Link className={styles.ghostButton} href="/carrinho">
            Ver carrinho
          </Link>
        </div>
      </div>
    </section>
  );
}
