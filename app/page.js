import Link from "next/link";
import { getHomepageData } from "@/lib/data/marketplace";
import styles from "./page.module.css";

const quickLinks = [
  { title: "Coleções", description: "Descubra álbuns completos", href: "/colecoes" },
  { title: "Buscar fotos", description: "Filtre por cor, tema ou formato", href: "/busca" },
  { title: "Carrinho", description: "Revise o que você selecionou", href: "/carrinho" },
  { title: "Checkout", description: "Finalize e receba seus downloads", href: "/checkout" },
];

export default async function Home() {
  const { collections = [], photographers = [], highlights = [] } = await getHomepageData();

  return (
    <div className={styles.wrapper}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className="pill">
            <span>⚡</span> Marketplace multi-fotógrafo
          </span>
          <h1>Compre e venda fotos exclusivas em poucos cliques.</h1>
          <p>
            A GTClicks reúne coleções autorais prontas para uso profissional, com
            pagamento seguro e download liberado imediatamente após a compra.
          </p>
          <div className={styles.heroActions}>
            <Link className="btn btn-primary" href="/colecoes">
              Explorar Coleções
            </Link>
            <Link className="btn btn-outline" href="/cadastro">
              Começar a Vender
            </Link>
          </div>
          <div className={styles.metricsRow}>
            <div>
              <strong>+180k</strong>
              <span>downloads</span>
            </div>
            <div>
              <strong>42</strong>
              <span>fotógrafos</span>
            </div>
            <div>
              <strong>4.9/5</strong>
              <span>avaliação</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <span className="pill">Coleções em destaque</span>
            <h2>Curadoria GTClicks</h2>
            <p>
              Selecionamos séries autorais direto dos fotógrafos cadastrados. Esses dados
              vêm do nosso banco em tempo real.
            </p>
          </div>
          <Link className={styles.sectionLink} href="/colecoes">
            Ver todas →
          </Link>
        </div>
        <div className={styles.collectionGrid}>
          {collections.map((collection, index) => {
            const backgroundStyle =
              collection.cover?.startsWith("http") && collection.cover.includes("://")
                ? `url(${collection.cover})`
                : collection.cover;

            return (
              <Link
                key={collection.slug ?? index}
                className={styles.collectionCard}
                style={{ backgroundImage: backgroundStyle }}
                href={`/colecoes/${collection.slug}`}
              >
                <div className={styles.collectionContent}>
                  <h3>{collection.name}</h3>
                  <p>{collection.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <span className="pill">Quem vende</span>
            <h2>Fotógrafos em alta</h2>
            <p>
              Conheça quem já vende na GTClicks, descubra estilos e encontre referências
              para inspirar seus próximos projetos.
            </p>
          </div>
          <Link className={styles.sectionLink} href="/cadastro">
            Quero vender minhas fotos →
          </Link>
        </div>
        <div className={styles.photographerGrid}>
          {photographers.map((photographer) => (
            <Link
              key={photographer.username}
              className={styles.photographerCard}
              href={`/fotografo/${photographer.username}`}
            >
              <div className={styles.photographerAvatar}>
                {photographer.name
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div>
                <h3>{photographer.name}</h3>
                <p style={{ color: "var(--color-muted)", fontSize: "0.9rem" }}>
                  {photographer.city}
                </p>
                <div className={styles.tagRow}>
                  {(photographer.specialties ?? ["autorais"]).map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <span className="pill">Vantagens</span>
            <h2>Experiência pensada para você</h2>
            <p>
              Quem compra recebe arquivos originais protegidos. Quem vende acompanha
              tudo em tempo real.
            </p>
          </div>
        </div>
        <div className={styles.highlightGrid}>
          {highlights.map((item) => (
            <article key={item.title} className={styles.highlightCard}>
              <h3>{item.title}</h3>
              <p style={{ color: "var(--color-muted)" }}>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <span className="pill">Próximos passos</span>
            <h2>Escolha por onde começar</h2>
          </div>
        </div>
        <div className={styles.quickLinks}>
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href} className={styles.quickLinkCard}>
              <h3>{link.title}</h3>
              <p>{link.description}</p>
              <span>Continuar →</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
