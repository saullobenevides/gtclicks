import Link from "next/link";
import { getCollections } from "@/lib/data/marketplace";
import styles from "./page.module.css";

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <div className="container">
      <section className={styles.page}>
        <div className={styles.header}>
          <span className="pill">Coleções</span>
          <h1>Séries Exclusivas</h1>
          <p>
            Navegue por coleções completas com curadoria especial. Encontre a narrativa
            visual perfeita para sua marca ou projeto.
          </p>
        </div>

        <div className={styles.grid}>
          {collections.map((collection, index) => {
            const backgroundStyle =
              collection.cover?.startsWith("http") && collection.cover.includes("://")
                ? `url(${collection.cover})`
                : collection.cover;

            return (
              <Link
                key={collection.slug ?? index}
                href={`/colecoes/${collection.slug}`}
                className={styles.card}
                style={{ backgroundImage: backgroundStyle, backgroundSize: 'cover', backgroundPosition: 'center' }}
              >
                <div className={styles.content}>
                  <h3>{collection.name}</h3>
                  <p>{collection.description}</p>
                  <div className={styles.meta}>
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
