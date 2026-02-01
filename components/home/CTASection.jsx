import { IconCard } from "@/components/shared/cards";

const defaultLinks = [
  {
    title: "Encontrar Evento",
    description: "Busque suas fotos do jogo ou festa",
    href: "/busca",
    icon: "🏃",
  },
  {
    title: "Começar a Vender",
    description: "Área exclusiva para fotógrafos",
    href: "/cadastro",
    icon: "📸",
  },
  {
    title: "Minhas Compras",
    description: "Acesse e baixe suas fotos",
    href: "/meus-downloads",
    icon: "📥",
  },
];

export default function CTASection({ links = defaultLinks }) {
  return (
    <section className="container-wide px-4 pb-12 md:px-6">
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-black p-6 sm:p-12 md:p-24 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

        <div className="relative z-10">
          <h2 className="mb-6 sm:mb-8 text-2xl sm:text-3xl md:text-5xl font-bold text-white">
            Pronto para começar?
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-3 max-w-4xl mx-auto mt-8 sm:mt-12">
            {links.map((link) => (
              <IconCard
                key={link.href}
                icon={link.icon}
                title={link.title}
                description={link.description}
                href={link.href}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
