import Link from 'next/link';

const defaultLinks = [
  {
    title: 'Coleções',
    description: 'Descubra álbuns completos',
    href: '/colecoes',
    icon: '📚'
  },
  {
    title: 'Buscar coleções',
    description: 'Filtre por tema, categoria ou cor',
    href: '/busca',
    icon: '🔍'
  },
  {
    title: 'Seja Fotógrafo',
    description: 'Comece a vender suas fotos',
    href: '/cadastro',
    icon: '📸'
  },
];

export default function CTASection({ links = defaultLinks }) {
  return (
    <section className="container-wide pb-12">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-black p-12 text-center md:p-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        
        <div className="relative z-10">
          <h2 className="mb-8 text-3xl font-bold text-white md:text-5xl">
            Pronto para começar?
          </h2>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 max-w-4xl mx-auto mt-12">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="group block">
                <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/5 bg-black/50 p-8 transition-all hover:border-primary/50 hover:bg-white/5 hover:-translate-y-1">
                  <span className="text-4xl mb-2 grayscale group-hover:grayscale-0 transition-all">{link.icon}</span>
                  <div className="space-y-2">
                    <h3 className="font-bold text-white text-lg">{link.title}</h3>
                    <p className="text-sm text-gray-400">{link.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
