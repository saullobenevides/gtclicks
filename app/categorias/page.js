import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";
import styles from "./page.module.css";

export default function CategoriesPage() {
  return (
    <div className="container">
      <div className={styles.page}>
        <div className={styles.header}>
          <span className="pill">Categorias</span>
          <h1>Explore por temas</h1>
          <p>
            Navegue por nossas categorias selecionadas e encontre exatamente o que
            você procura para o seu projeto.
          </p>
        </div>

        <div className={styles.grid}>
          {CATEGORIES.map((category) => (
            <Link
              key={category}
              href={`/busca?categoria=${category}`}
              className={styles.card}
            >
              <div className={styles.cardContent}>
                <h2>{category}</h2>
                <span className={styles.linkText}>Ver fotos &rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
