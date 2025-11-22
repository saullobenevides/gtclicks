import Link from "next/link";
import { searchPhotos } from "@/lib/data/marketplace";
import { CATEGORIES } from "@/lib/constants";
import styles from "./page.module.css";

export default async function SearchPage({ searchParams }) {
  const filters = {
    q: searchParams?.q ?? "",
    cor: searchParams?.cor ?? "",
    orientacao: searchParams?.orientacao ?? "",
    categoria: searchParams?.categoria ?? "",
  };

  const results = await searchPhotos(filters);

  return (
    <div className="container">
      <section className={styles.page}>
        <div className={styles.header}>
          <span className="pill">Busca</span>
          <h1>Encontre a foto perfeita</h1>
          <p>
            Explore nosso acervo de fotos exclusivas. Use os filtros para refinar
            sua busca por cor, orientação ou tema.
          </p>
        </div>

        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <form method="get">
              <div className={styles.filterGroup}>
                <label htmlFor="q">Palavra-chave</label>
                <input
                  id="q"
                  name="q"
                  placeholder="Ex: natureza, retrato..."
                  defaultValue={filters.q}
                />
              </div>
              
              <div className={styles.filterGroup}>
                <label htmlFor="cor">Cor predominante</label>
                <select id="cor" name="cor" defaultValue={filters.cor}>
                  <option value="">Todas as cores</option>
                  <option value="azul">Azul</option>
                  <option value="verde">Verde</option>
                  <option value="vermelho">Vermelho</option>
                  <option value="amarelo">Amarelo</option>
                  <option value="preto">Preto</option>
                  <option value="branco">Branco</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label htmlFor="categoria">Categoria</label>
                <select id="categoria" name="categoria" defaultValue={filters.categoria}>
                  <option value="">Todas as categorias</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label htmlFor="orientacao">Orientação</label>
                <select id="orientacao" name="orientacao" defaultValue={filters.orientacao}>
                  <option value="">Qualquer formato</option>
                  <option value="horizontal">Horizontal</option>
                  <option value="vertical">Vertical</option>
                  <option value="panoramica">Panorâmica</option>
                </select>
              </div>

              <div className={styles.buttonRow}>
                <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                  Aplicar Filtros
                </button>
              </div>
              {Object.values(filters).some(Boolean) && (
                <div style={{ marginTop: "1rem", textAlign: "center" }}>
                  <Link href="/busca" className="btn btn-outline" style={{ width: "100%", fontSize: "0.85rem" }}>
                    Limpar tudo
                  </Link>
                </div>
              )}
            </form>
          </aside>

          <div className={styles.resultsGrid}>
            {results.length === 0 ? (
              <div className={styles.emptyState}>
                <h3>Nenhum resultado encontrado</h3>
                <p>Tente ajustar seus filtros ou buscar por termos mais genéricos.</p>
              </div>
            ) : (
              results.map((result) => (
                <Link key={result.id} href={`/foto/${result.id}`} className={styles.photoCard}>
                  {/* Placeholder for actual image if available, using div for now */}
                  <div 
                    className={styles.photoCardImage}
                    style={{ 
                      backgroundColor: result.corPredominante === 'preto' ? '#333' : 
                                     result.corPredominante === 'branco' ? '#eee' : 
                                     result.corPredominante === 'azul' ? '#3b82f6' :
                                     'var(--color-surface-hover)',
                      width: '100%',
                      height: '100%'
                    }}
                  />
                  <div className={styles.photoCardOverlay}>
                    <h3>{result.titulo}</h3>
                    <p>{result.orientacao} • {result.corPredominante || "Multicolor"}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
