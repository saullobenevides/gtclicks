import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";
import { PageSection, SectionHeader } from "@/components/shared/layout";
import { FeatureCard } from "@/components/shared/cards";

export default function CategoriesPage() {
  return (
    <PageSection variant="default" containerWide>
      <SectionHeader
        badge="Categorias"
        title="Explore por temas"
        description="Navegue por nossas categorias selecionadas e encontre exatamente o que você procura para o seu projeto."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {CATEGORIES.map((category) => (
          <Link
            key={category}
            href={`/busca?categoria=${category}`}
            className="group bg-card border rounded-md p-8 no-underline transition flex flex-col items-center justify-center text-center min-h-[200px] relative overflow-hidden hover:-translate-y-1 hover:border-accent hover:shadow-lg"
          >
            <div>
              <h2 className="text-2xl font-bold mb-4 text-heading">{category}</h2>
              <span className="text-accent font-medium opacity-0 transform translate-y-2 transition-all group-hover:opacity-100 group-hover:translate-y-0">Ver coleções &rarr;</span>
            </div>
          </Link>
        ))}
      </div>
    </PageSection>
  );
}
