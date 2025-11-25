import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-black pt-20 pb-10">
      <div className="container-wide">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4 lg:gap-16 mb-16">
          <div className="flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
                <span className="text-xl font-black">GT</span>
              </div>
              <span className="text-2xl font-black tracking-tighter text-white">
                CLICKS
              </span>
            </Link>
            <p className="text-base leading-relaxed text-muted-foreground max-w-xs">
              O marketplace definitivo para fotógrafos e criadores. Compre e venda fotos exclusivas com segurança e rapidez.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-white/50">
              Plataforma
            </h4>
            <ul className="flex flex-col gap-3 text-base text-muted-foreground">
              <li>
                <Link href="/busca" className="transition-colors hover:text-white hover:translate-x-1 inline-block">
                  Explorar Fotos
                </Link>
              </li>
              <li>
                <Link href="/colecoes" className="transition-colors hover:text-white hover:translate-x-1 inline-block">
                  Coleções
                </Link>
              </li>
              <li>
                <Link href="/categorias" className="transition-colors hover:text-white hover:translate-x-1 inline-block">
                  Categorias
                </Link>
              </li>
              <li>
                <Link href="/meus-favoritos" className="transition-colors hover:text-white hover:translate-x-1 inline-block">
                  Meus Favoritos
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-white/50">
              Fotógrafos
            </h4>
            <ul className="flex flex-col gap-3 text-base text-muted-foreground">
              <li>
                <Link href="/cadastro" className="transition-colors hover:text-white hover:translate-x-1 inline-block">
                  Começar a Vender
                </Link>
              </li>
              <li>
                <Link href="/dashboard/fotografo/upload" className="transition-colors hover:text-white hover:translate-x-1 inline-block">
                  Fazer Upload
                </Link>
              </li>
              <li>
                <Link href="/dashboard/fotografo/financeiro" className="transition-colors hover:text-white hover:translate-x-1 inline-block">
                  Painel Financeiro
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-white/50">
              Suporte
            </h4>
            <ul className="flex flex-col gap-3 text-base text-muted-foreground">
              <li>
                <Link href="/faq" className="transition-colors hover:text-white hover:translate-x-1 inline-block">
                  Perguntas Frequentes
                </Link>
              </li>
              <li>
                <Link href="/termos" className="transition-colors hover:text-white hover:translate-x-1 inline-block">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link href="/privacidade" className="transition-colors hover:text-white hover:translate-x-1 inline-block">
                  Privacidade
                </Link>
              </li>
              <li>
                <Link href="/contato" className="transition-colors hover:text-white hover:translate-x-1 inline-block">
                  Fale Conosco
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} GTClicks. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6">
            {/* Social icons could go here */}
            <span className="text-sm text-muted-foreground">Feito com ❤️ para criadores</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
